const Account = require('../models/account.model');
const Transaction = require('../models/transaction.model');
const nibss = require('../services/nibss.service');
const { sendTransactionEmail } = require('../services/email.service');
const crypto = require('crypto');

const generateReference = () =>
  `LYD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

// POST /api/transactions/transfer
const transfer = async (req, res) => {
  try {
    const { receiverAccountNumber, receiverBankCode, amount, narration } = req.body;
    const customer = req.customer;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || !isFinite(parsedAmount)) {
      return res.status(400).json({ success: false, message: 'Invalid amount.' });
    }
    const safeAmount = Math.round(parsedAmount * 100) / 100;
    if (safeAmount < 0.01) {
      return res.status(400).json({ success: false, message: 'Minimum transfer amount is ₦0.01.' });
    }

    if (!receiverAccountNumber || !/^\d{10}$/.test(receiverAccountNumber)) {
      return res.status(400).json({ success: false, message: 'Receiver account number must be exactly 10 digits.' });
    }

    const trimmedNarration = narration?.trim() || ''
    if (trimmedNarration.length > 100) {
      return res.status(400).json({ success: false, message: 'Narration must be 100 characters or fewer.' });
    }

    // Atomic debit — the conditional filter ensures balance >= amount without a separate read
    const senderAccount = await Account.findOneAndUpdate(
      { customer: customer._id, balance: { $gte: safeAmount } },
      { $inc: { balance: -safeAmount } },
      { new: false }
    );

    if (!senderAccount) {
      const accountExists = await Account.exists({ customer: customer._id });
      if (!accountExists) {
        return res.status(404).json({ success: false, message: 'Sender account not found.' });
      }
      return res.status(400).json({ success: false, message: 'Insufficient funds.' });
    }

    if (senderAccount.accountNumber === receiverAccountNumber) {
      await Account.findByIdAndUpdate(senderAccount._id, { $inc: { balance: safeAmount } });
      return res.status(400).json({ success: false, message: 'You cannot transfer funds to your own account.' });
    }

    const reference = generateReference();
    const balanceBefore = senderAccount.balance;
    const balanceAfterDebit = balanceBefore - safeAmount;
    const isInterBank = receiverBankCode && receiverBankCode !== process.env.BANK_CODE;

    let transaction;
    try {
      transaction = await Transaction.create({
        customer: customer._id,
        type: 'DEBIT',
        amount: safeAmount,
        senderAccount: senderAccount.accountNumber,
        receiverAccount: receiverAccountNumber,
        receiverBankCode: receiverBankCode || process.env.BANK_CODE,
        narration: trimmedNarration || 'Transfer',
        reference,
        status: 'PENDING',
        balanceBefore,
      });
    } catch {
      await Account.findByIdAndUpdate(senderAccount._id, { $inc: { balance: safeAmount } });
      return res.status(500).json({ success: false, message: 'Transfer failed. Please try again.' });
    }

    let nibssReference = null;

    if (isInterBank) {
      // Inter-bank transfers require NIBSS to succeed — refund on failure
      try {
        const nibssResult = await nibss.transferFunds({
          senderAccountNumber: senderAccount.accountNumber,
          receiverAccountNumber,
          receiverBankCode,
          amount: safeAmount,
          narration: trimmedNarration || 'Transfer',
          reference,
        });
        nibssReference = nibssResult?.data?.reference;
      } catch {
        await Account.findByIdAndUpdate(senderAccount._id, { $inc: { balance: safeAmount } });
        transaction.status = 'FAILED';
        transaction.balanceAfter = balanceBefore;
        await transaction.save();
        return res.status(502).json({
          success: false,
          message: 'Transfer failed: unable to reach payment network. Please try again.',
          data: { reference },
        });
      }
    } else {
      // Intra-bank: credit locally regardless of NIBSS outcome
      try {
        const nibssResult = await nibss.transferFunds({
          senderAccountNumber: senderAccount.accountNumber,
          receiverAccountNumber,
          receiverBankCode: process.env.BANK_CODE,
          amount: safeAmount,
          narration: trimmedNarration || 'Transfer',
          reference,
        });
        nibssReference = nibssResult?.data?.reference;
      } catch {
        nibssReference = null;
      }
    }

    if (!isInterBank) {
      const receiverAccount = await Account.findOneAndUpdate(
        { accountNumber: receiverAccountNumber },
        { $inc: { balance: safeAmount } },
        { new: false }
      ).populate('customer');

      if (receiverAccount) {
        const receiverBalanceBefore = receiverAccount.balance;

        await Transaction.create({
          customer: receiverAccount.customer._id,
          type: 'CREDIT',
          amount: safeAmount,
          senderAccount: senderAccount.accountNumber,
          receiverAccount: receiverAccountNumber,
          narration: trimmedNarration || 'Transfer',
          reference: `${reference}-CR`,
          nibssReference,
          status: 'SUCCESS',
          balanceBefore: receiverBalanceBefore,
          balanceAfter: receiverBalanceBefore + safeAmount,
        });

        sendTransactionEmail({
          to: receiverAccount.customer.email,
          firstName: receiverAccount.customer.firstName,
          type: 'CREDIT',
          amount: safeAmount,
          reference: `${reference}-CR`,
          counterpartAccount: senderAccount.accountNumber,
          narration: trimmedNarration || 'Transfer',
          balanceBefore: receiverBalanceBefore,
          balanceAfter: receiverBalanceBefore + safeAmount,
          date: new Date(),
        }).catch((err) => console.error('Credit email failed:', err.message));
      }
    }

    transaction.status = 'SUCCESS';
    transaction.nibssReference = nibssReference;
    transaction.balanceAfter = balanceAfterDebit;
    await transaction.save();

    sendTransactionEmail({
      to: customer.email,
      firstName: customer.firstName,
      type: 'DEBIT',
      amount: safeAmount,
      reference,
      counterpartAccount: receiverAccountNumber,
      narration: trimmedNarration || 'Transfer',
      balanceBefore,
      balanceAfter: balanceAfterDebit,
      date: new Date(),
    }).catch((err) => console.error('Debit email failed:', err.message));

    res.json({
      success: true,
      message: 'Transfer successful.',
      data: { reference, amount: safeAmount, newBalance: balanceAfterDebit },
    });
  } catch (error) {
    const msg = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : error.response?.data?.message || error.message;
    res.status(500).json({ success: false, message: msg });
  }
};

// GET /api/transactions/history
const getHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ customer: req.customer._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve transaction history.' });
  }
};

// GET /api/transactions/status/:reference
const getStatus = async (req, res) => {
  try {
    const { reference } = req.params;

    const localTx = await Transaction.findOne({ reference, customer: req.customer._id });
    if (!localTx) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    if (localTx.nibssReference) {
      try {
        const nibssResult = await nibss.getTransaction(localTx.nibssReference);
        return res.json({ success: true, data: { ...localTx.toObject(), nibssStatus: nibssResult?.data } });
      } catch {
        // NIBSS unreachable, fall through to local record
      }
    }
    return res.json({ success: true, data: localTx });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve transaction status.' });
  }
};

module.exports = { transfer, getHistory, getStatus };

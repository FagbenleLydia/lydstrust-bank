const { randomInt } = require('crypto');
const Account = require('../models/account.model');
const Customer = require('../models/customer.model');
const nibss = require('../services/nibss.service');

// POST /api/accounts/create
const createAccount = async (req, res) => {
  try {
    const customer = req.customer;

    if (!customer.isVerified) {
      return res.status(400).json({ success: false, message: 'You must verify your BVN or NIN before creating an account.' });
    }

    const existingAccount = await Account.findOne({ customer: customer._id });
    if (existingAccount) {
      return res.status(400).json({ success: false, message: 'You already have an account.' });
    }

    let accountNumber;
    try {
      const nibssResult = await nibss.createNibssAccount({
        kycType: customer.verificationMethod,
        kycID: customer.bvn || customer.nin,
        dob: customer.dateOfBirth,
      });
      accountNumber =
        nibssResult?.data?.accountNumber ||
        nibssResult?.accountNumber;
    } catch {
      // NIBSS sandbox doesn't always return an account number, so we generate one locally
      accountNumber = null;
    }

    if (!accountNumber) {
      let candidate;
      do {
        candidate = `415${randomInt(1_000_000, 9_999_999)}`;
      } while (await Account.findOne({ accountNumber: candidate }));
      accountNumber = candidate;
    }

    const accountName = `${customer.firstName} ${customer.lastName}`;

    const account = await Account.create({
      customer: customer._id,
      accountNumber,
      accountName,
      balance: 15000,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Pre-funded with ₦15,000.',
      data: account,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You already have an account.' });
    }
    res.status(500).json({ success: false, message: 'Account creation failed. Please try again.' });
  }
};

// GET /api/accounts/my-account
const getMyAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ customer: req.customer._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'No account found. Please create one.' });
    }
    res.json({ success: true, data: account });
  } catch {
    res.status(500).json({ success: false, message: 'Could not retrieve account.' });
  }
};

// GET /api/accounts/balance
const getBalance = async (req, res) => {
  try {
    const account = await Account.findOne({ customer: req.customer._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    try {
      const nibssBalance = await nibss.getAccountBalance(account.accountNumber);
      return res.json({ success: true, data: { accountNumber: account.accountNumber, accountName: account.accountName, balance: nibssBalance?.data?.balance ?? account.balance, currency: 'NGN' } });
    } catch {
      return res.json({ success: true, data: { accountNumber: account.accountNumber, accountName: account.accountName, balance: account.balance, currency: 'NGN' } });
    }
  } catch {
    res.status(500).json({ success: false, message: 'Could not retrieve balance.' });
  }
};

// GET /api/accounts/name-enquiry/:accountNumber
const nameEnquiry = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    if (!/^\d{10}$/.test(accountNumber)) {
      return res.status(400).json({ success: false, message: 'Account number must be exactly 10 digits.' });
    }

    // Local accounts won't exist on NIBSS, so check the DB first
    const localAccount = await Account.findOne({ accountNumber });
    if (localAccount) {
      return res.json({ success: true, data: { accountNumber, accountName: localAccount.accountName } });
    }

    const result = await nibss.nameEnquiry(accountNumber);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.response?.data?.message || 'Account not found.' });
  }
};

module.exports = { createAccount, getMyAccount, getBalance, nameEnquiry };

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  type: { type: String, enum: ['DEBIT', 'CREDIT'], required: true },
  amount: { type: Number, required: true, min: 0 },
  senderAccount: { type: String, required: true },
  receiverAccount: { type: String, required: true },
  receiverName: { type: String },
  receiverBankCode: { type: String },
  narration: { type: String },
  reference: { type: String, required: true, unique: true },
  nibssReference: { type: String },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  balanceBefore: { type: Number },
  balanceAfter: { type: Number },
}, { timestamps: true });

// Speeds up getHistory (find by customer, sort by date) and getStatus (find by reference + customer)
transactionSchema.index({ customer: 1, createdAt: -1 });
transactionSchema.index({ reference: 1, customer: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);

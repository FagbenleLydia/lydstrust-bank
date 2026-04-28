const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, unique: true },
  accountNumber: { type: String, required: true, unique: true },
  accountName: { type: String, required: true },
  balance: { type: Number, default: 15000, min: 0 },
  bankCode: { type: String, default: process.env.BANK_CODE || '415' },
  bankName: { type: String, default: process.env.BANK_NAME || 'LYD Bank' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  address: { type: String, required: true },
  bvn: { type: String, default: null },
  nin: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  verificationMethod: { type: String, enum: ['BVN', 'NIN', null], default: null },

}, { timestamps: true });

// Prevent two customers from claiming the same BVN or NIN
customerSchema.index({ bvn: 1 }, { unique: true, sparse: true });
customerSchema.index({ nin: 1 }, { unique: true, sparse: true });

customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

customerSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Customer', customerSchema);

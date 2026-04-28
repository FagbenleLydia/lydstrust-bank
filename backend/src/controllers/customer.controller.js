const Customer = require('../models/customer.model');
const nibss = require('../services/nibss.service');

// POST /api/customers/insert-bvn  (dev/test seeding only)
const insertBvn = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not found.' });
  }
  try {
    const { bvn, firstName, lastName, dateOfBirth, phone } = req.body;
    const result = await nibss.insertBvn({ bvn, firstName, lastName, dateOfBirth, phone });
    res.json({ success: true, message: 'BVN inserted successfully.', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.response?.data?.message || error.message });
  }
};

// POST /api/customers/verify-bvn
const verifyBvn = async (req, res) => {
  try {
    const { bvn } = req.body;
    const customer = req.customer;

    if (!bvn || !/^\d{11}$/.test(bvn)) {
      return res.status(400).json({ success: false, message: 'BVN must be exactly 11 digits.' });
    }

    if (customer.isVerified) {
      return res.status(400).json({ success: false, message: 'Customer already verified.' });
    }

    const bvnTaken = await Customer.findOne({ bvn, _id: { $ne: customer._id } });
    if (bvnTaken) {
      return res.status(400).json({ success: false, message: 'This BVN is already linked to another account.' });
    }

    const result = await nibss.validateBvn(bvn);

    customer.bvn = bvn;
    customer.isVerified = true;
    customer.verificationMethod = 'BVN';
    await customer.save();

    res.json({ success: true, message: 'BVN verified successfully. You can now create your account.', data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.response?.data?.message || 'BVN verification failed.' });
  }
};

// POST /api/customers/insert-nin  (dev/test seeding only)
const insertNin = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not found.' });
  }
  try {
    const { nin, firstName, lastName, dateOfBirth, phone } = req.body;
    const result = await nibss.insertNin({ nin, firstName, lastName, dateOfBirth, phone });
    res.json({ success: true, message: 'NIN inserted successfully.', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.response?.data?.message || error.message });
  }
};

// POST /api/customers/verify-nin
const verifyNin = async (req, res) => {
  try {
    const { nin } = req.body;
    const customer = req.customer;

    if (!nin || !/^\d{11}$/.test(nin)) {
      return res.status(400).json({ success: false, message: 'NIN must be exactly 11 digits.' });
    }

    if (customer.isVerified) {
      return res.status(400).json({ success: false, message: 'Customer already verified.' });
    }

    const ninTaken = await Customer.findOne({ nin, _id: { $ne: customer._id } });
    if (ninTaken) {
      return res.status(400).json({ success: false, message: 'This NIN is already linked to another account.' });
    }

    const result = await nibss.validateNin(nin);

    customer.nin = nin;
    customer.isVerified = true;
    customer.verificationMethod = 'NIN';
    await customer.save();

    res.json({ success: true, message: 'NIN verified successfully. You can now create your account.', data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.response?.data?.message || 'NIN verification failed.' });
  }
};

// GET /api/customers/profile
const getProfile = async (req, res) => {
  const { password, bvn, nin, __v, ...safeData } = req.customer.toObject();
  res.json({ success: true, data: safeData });
};

module.exports = { insertBvn, verifyBvn, insertNin, verifyNin, getProfile };

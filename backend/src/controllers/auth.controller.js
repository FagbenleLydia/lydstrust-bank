const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Customer = require('../models/customer.model');

// Always run bcrypt even when the email doesn't exist — skipping it leaks
// whether an email is registered via response timing.
const DUMMY_HASH = '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, dateOfBirth, address } = req.body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ success: false, message: 'First and last name are required.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }
    if (!phone?.trim() || phone.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'A valid phone number is required (minimum 10 characters).' });
    }
    if (!dateOfBirth || isNaN(new Date(dateOfBirth).getTime())) {
      return res.status(400).json({ success: false, message: 'A valid date of birth is required.' });
    }
    if (!address?.trim()) {
      return res.status(400).json({ success: false, message: 'Address is required.' });
    }

    const existing = await Customer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const customer = await Customer.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      phone: phone.trim(),
      password,
      dateOfBirth,
      address: address.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please complete verification to create your account.',
      data: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        isVerified: customer.isVerified,
        token: generateToken(customer._id),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const msg = process.env.NODE_ENV === 'production'
      ? 'Registration failed. Please try again.'
      : error.message;
    res.status(500).json({ success: false, message: msg });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    const isMatch = customer
      ? await customer.comparePassword(password)
      : await bcrypt.compare(password, DUMMY_HASH);

    if (!customer || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        isVerified: customer.isVerified,
        verificationMethod: customer.verificationMethod,
        token: generateToken(customer._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const { password, bvn, nin, __v, ...safeData } = req.customer.toObject();
  res.json({ success: true, data: safeData });
};

module.exports = { register, login, getMe };

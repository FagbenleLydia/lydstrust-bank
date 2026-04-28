require('dotenv').config();

// Fail fast if critical secrets are missing — prevents starting with a broken config
const REQUIRED_ENV = ['JWT_SECRET', 'MONGODB_URI', 'NIBSS_BASE_URL', 'NIBSS_API_KEY', 'NIBSS_API_SECRET'];
const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingEnv.length) {
  console.error(`[STARTUP] Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const accountRoutes = require('./routes/account.routes');
const transactionRoutes = require('./routes/transaction.routes');

const app = express();

connectDB();

// Security headers
app.use(helmet());

// Restrict CORS to known client origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser requests (Postman, server-to-server) and known origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' })); // Reject oversized payloads

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const transferLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { success: false, message: 'Too many transfer requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// KYC verification endpoints — tight limit since a real user only verifies once
const kycLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: 'Too many verification attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/customers/verify-bvn', kycLimiter);
app.use('/api/customers/verify-nin', kycLimiter);
app.use('/api/customers', customerRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions/transfer', transferLimiter);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'LydsTrust Bank API is running', bank: process.env.BANK_NAME });
});

// Global error handler — never leak stack traces in production
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred.'
    : err.message;
  res.status(status).json({ success: false, message });
});

const PORT = process.env.PORT || 5001; // matches vite.config.js proxy target
app.listen(PORT, () => {
  console.log(`LydsTrust Bank server running on port ${PORT}`);
});

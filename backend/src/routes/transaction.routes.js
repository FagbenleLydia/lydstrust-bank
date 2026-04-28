const express = require('express');
const router = express.Router();
const { transfer, getHistory, getStatus } = require('../controllers/transaction.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/transfer', protect, transfer);
router.get('/history', protect, getHistory);
router.get('/status/:reference', protect, getStatus);

module.exports = router;

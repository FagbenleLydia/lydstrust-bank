const express = require('express');
const router = express.Router();
const { createAccount, getMyAccount, getBalance, nameEnquiry } = require('../controllers/account.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/create', protect, createAccount);
router.get('/my-account', protect, getMyAccount);
router.get('/balance', protect, getBalance);
router.get('/name-enquiry/:accountNumber', protect, nameEnquiry);

module.exports = router;

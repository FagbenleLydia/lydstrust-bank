const express = require('express');
const router = express.Router();
const { insertBvn, verifyBvn, insertNin, verifyNin, getProfile } = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/insert-bvn', insertBvn);         // seed test BVN (no auth needed)
router.post('/insert-nin', insertNin);         // seed test NIN (no auth needed)
router.post('/verify-bvn', protect, verifyBvn);
router.post('/verify-nin', protect, verifyNin);
router.get('/profile', protect, getProfile);

module.exports = router;

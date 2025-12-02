const express = require('express');
const router = express.Router();
const { getPendingVerifications, verifyUser, rejectUser, getVerifiedUsers, getUserById } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/verifications', protect, admin, getPendingVerifications);
router.put('/verify/:id', protect, admin, verifyUser);
router.put('/reject/:id', protect, admin, rejectUser);
router.get('/verified-users', protect, admin, getVerifiedUsers);
router.get('/users/:id', protect, admin, getUserById);

module.exports = router;

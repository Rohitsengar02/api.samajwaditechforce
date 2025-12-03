const express = require('express');
const router = express.Router();
const { getPendingVerifications, verifyUser, rejectUser, getVerifiedUsers, getUserById, getPendingAdmins, approveAdmin, rejectAdmin, getApprovedAdmins } = require('../controllers/adminController');
const { protect, admin, masterAdmin } = require('../middleware/authMiddleware');

router.get('/verifications', protect, admin, getPendingVerifications);
router.put('/verify/:id', protect, admin, verifyUser);
router.put('/reject/:id', protect, admin, rejectUser);
router.get('/verified-users', protect, admin, getVerifiedUsers);
router.get('/users/:id', protect, admin, getUserById);

// Master Admin Routes
router.get('/pending-admins', protect, masterAdmin, getPendingAdmins);
router.put('/approve-admin/:id', protect, masterAdmin, approveAdmin);
router.delete('/reject-admin/:id', protect, masterAdmin, rejectAdmin);
router.get('/approved-admins', protect, masterAdmin, getApprovedAdmins);

module.exports = router;

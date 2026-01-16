const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUserProfile, updateUserProfile, requestVerification, updateLanguage, getLeaderboard, registerAdmin, sendOTP, verifyOTP, googleLogin, getAllUsers, deleteUser, updateUser, checkUserExists, getVerifiedMembers, getReferralStats, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', authUser);
router.post('/google', googleLogin);
router.post('/check-exists', checkUserExists);
router.post('/register', registerUser);
router.post('/register-admin', registerAdmin);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/verification-request').put(protect, requestVerification);
router.route('/update-language').put(protect, updateLanguage);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/referral-stats', protect, admin, getReferralStats);
router.get('/all', protect, admin, getAllUsers);
router.delete('/delete/:id', protect, admin, deleteUser);
router.put('/update/:id', protect, admin, updateUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);

// Public route for verified members (for volunteers page)
router.get('/verified-members', getVerifiedMembers);

module.exports = router;

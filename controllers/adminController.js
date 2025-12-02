const User = require('../models/User');

// @desc    Get pending verifications
// @route   GET /api/admin/verifications
// @access  Private/Admin
const getPendingVerifications = async (req, res) => {
    try {
        const users = await User.find({ verificationStatus: 'Pending' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify user
// @route   PUT /api/admin/verify/:id
// @access  Private/Admin
const verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.verificationStatus = 'Verified';
            user.adminVerification = true;
            user.mindset = req.body.mindset || user.mindset;
            user.whatsappGroupAdded = req.body.whatsappGroupAdded || user.whatsappGroupAdded;

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject verification
// @route   PUT /api/admin/reject/:id
// @access  Private/Admin
const rejectUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.verificationStatus = 'Rejected';
            user.adminVerification = false;

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// @desc    Get verified users
// @route   GET /api/admin/verified-users
// @access  Private/Admin
const getVerifiedUsers = async (req, res) => {
    try {
        const users = await User.find({ verificationStatus: 'Verified' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPendingVerifications, verifyUser, rejectUser, getVerifiedUsers, getUserById };

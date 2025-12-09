const User = require('../models/User');
const AdminApproval = require('../models/AdminApproval');

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

// @desc    Get pending admin approvals
// @route   GET /api/admin/pending-admins
// @access  Private/MasterAdmin
const getPendingAdmins = async (req, res) => {
    try {
        const requests = await AdminApproval.find({}).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve admin
// @route   PUT /api/admin/approve-admin/:id
// @access  Private/MasterAdmin
const approveAdmin = async (req, res) => {
    try {
        const request = await AdminApproval.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Create User
        const user = await User.create({
            name: request.name,
            email: request.email,
            phone: request.phone,
            password: request.password, // Already hashed
            role: 'admin',
            adminVerification: true,
            verificationStatus: 'Verified'
        });

        if (user) {
            // Remove from AdminApproval
            await AdminApproval.findByIdAndDelete(req.params.id);
            res.json({ message: 'Admin approved successfully', user });
        } else {
            res.status(400).json({ message: 'Failed to create user' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject admin
// @route   DELETE /api/admin/reject-admin/:id
// @access  Private/MasterAdmin
const rejectAdmin = async (req, res) => {
    try {
        const request = await AdminApproval.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        await AdminApproval.findByIdAndDelete(req.params.id);
        res.json({ message: 'Admin request rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get approved admins
// @route   GET /api/admin/approved-admins
// @access  Private/MasterAdmin
const getApprovedAdmins = async (req, res) => {
    try {
        // Get only 'admin' role users (not 'master-admin'), who are verified
        const users = await User.find({
            role: 'admin',
            adminVerification: true,
            verificationStatus: 'Verified'
        }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete admin
// @route   DELETE /api/admin/delete/:id
// @access  Private/MasterAdmin
const deleteAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Prevent deletion of master-admin
        if (user.role === 'master-admin') {
            return res.status(403).json({ message: 'Cannot delete master admin' });
        }

        // Delete the user
        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPendingVerifications, verifyUser, rejectUser, getVerifiedUsers, getUserById, getPendingAdmins, approveAdmin, rejectAdmin, getApprovedAdmins, deleteAdmin };

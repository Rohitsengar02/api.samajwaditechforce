const User = require('../models/User');
const AdminApproval = require('../models/AdminApproval');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    const user = await User.findOne({ email });

    if (!user) {
        console.log('❌ User not found:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ User found:', {
        email: user.email,
        role: user.role,
        adminVerification: user.adminVerification,
        verificationStatus: user.verificationStatus
    });

    const passwordMatch = await user.matchPassword(password);
    console.log('🔑 Password match:', passwordMatch);

    if (user && passwordMatch) {
        // Check for Admin Verification - must be verified and approved
        if (user.role === 'admin' && (user.verificationStatus !== 'Verified' || !user.adminVerification)) {
            console.log('⏳ Admin not verified yet');
            return res.status(403).json({ message: 'Your account is pending approval by Master Admin.' });
        }

        console.log('✅ Login successful for:', email);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            points: user.points || 0,
            token: generateToken(user._id),
        });
    } else {
        console.log('❌ Invalid password for:', email);
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user (Admin only initially)
// @route   POST /api/auth/register
// @access  Public (should be protected in production)
const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, role, gender, dob, profileImage, address, location } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { phone }] });

        if (userExists) {
            res.status(400).json({ message: 'User already exists with this email or phone' });
            return;
        }

        // Default adminVerification to false for admins, true for others (or handle logic as needed)
        // If role is admin, they need approval.
        const adminVerification = role === 'admin' ? false : true;
        // Note: Master Admin is seeded, so we don't register them here usually.

        const user = await User.create({
            name,
            email,
            phone,
            password,
            role,
            gender,
            dob,
            profileImage,
            address,
            location,
            adminVerification
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                points: user.points || 0,
                token: generateToken(user._id),
                message: role === 'admin' ? 'Registration successful. Please wait for Master Admin approval.' : 'Registration successful'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            gender: user.gender,
            dob: user.dob,
            profileImage: user.profileImage,
            address: user.address,
            location: user.location,
            district: user.district,
            vidhanSabha: user.vidhanSabha,
            isPartyMember: user.isPartyMember,
            partyRole: user.partyRole,
            partyJoiningDate: user.partyJoiningDate,
            socialMedia: user.socialMedia,
            qualification: user.qualification,
            canVisitLucknow: user.canVisitLucknow,
            verificationStatus: user.verificationStatus,
            adminVerification: user.adminVerification,
            language: user.language,
            points: user.points || 0,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.gender = req.body.gender || user.gender;
        user.dob = req.body.dob || user.dob;
        user.profileImage = req.body.profileImage || user.profileImage;
        user.address = req.body.address || user.address;
        user.location = req.body.location || user.location;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            gender: updatedUser.gender,
            dob: updatedUser.dob,
            profileImage: updatedUser.profileImage,
            address: updatedUser.address,
            location: updatedUser.location,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Request verification
// @route   PUT /api/auth/verification-request
// @access  Private
const requestVerification = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.district = req.body.district || user.district;
        user.vidhanSabha = req.body.vidhanSabha || user.vidhanSabha;
        user.isPartyMember = req.body.isPartyMember || user.isPartyMember;
        user.partyRole = req.body.partyRole || user.partyRole;
        user.partyJoiningDate = req.body.partyJoiningDate || user.partyJoiningDate;
        user.socialMedia = req.body.socialMedia || user.socialMedia;
        user.qualification = req.body.qualification || user.qualification;
        user.canVisitLucknow = req.body.canVisitLucknow || user.canVisitLucknow;

        user.verificationStatus = 'Pending';

        const updatedUser = await user.save();

        res.json({
            message: 'Verification request submitted',
            user: updatedUser
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user language
// @route   PUT /api/auth/update-language
// @access  Private
const updateLanguage = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.language = req.body.language || user.language;
        await user.save();
        res.json({ message: 'Language updated', language: user.language });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get leaderboard
// @route   GET /api/auth/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
    try {
        const users = await User.find({})
            .sort({ points: -1 })
            .limit(50)
            .select('name profileImage district points');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Register a new admin (pending approval)
// @route   POST /api/auth/register-admin
// @access  Public
const registerAdmin = async (req, res) => {
    const { name, email, phone, password } = req.body;
    console.log('Register Admin Request:', { name, email, phone });

    try {
        // Check if user exists in User collection
        const userExists = await User.findOne({ $or: [{ email }, { phone }] });
        if (userExists) {
            console.log('Register Admin Failed: User exists in User collection');
            return res.status(400).json({ message: 'User already exists as a registered member/admin' });
        }

        // Check if user exists in AdminApproval collection
        const approvalExists = await AdminApproval.findOne({ $or: [{ email }, { phone }] });
        if (approvalExists) {
            console.log('Register Admin Failed: Request exists in AdminApproval collection');
            return res.status(400).json({ message: 'Registration request already pending' });
        }

        // ⚠️ IMPORTANT: Store password as PLAIN TEXT in AdminApproval
        // It will be hashed when moved to User collection on approval
        const adminRequest = await AdminApproval.create({
            name,
            email,
            phone,
            password: password, // Store plain password - will be hashed by User model on approval
            role: 'admin'
        });

        console.log('Register Admin Success:', adminRequest._id);

        res.status(201).json({
            message: 'Registration successful. Please wait for Master Admin approval.',
            request: {
                _id: adminRequest._id,
                name: adminRequest.name,
                email: adminRequest.email
            }
        });
    } catch (error) {
        console.error('Register Admin Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { authUser, registerUser, getUserProfile, updateUserProfile, requestVerification, updateLanguage, getLeaderboard, registerAdmin };

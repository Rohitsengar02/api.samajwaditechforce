const User = require('../models/User');
const Member = require('../models/Member');
const AdminApproval = require('../models/AdminApproval');
const PointActivity = require('../models/PointActivity');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Resend } = require('resend');

// Initialize Resend with API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to handle referral points for the REFERRER
const handleReferral = async (newUser, referralCode) => {
    if (!referralCode) return null;
    let cleanCode = referralCode.trim().toUpperCase();

    // Auto-fix: If user entered 6 chars without SP, add it
    if (cleanCode.length === 6 && !cleanCode.startsWith('SP')) {
        cleanCode = 'SP' + cleanCode;
    }

    console.log(`🔍 Processing referral: ${cleanCode} for new user: ${newUser.name}`);

    try {
        const referrer = await User.findOne({ referralCode: cleanCode });

        if (!referrer) {
            console.log(`⚠️ Referral failed: No user found with code ${cleanCode}`);
            return null;
        }

        if (referrer._id.toString() === newUser._id.toString()) {
            console.log(`🚫 Referral failed: Self-referral detected.`);
            return null;
        }

        // 1. Reward Referrer (+50 points)
        referrer.points = (referrer.points || 0) + 50;
        await referrer.save();

        await PointActivity.create({
            user: referrer._id,
            username: referrer.name,
            activityType: 'referral_bonus',
            points: 50,
            description: `Referral bonus for inviting ${newUser.name}`,
            relatedId: newUser._id
        });

        console.log(`🎁 Success: ${referrer.name} earned 50 points for referring ${newUser.name}`);
        return cleanCode; // Return the valid code used
    } catch (error) {
        console.error('❌ Referral helper error:', error);
        return null;
    }
};

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

        if (!user.referralCode) {
            user.referralCode = `SP${user._id.toString().substring(0, 6).toUpperCase()}`;
            await user.save();
        }

        console.log('✅ Login successful for:', email);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            points: user.points || 0,
            referralCode: user.referralCode,
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
        const { name, email, phone, password, role, gender, dob, profileImage, profileImageNoBg, address, location } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { phone }] });

        if (userExists) {
            res.status(400).json({ message: 'User already exists with this email or phone' });
            return;
        }

        // Default adminVerification to false for admins, true for others (or handle logic as needed)
        // If role is admin, they need approval.
        const adminVerification = role === 'admin' ? false : true;
        // Note: Master Admin is seeded, so we don't register them here usually.

        const user = new User({
            name,
            email,
            phone,
            password,
            role,
            gender,
            dob,
            profileImage,
            profileImageNoBg,
            address,
            location,
            adminVerification
        });

        // Initial save to ensure user has an ID and exists in DB
        await user.save();

        // Handle referral points if code exists
        if (req.body.referralCode) {
            const validCode = await handleReferral(user, req.body.referralCode);
            if (validCode) {
                // Reward the NEW USER (+10 points)
                user.points = (user.points || 0) + 10;
                user.referredBy = validCode;
                await user.save(); // Save the points and referral info

                await PointActivity.create({
                    user: user._id,
                    username: user.name,
                    activityType: 'referral_bonus',
                    points: 10,
                    description: `Welcome bonus for using referral code: ${validCode}`
                });
                console.log(`✨ New user ${user.name} rewarded with 10 bonus points!`);
            }
        }

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                points: user.points || 0,
                referralCode: user.referralCode,
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
            profileImageNoBg: user.profileImageNoBg,
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
            referralCode: user.referralCode || `SP${user._id.toString().substring(0, 6).toUpperCase()}`,
        });

        // Background save if code was missing
        if (!user.referralCode) {
            user.referralCode = `SP${user._id.toString().substring(0, 6).toUpperCase()}`;
            await user.save();
        }
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
        // Update fields (allowing empty strings if sent)
        user.name = req.body.name !== undefined ? req.body.name : user.name;
        user.email = req.body.email !== undefined ? req.body.email : user.email;
        user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
        user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
        user.dob = req.body.dob !== undefined ? req.body.dob : user.dob;
        user.profileImage = req.body.profileImage !== undefined ? req.body.profileImage : user.profileImage;
        user.profileImageNoBg = req.body.profileImageNoBg !== undefined ? req.body.profileImageNoBg : user.profileImageNoBg;
        user.address = req.body.address !== undefined ? req.body.address : user.address;
        user.location = req.body.location !== undefined ? req.body.location : user.location;

        if (req.body.password) {
            user.password = req.body.password;
        }

        // Handle referral points for Google users on first profile completion
        if (req.body.referralCode && !user.referredBy) {
            const validCode = await handleReferral(user, req.body.referralCode);
            if (validCode) {
                user.points = (user.points || 0) + 10;
                user.referredBy = validCode;

                await PointActivity.create({
                    user: user._id,
                    username: user.name,
                    activityType: 'referral_bonus',
                    points: 10,
                    description: `Welcome bonus for using referral code: ${validCode}`
                });
                console.log(`✨ Google user ${user.name} rewarded with 10 bonus points!`);
            }
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
            district: updatedUser.district,
            vidhanSabha: updatedUser.vidhanSabha,
            isPartyMember: updatedUser.isPartyMember,
            partyRole: updatedUser.partyRole,
            partyJoiningDate: updatedUser.partyJoiningDate,
            socialMedia: updatedUser.socialMedia,
            qualification: updatedUser.qualification,
            canVisitLucknow: updatedUser.canVisitLucknow,
            verificationStatus: updatedUser.verificationStatus,
            adminVerification: updatedUser.adminVerification,
            language: updatedUser.language,
            points: updatedUser.points || 0,
            referralCode: updatedUser.referralCode,
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
    try {
        console.log('📝 Verification Request:', req.user._id, req.body);
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
            user.electionPreparation = req.body.electionPreparation || user.electionPreparation;

            user.verificationStatus = 'Pending';

            const updatedUser = await user.save();

            console.log('✅ Verification Saved');
            res.json({
                message: 'Verification request submitted',
                user: updatedUser
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('❌ Verification Error:', error);
        res.status(500).json({ message: 'Server Validation Error', error: error.message });
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
        // Fetch Users (Members/Admins)
        const users = await User.find({})
            .select('name profileImage district points role')
            .lean();

        // Fetch Volunteers
        const mongoose = require('mongoose');
        const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', new mongoose.Schema({}, { strict: false }), 'volunteers');

        const volunteers = await Volunteer.find({}).lean();

        // Normalize Volunteers to match Leaderboard structure
        const normalizedVolunteers = volunteers.map(v => ({
            _id: v._id,
            name: v.name || v.fullName || v.Name || v.firstName || 'Volunteer',
            profileImage: v.profileImage,
            district: v.district || v.District || v["जिला "] || 'Unknown District',
            points: v.points || 0,
            role: 'Volunteer'
        }));

        // Combine
        const allParticipants = [...users, ...normalizedVolunteers];

        // Sort by Points (Descending)
        allParticipants.sort((a, b) => (b.points || 0) - (a.points || 0));

        // Return All (User requested "show all")
        res.json(allParticipants);
    } catch (error) {
        console.error('Leaderboard Error:', error);
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

// @desc    Send OTP to mobile number using Fast2SMS
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    // Clean phone number (remove +91, spaces, etc.)
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (cleanPhone.length !== 10) {
        return res.status(400).json({ message: 'Invalid phone number format' });
    }

    try {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Set OTP expiry (5 minutes from now)
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        // Find user by phone or create temp OTP records
        let user = await User.findOne({ phone: cleanPhone });

        if (user) {
            // Update existing user with OTP
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();
        } else {
            // Create temporary user record with OTP (will be completed during registration)
            // If name/email/password are provided (e.g. from Desktop Register), use them
            user = await User.create({
                phone: cleanPhone,
                otp,
                otpExpiry,
                name: req.body.name || 'Temp User',
                email: req.body.email || `temp_${cleanPhone}@temp.com`,
                password: req.body.password || 'temppassword123'
            });
        }

        // Send OTP via Fast2SMS
        // Using dotenv config at top of file safeguards this, but we fallback just in case
        const Fast2SMS_API_KEY = process.env.OTP_SECRET;

        if (!Fast2SMS_API_KEY) {
            console.error('❌ OTP_SECRET is missing in .env file');
        }

        console.log('Sending OTP via Fast2SMS...');
        // console.log('Key Prefix:', Fast2SMS_API_KEY ? Fast2SMS_API_KEY.substring(0, 5) + '...' : 'None');

        const message = `Your OTP for Samajwadi Tech Force registration is: ${otp}. Valid for 5 minutes.`;

        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
                'authorization': Fast2SMS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                route: 'v3',
                sender_id: 'TXTIND',
                message,
                language: 'english',
                flash: 0,
                numbers: cleanPhone
            })
        });

        const responseText = await response.text();
        console.log('Fast2SMS Raw Response:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse Fast2SMS response:', e);
            throw new Error(`Fast2SMS returned non-JSON response: ${responseText}`);
        }

        if (data.return === true || data.status_code === '200') {
            console.log('✅ OTP sent successfully to:', cleanPhone);
            res.json({
                success: true,
                message: 'OTP sent successfully',
                phone: cleanPhone
            });
        } else {
            console.error('❌ Fast2SMS Error:', data);
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again. ' + (data.message || '')
            });
        }
    } catch (error) {
        console.error('❌ Send OTP Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending OTP',
            error: error.message
        });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    try {
        // Find user with matching phone and OTP
        const user = await User.findOne({ phone: cleanPhone });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please request OTP first.'
            });
        }

        // Check if OTP matches
        if (user.otp !== otp) {
            return res.status(401).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check if OTP has expired
        if (user.otpExpiry && new Date() > new Date(user.otpExpiry)) {
            return res.status(401).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // OTP verified successfully
        // Clear OTP from database
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        console.log('✅ OTP verified successfully for:', cleanPhone);

        res.json({
            success: true,
            message: 'OTP verified successfully',
            user: {
                _id: user._id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                isNewUser: user.email?.includes('@temp.com') // Check if user needs to complete registration
            },
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('❌ Verify OTP Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP',
            error: error.message
        });
    }
};

// @desc    Google Login/Register
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    const { email, name, photo, googleId } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists - Log them in
            console.log('✅ Google Login - User found:', email);
            const loginResp = {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                points: user.points || 0,
                referralCode: user.referralCode || `SP${user._id.toString().substring(0, 6).toUpperCase()}`,
                token: generateToken(user._id),
                profileImage: user.profileImage
            };
            console.log('📤 Sending Login Response');
            res.json(loginResp);

            // Background save if code was missing
            if (!user.referralCode) {
                try {
                    console.log('ℹ️ Generating missing referral code');
                    user.referralCode = `SP${user._id.toString().substring(0, 6).toUpperCase()}`;
                    await user.save();
                    console.log('✅ Referral code saved');
                } catch (err) {
                    console.error('⚠️ Background referral save failed:', err.message);
                }
            }
        } else {
            // User doesn't exist - Register them
            console.log('🆕 Google Login - Creating new user:', email);

            // Generate a random password for Google users
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            user = await User.create({
                name,
                email,
                phone: `G-${Date.now()}`, // Placeholder phone since it's required
                password: randomPassword, // Secure random password
                profileImage: photo,
                role: 'member', // Default role matching enum
                isGoogleUser: true, // Flag to identify google users
                adminVerification: true // Auto-verify regular users
            });

            console.log('👤 User created:', user._id);

            if (user) {
                const regResp = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    points: user.points || 0,
                    referralCode: user.referralCode,
                    token: generateToken(user._id),
                    profileImage: user.profileImage,
                    isNewUser: true // Explicitly flag as new user for frontend flow
                };
                console.log('📤 Sending Registration Response');
                res.status(201).json(regResp);
            } else {
                res.status(400).json({ message: 'Invalid user data' });
            }
        }
    } catch (error) {
        console.error('❌ Google Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/all
// @access  Private/Admin
const mongoose = require('mongoose');

// @desc    Get all users (Admin only)
// @route   GET /api/auth/all
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        console.log('Fetching users and volunteers...');

        // Fetch App Users
        const users = await User.find({})
            .sort({ createdAt: -1 })
            .select('-password')
            .lean();
        console.log(`Found ${users.length} app users`);

        // Fetch Volunteers from 'volunteers' collection explicitly
        // Define model dynamically if not exists, targeting 'volunteers' collection
        const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', new mongoose.Schema({}, { strict: false }), 'volunteers');

        const volunteers = await Volunteer.find({}).lean();
        console.log(`Found ${volunteers.length} volunteers in DB`);

        // Normalize Volunteer data (handling various possible field names)
        const normalizedVolunteers = volunteers.map(v => ({
            _id: v._id,
            name: v.name || v.fullName || v.Name || v.firstName || 'Volunteer',
            email: v.email || '',
            phone: v.phone || v.mobile || v.mobileNumber || v.Mobile || '',
            role: 'Volunteer',
            verificationStatus: v.status || (v.isVerified ? 'Verified' : 'Unverified'),
            createdAt: v.createdAt || v.date || new Date(), // Fallback
            profileImage: v.profileImage,
            isVolunteer: true
        }));

        // Combine and Sort by Newest First
        const allData = [...users, ...normalizedVolunteers].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });

        res.json(allData);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete user or volunteer
// @route   DELETE /api/auth/delete/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const { id } = req.params;
    const { type } = req.query; // 'volunteer' or 'user' (default)

    try {
        if (type === 'volunteer') {
            const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', new mongoose.Schema({}, { strict: false }), 'volunteers');
            await Volunteer.findByIdAndDelete(id);
        } else {
            await User.findByIdAndDelete(id);
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user or volunteer
// @route   PUT /api/auth/update/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { type } = req.query;
    const updates = req.body;

    try {
        let updatedUser;
        if (type === 'volunteer') {
            const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', new mongoose.Schema({}, { strict: false }), 'volunteers');

            // Map frontend fields to backend fields for Volunteer
            const dbUpdates = { ...updates };
            if (updates.name) dbUpdates.fullName = updates.name;
            if (updates.phone) dbUpdates.mobileNumber = updates.phone;
            if (updates.verificationStatus) dbUpdates.status = updates.verificationStatus;

            // Ensure we don't accidentally overwrite with undefined if not provided
            // Just spreading updates is risky if keys don't match, but strict:false allows flexible keys.
            // We explicit map common ones to ensure UI shows them correctly next fetch.

            updatedUser = await Volunteer.findByIdAndUpdate(id, dbUpdates, { new: true });
        } else {
            updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
        }
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Check if email/phone exists
// @route   POST /api/auth/check-exists
// @access  Public
const checkUserExists = async (req, res) => {
    const { email, phone } = req.body;
    try {
        const query = [];
        if (email) query.push({ email });
        if (phone) query.push({ phone });

        if (query.length === 0) {
            return res.status(400).json({ message: 'Email or Phone required' });
        }

        const user = await User.findOne({ $or: query });

        if (user) {
            res.json({ exists: true, message: 'User already exists' });
        } else {
            res.json({ exists: false, message: 'Available' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get verified members (Public)
// @route   GET /api/auth/verified-members
// @access  Public
const getVerifiedMembers = async (req, res) => {
    try {
        console.log('Fetching verified members...');

        const users = await User.find({ verificationStatus: 'Verified' })
            .select('name email phone profileImage address createdAt verificationStatus role district vidhanSabha')
            .sort({ createdAt: -1 })
            .lean();

        console.log(`Found ${users.length} verified members`);

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching verified members:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get referral statistics (Admin)
// @route   GET /api/auth/referral-stats
// @access  Private/Admin
const getReferralStats = async (req, res) => {
    try {
        console.log('Fetching referral statistics...');

        // Get all users who have referred someone (referrers)
        // A user is a referrer if someone else has their referralCode as referredBy
        const allUsers = await User.find({})
            .select('name email phone profileImage referralCode referredBy points createdAt')
            .lean();

        // Build referrer stats
        const referrerMap = {};
        const referredUsers = [];

        allUsers.forEach(user => {
            // Track referred users (users who came via referral)
            if (user.referredBy) {
                referredUsers.push({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    referredBy: user.referredBy,
                    joinedAt: user.createdAt
                });

                // Count referrals for the referrer
                if (!referrerMap[user.referredBy]) {
                    referrerMap[user.referredBy] = {
                        referralCode: user.referredBy,
                        referralCount: 0,
                        referredNames: []
                    };
                }
                referrerMap[user.referredBy].referralCount++;
                referrerMap[user.referredBy].referredNames.push(user.name);
            }
        });

        // Build referrers list with user details
        const referrers = [];
        for (const code of Object.keys(referrerMap)) {
            const referrer = allUsers.find(u => u.referralCode === code);
            if (referrer) {
                referrers.push({
                    _id: referrer._id,
                    name: referrer.name,
                    email: referrer.email,
                    phone: referrer.phone,
                    referralCode: referrer.referralCode,
                    points: referrer.points || 0,
                    totalReferrals: referrerMap[code].referralCount,
                    pointsEarned: referrerMap[code].referralCount * 50, // 50 points per referral
                    referredNames: referrerMap[code].referredNames
                });
            }
        }

        // Sort referrers by total referrals (descending)
        referrers.sort((a, b) => b.totalReferrals - a.totalReferrals);

        // Sort referred users by join date (newest first)
        referredUsers.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));

        console.log(`Found ${referrers.length} referrers and ${referredUsers.length} referred users`);

        res.json({
            success: true,
            referrers,
            referredUsers,
            stats: {
                totalReferrers: referrers.length,
                totalReferred: referredUsers.length,
                totalPointsAwarded: referrers.reduce((sum, r) => sum + r.pointsEarned, 0)
            }
        });
    } catch (error) {
        console.error('Error fetching referral stats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Forgot Password - Send Reset Link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    console.log('➡️ Forgot Password Controller HIT with email:', req.body.email);
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate Reset Token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash and set to resetPasswordToken
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire (10 minutes)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Create reset URL
        // Determining frontend URL based on origin or default
        const frontendUrl = req.headers.origin || 'http://localhost:8081';

        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        console.log('---------------------------------------------------');
        console.log('🔑 PASSWORD RESET REQUESTED');
        console.log('📧 To:', user.email);
        console.log('🔗 Link:', resetUrl);
        console.log('👤 Sender Config:', process.env.EMAIL_USER || 'Not Set');
        console.log('---------------------------------------------------');

        const message = `
            You have requested a password reset.
            Please go to this link to reset your password:
            \n\n
            ${resetUrl}
            \n\n
            If you did not request this, please ignore this email.
        `;

        try {
            // Using Resend for reliable email delivery
            console.log('📧 Attempting to send email via Resend...');

            const emailResponse = await resend.emails.send({
                from: 'Samajwadi Tech Force <admin@samajwaditechforce.com>',
                to: user.email,
                subject: 'Password Reset Request',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2>Password Reset Request</h2>
                        <p>You have requested a password reset for your Samajwadi Tech Force account.</p>
                        <p>Please click the button below to reset your password:</p>
                        <a href="${resetUrl}" style="background-color: #E30613; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                        <p style="margin-top: 20px;">Or copy this link:</p>
                        <p>${resetUrl}</p>
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">If you did not request this, please ignore this email.</p>
                    </div>
                `
            });

            if (emailResponse.error) {
                throw new Error(emailResponse.error.message);
            }

            console.log('✅ Email successfully sent via Resend:', emailResponse);
            res.json({ success: true, message: 'Email sent successfully codes' });

        } catch (error) {
            console.error('❌ EMAIL SENDING FAILED:', error);
            console.log('---------------------------------------------------');
            console.log('⚠️ FALLBACK: USE THIS LINK TO RESET PASSWORD:');
            console.log('🔗 Link:', resetUrl);
            console.log('---------------------------------------------------');

            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            // Return actual error and fallback instructions
            return res.status(500).json({
                message: 'Email service error. Check server logs for manual reset link.',
                error: error.message
            });
        }
    } catch (error) {
        console.error('❌ Forgot Password Fatal Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({
            success: true,
            message: 'Password Updated Success',
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { authUser, registerUser, getUserProfile, updateUserProfile, requestVerification, updateLanguage, getLeaderboard, registerAdmin, sendOTP, verifyOTP, googleLogin, getAllUsers, deleteUser, updateUser, checkUserExists, getVerifiedMembers, getReferralStats, forgotPassword, resetPassword };



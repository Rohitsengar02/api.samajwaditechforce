const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
    },
    dob: {
        type: String,
    },
    profileImage: {
        type: String,
    },
    profileImageNoBg: {
        type: String,
    },
    role: {
        type: String,
        enum: ['master-admin', 'admin', 'sub-admin', 'moderator', 'member'],
        default: 'member',
    },
    address: {
        type: mongoose.Schema.Types.Mixed,
    },
    location: {
        lat: Number,
        lng: Number,
    },
    district: String,
    vidhanSabha: String,
    isPartyMember: { type: String, enum: ['Yes', 'No'] },
    partyRole: String,
    partyJoiningDate: String,
    socialMedia: [String],
    qualification: String,
    canVisitLucknow: { type: String, enum: ['Yes', 'No'] },
    mindset: String,
    whatsappGroupAdded: { type: String, enum: ['Yes', 'No'] },
    verificationStatus: {
        type: String,
        enum: ['Not Applied', 'Pending', 'Verified', 'Rejected'],
        default: 'Not Applied'
    },
    adminVerification: {
        type: Boolean,
        default: false
    },
    language: {
        type: String,
        default: 'en'
    },
    points: {
        type: Number,
        default: 0
    },
    referralCode: {
        type: String,
        unique: true,
        lazy: true,
    },
    referredBy: {
        type: String,
    },
    // OTP fields for mobile verification
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    // Generate referral code if it doesn't exist
    if (!this.referralCode) {
        this.referralCode = `SP${this._id.toString().substring(0, 6).toUpperCase()}`;
    }

    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;

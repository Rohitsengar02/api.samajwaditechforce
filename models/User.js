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

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;

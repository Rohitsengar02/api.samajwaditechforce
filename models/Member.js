const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    fatherName: { type: String },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    mobileNumber: { type: String, required: true, unique: true },
    whatsappNumber: { type: String },
    email: { type: String },
    address: { type: String },
    district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
    assembly: { type: String },
    boothNumber: { type: String },
    role: { type: String, default: 'Member' }, // Member, Volunteer, District Head, etc.
    status: { type: String, enum: ['Pending', 'Verified', 'Suspended'], default: 'Pending' },
    profileImage: { type: String },
    idCardNumber: { type: String, unique: true },
    joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);

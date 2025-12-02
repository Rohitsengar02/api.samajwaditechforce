const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }, // Reference to Member if linked
    headName: { type: String }, // Direct name input
    headPhone: { type: String },
    headEmail: { type: String },
    assemblies: [{ type: String }], // List of assembly names
    assemblyCount: { type: Number, default: 0 }, // Total count
    totalMembers: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('District', districtSchema);

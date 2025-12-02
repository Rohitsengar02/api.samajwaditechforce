const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['Social Media', 'Field Work', 'Event'], default: 'Social Media' },
    platform: { type: String }, // facebook, twitter, instagram, app
    linkToShare: { type: String },
    points: { type: Number, default: 10 },
    deadline: { type: Date },
    targetAudience: { type: String, default: 'All' }, // All, District Heads, Volunteers, etc.
    mediaUrl: { type: String }, // Reference media URL
    status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);

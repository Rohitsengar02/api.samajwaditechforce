const mongoose = require('mongoose');

const userTaskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    status: { type: String, enum: ['Completed', 'Pending'], default: 'Completed' },
    pointsEarned: { type: Number, required: true },
    comment: { type: String },
    proofImage: { type: String },
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate completions for the same task by the same user
userTaskSchema.index({ user: 1, task: 1 }, { unique: true });

module.exports = mongoose.model('UserTask', userTaskSchema);

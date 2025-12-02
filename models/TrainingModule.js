const mongoose = require('mongoose');

const trainingModuleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    phase: {
        type: String,
        required: true
    },
    type: { type: String, enum: ['video', 'document'], default: 'video' },
    contentUrl: { type: String }, // Video or PDF link
    thumbnail: { type: String },
    duration: { type: String }, // e.g. "15 min"
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('TrainingModule', trainingModuleSchema);

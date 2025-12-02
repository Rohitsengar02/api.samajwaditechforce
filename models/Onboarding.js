const mongoose = require('mongoose');

const onboardingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    gradient: {
        type: [String],
        default: ['#E30512', '#b91c1c', '#7f1d1d'] // Default Red Gradient
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Onboarding', onboardingSchema);

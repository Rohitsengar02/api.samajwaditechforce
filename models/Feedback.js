const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    mohalla: {
        type: String,
        required: false
    },
    mobile: {
        type: String,
        required: false
    },
    leaderName: {
        type: String,
        required: false
    },
    assembly: {
        type: String,
        required: false
    },
    meetingFrequency: {
        type: String,
        required: false
    },
    listeningSkills: {
        type: String,
        required: false
    },
    workPerformance: {
        type: String,
        required: false
    },
    teamSupport: {
        type: String,
        required: false
    },
    behaviour: {
        type: String,
        required: false
    },
    publicImage: {
        type: String,
        required: false
    },
    socialMedia: {
        type: String,
        required: false
    },
    supportLevel: {
        type: String,
        required: false
    },
    feedback: {
        type: String,
        required: false
    },
    rating: {
        type: Number,
        required: false,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);

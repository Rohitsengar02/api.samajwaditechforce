const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'closed'],
        default: 'upcoming'
    },
    attendees: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        enum: ['rally', 'meeting', 'training', 'campaign'],
        required: true
    },
    updates: [{
        type: String
    }],
    image: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);

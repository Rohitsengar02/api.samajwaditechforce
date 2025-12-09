const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    platform: {
        type: String, // 'drive', 'youtube', 'instagram', 'upload'
        default: 'drive'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reel', reelSchema);

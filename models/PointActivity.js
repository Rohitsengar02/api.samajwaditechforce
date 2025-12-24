const mongoose = require('mongoose');

const pointActivitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    activityType: {
        type: String,
        enum: ['like', 'unlike', 'comment', 'share', 'post_created', 'reel_upload', 'profile_complete', 'daily_login', 'news_like', 'news_comment', 'news_share', 'reel_like', 'reel_comment', 'reel_share', 'reel_download'],
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        // Can reference Reel, Post, etc.
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
pointActivitySchema.index({ user: 1, timestamp: -1 });
pointActivitySchema.index({ username: 1, timestamp: -1 });

module.exports = mongoose.model('PointActivity', pointActivitySchema);

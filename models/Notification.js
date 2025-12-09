const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Please add a message']
    },
    type: {
        type: String,
        enum: ['task', 'news', 'event', 'update', 'message'],
        default: 'update',
    },
    relatedItem: {
        id: String,
        model: String, // 'Task', 'News', 'Event', etc.
    },
    target: {
        type: String,
        enum: ['all', 'district_heads', 'active', 'youth'],
        default: 'all'
    },
    read: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member',
        },
        readAt: {
            type: Date,
            default: Date.now,
        },
    }],
    sentCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

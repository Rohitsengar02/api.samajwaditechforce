const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['poster', 'reel', 'document', 'tutorial', 'log', 'other'],
        default: 'other'
    },
    fileUrl: {
        type: String,
        required: [function () { return !this.youtubeLink; }, 'Please add a file URL or YouTube Link']
    },
    youtubeLink: {
        type: String,
        trim: true
    },
    thumbnailUrl: {
        type: String,
        default: ''
    },
    fileType: {
        type: String,
        enum: ['image', 'video', 'pdf', 'doc', 'other'],
        default: 'other'
    },
    fileSize: {
        type: Number, // in bytes
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    uploadedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resource', resourceSchema);

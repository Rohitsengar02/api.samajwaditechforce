const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [500, 'Title cannot be more than 500 characters']
    },
    excerpt: {
        type: String,
        required: [true, 'Please add an excerpt'],
        maxlength: [5000, 'Excerpt cannot be more than 1000 characters']
    },
    coverImage: {
        type: String,
        default: 'no-photo.jpg'
    },
    content: [
        {
            type: {
                type: String,
                enum: ['heading', 'paragraph', 'image', 'list'],
                required: true
            },
            content: {
                type: String,
                default: ''
            },
            meta: {
                type: mongoose.Schema.Types.Mixed,
                default: {}
            }
        }
    ],
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Draft'
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false // For now, optional until auth is fully integrated
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('News', newsSchema);

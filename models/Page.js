const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['static', 'dynamic', 'custom', 'blog', 'gallery', 'form'],
        default: 'static'
    },
    content: {
        type: [], // Mixed array to store flexible section objects
        default: []
    },
    metaTitle: {
        type: String,
        default: ''
    },
    metaDescription: {
        type: String,
        default: ''
    },
    metaKeywords: {
        type: String,
        default: ''
    },
    headerImage: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    customFields: [{
        fieldName: String,
        fieldType: String, // text, textarea, image, url, etc.
        fieldValue: String
    }],
    order: {
        type: Number,
        default: 0
    },
    showInMenu: {
        type: Boolean,
        default: false
    },
    icon: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
pageSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Page', pageSchema);

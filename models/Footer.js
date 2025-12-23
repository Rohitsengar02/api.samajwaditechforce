const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
    id: { type: String },
    title: { type: String, default: '' },
    type: { type: String, default: 'links' }, // text, links, contact, social
    content: { type: String, default: '' },
    links: [{
        label: { type: String },
        path: { type: String }
    }],
    contact: {
        address: { type: String, default: '' },
        phone: { type: String, default: '' },
        email: { type: String, default: '' }
    },
    social: {
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        youtube: { type: String, default: '' },
        telegram: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        whatsapp: { type: String, default: '' },
        website: { type: String, default: '' }
    }
}, { _id: true });

const footerSchema = new mongoose.Schema({
    columns: { type: [columnSchema], default: [] },
    copyright: { type: String, default: '© 2024 Samajwadi Party. All rights reserved.' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Footer', footerSchema);

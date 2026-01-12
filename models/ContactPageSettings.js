const mongoose = require('mongoose');

const contactPageSettingsSchema = new mongoose.Schema({
    // Header Section
    pageTitle: {
        type: String,
        default: 'Get in Touch'
    },
    pageSubtitle: {
        type: String,
        default: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.'
    },

    // Contact Information
    address: {
        type: String,
        default: '19, Vikramaditya Marg, Lucknow, Uttar Pradesh 226001'
    },
    email: {
        type: String,
        default: 'contact@samajwaditechforce.com'
    },
    phone: {
        type: String,
        default: ''
    },

    // Form Settings
    formTitle: {
        type: String,
        default: 'Send us a Message'
    },
    nameLabel: {
        type: String,
        default: 'Full Name'
    },
    emailLabel: {
        type: String,
        default: 'Email Address'
    },
    messageLabel: {
        type: String,
        default: 'Message'
    },
    submitButtonText: {
        type: String,
        default: 'Send Message'
    },
    successMessage: {
        type: String,
        default: 'Your message has been sent!'
    },

    // Social Media Links
    socialMedia: [{
        platform: String, // facebook, twitter, instagram, etc.
        url: String,
        icon: String
    }],

    // Office Hours
    officeHours: {
        type: String,
        default: 'Monday - Friday: 9:00 AM - 6:00 PM'
    },

    // Additional Info
    additionalInfo: {
        type: String,
        default: ''
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('ContactPageSettings', contactPageSettingsSchema);

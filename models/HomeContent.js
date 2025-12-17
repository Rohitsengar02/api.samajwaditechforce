const mongoose = require('mongoose');

// Stat Schema (for Hero and Track Record)
const statSchema = new mongoose.Schema({
    num: { type: String, default: '0' },
    label: { type: String, default: '' },
    icon: { type: String, default: '' }
}, { _id: false });

// Hero Slide Schema
const heroSlideSchema = new mongoose.Schema({
    badge: { type: String, default: '' },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    stats: [statSchema],
    highlights: [{ type: String }],
    ctaText: { type: String, default: '' },
    ctaLink: { type: String, default: '' }
}, { _id: true });

// President Achievement Schema
const achievementSchema = new mongoose.Schema({
    text: { type: String, default: '' }
}, { _id: false });

// Legacy Leader Schema (for multiple leaders)
const legacyLeaderSchema = new mongoose.Schema({
    name: { type: String, default: '' },
    role: { type: String, default: '' },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
}, { _id: true });

// Legacy Card Schema
const legacyCardSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    desc: { type: String, default: '' },
    image: { type: String, default: '' }
}, { _id: false });

// Program Schema
const programSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    desc: { type: String, default: '' },
    image: { type: String, default: '' },
    icon: { type: String, default: '' }
}, { _id: true });

// President Slide Schema
const presidentSlideSchema = new mongoose.Schema({
    badge: { type: String, default: 'National President' },
    name: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    quote: { type: String, default: '' },
    image: { type: String, default: '' },
    achievements: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { _id: true });

// Main Home Content Schema
const homeContentSchema = new mongoose.Schema({
    // Hero Section
    hero: {
        slides: [heroSlideSchema],
        autoPlayInterval: { type: Number, default: 5000 }
    },

    // Track Record Section
    trackRecord: {
        title: { type: String, default: 'Our Track Record' },
        items: [statSchema]
    },

    // President Section - Now supports multiple slides
    president: {
        title: { type: String, default: 'Our Leaders' },
        slides: [presidentSlideSchema],
        autoPlayInterval: { type: Number, default: 5000 }
    },

    // Legacy Section - Now supports multiple leaders
    legacy: {
        title: { type: String, default: 'Our Legacy' },
        leaders: [legacyLeaderSchema],
        cards: [legacyCardSchema]
    },

    // Programs Section
    programs: {
        title: { type: String, default: 'Our Programs' },
        items: [programSchema]
    },

    // Explore Pages Section
    explorePages: {
        title: { type: String, default: 'Explore Pages' },
        selectedPageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Page' }]
    },

    // Footer Section
    footer: {
        columns: [{
            id: { type: String },
            title: { type: String, default: '' },
            type: { type: String, default: 'links' }, // 'links', 'text', 'contact', 'social'
            content: { type: String, default: '' }, // For 'text' type description
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
                youtube: { type: String, default: '' }
            }
        }],
        copyright: { type: String, default: '© 2024 Samajwadi Party. All rights reserved.' }
    },

    // Meta
    isActive: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
});

homeContentSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('HomeContent', homeContentSchema);

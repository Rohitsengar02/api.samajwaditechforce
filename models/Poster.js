const mongoose = require('mongoose');

const posterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    cloudinaryPublicId: {
        type: String,
        required: false // Optional now as we migrate to R2
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    usersWhoDownloaded: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        downloadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
posterSchema.index({ createdAt: -1 });
posterSchema.index({ isActive: 1 });

module.exports = mongoose.model('Poster', posterSchema);

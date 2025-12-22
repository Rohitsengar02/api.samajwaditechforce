const express = require('express');
const router = express.Router();
const Reel = require('../models/Reel');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all reels
// @route   GET /api/reels
// @access  Public
router.get('/', async (req, res) => {
    try {
        const reels = await Reel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: reels });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// @desc    Add a reel
// @route   POST /api/reels
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { title, videoUrl, platform } = req.body;

        if (!title || !videoUrl) {
            return res.status(400).json({ success: false, message: 'Please provide title and video URL' });
        }

        const reel = await Reel.create({
            title,
            videoUrl,
            platform: platform || 'drive'
        });

        res.status(201).json({ success: true, data: reel });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid data', error: error.message });
    }
});

// @desc    Like a reel
// @route   POST /api/reels/:id/like
// @access  Public
router.post('/:id/like', async (req, res) => {
    try {
        const { username, userId } = req.body;
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({ success: false, message: 'Reel not found' });
        }

        // Initialize arrays if needed
        if (!reel.likes) reel.likes = [];
        if (!reel.likedBy) reel.likedBy = [];

        // Check if already liked
        const alreadyLiked = reel.likes.some(like => like.username === username);

        if (alreadyLiked) {
            // Unlike - Remove like
            reel.likes = reel.likes.filter(like => like.username !== username);
        } else {
            // Like
            reel.likes.push({ username, user: userId, timestamp: new Date() });

            // Check if first time liking for points
            const alreadyLikedForPoints = reel.likedBy.some(l => l.user && l.user.toString() === userId);

            if (!alreadyLikedForPoints && userId && username) {
                reel.likedBy.push({ username, user: userId, timestamp: new Date() });

                try {
                    const PointActivity = require('../models/PointActivity');
                    const User = require('../models/User');

                    await PointActivity.create({
                        user: userId,
                        username,
                        activityType: 'reel_like',
                        points: 5,
                        description: `Liked reel: ${reel.title.substring(0, 50)}...`,
                        relatedId: reel._id
                    });

                    await User.findByIdAndUpdate(userId, { $inc: { points: 5 } });
                } catch (pointError) {
                    console.error('Error awarding points:', pointError);
                }
            }
        }

        await reel.save();
        res.json({ success: true, data: reel, liked: !alreadyLiked, likesCount: reel.likes.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// @desc    Share a reel
// @route   POST /api/reels/:id/share
// @access  Public
router.post('/:id/share', async (req, res) => {
    try {
        const { username, userId } = req.body;
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({ success: false, message: 'Reel not found' });
        }

        // Initialize arrays
        if (!reel.shares) reel.shares = [];
        if (!reel.sharedBy) reel.sharedBy = [];

        // Track share
        reel.shares.push({ username, user: userId, timestamp: new Date() });

        // Check if first share for points
        const alreadyShared = reel.sharedBy.some(s => s.user && s.user.toString() === userId);

        if (!alreadyShared && userId && username) {
            reel.sharedBy.push({ username, user: userId, timestamp: new Date() });

            try {
                const PointActivity = require('../models/PointActivity');
                const User = require('../models/User');

                await PointActivity.create({
                    user: userId,
                    username,
                    activityType: 'reel_share',
                    points: 10,
                    description: `Shared reel: ${reel.title.substring(0, 50)}...`,
                    relatedId: reel._id
                });

                await User.findByIdAndUpdate(userId, { $inc: { points: 10 } });
            } catch (pointError) {
                console.error('Error awarding points:', pointError);
            }
        }

        await reel.save();
        res.json({ success: true, data: reel, firstShare: !alreadyShared, points: !alreadyShared ? 10 : 0 });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// @desc    Comment on a reel
// @route   POST /api/reels/:id/comment
// @access  Public
router.post('/:id/comment', async (req, res) => {
    try {
        const { username, userId, text } = req.body;

        if (!text || !username) {
            return res.status(400).json({ success: false, message: 'Please provide username and comment text' });
        }

        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({ success: false, message: 'Reel not found' });
        }

        // Initialize arrays
        if (!reel.comments) reel.comments = [];
        if (!reel.commentedBy) reel.commentedBy = [];

        // Add comment
        reel.comments.push({ username, user: userId, text, timestamp: new Date() });

        // Check if first comment for points
        const hasCommentedBefore = reel.commentedBy.some(c => c.user && c.user.toString() === userId);

        if (!hasCommentedBefore && userId && username) {
            reel.commentedBy.push({ username, user: userId, timestamp: new Date() });

            try {
                const PointActivity = require('../models/PointActivity');
                const User = require('../models/User');

                await PointActivity.create({
                    user: userId,
                    username,
                    activityType: 'reel_comment',
                    points: 10,
                    description: `Commented on reel: ${reel.title.substring(0, 50)}...`,
                    relatedId: reel._id
                });

                await User.findByIdAndUpdate(userId, { $inc: { points: 10 } });
            } catch (pointError) {
                console.error('Error awarding points:', pointError);
            }
        }

        await reel.save();
        res.json({ success: true, data: reel, firstComment: !hasCommentedBefore, comments: reel.comments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// @desc    Delete a comment
// @route   DELETE /api/reels/:id/comment/:commentId
// @access  Public
router.delete('/:id/comment/:commentId', async (req, res) => {
    try {
        const { username } = req.body;
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({ success: false, message: 'Reel not found' });
        }

        // Find and remove the comment
        const commentIndex = reel.comments.findIndex(
            c => c._id.toString() === req.params.commentId && c.username === username
        );

        if (commentIndex === -1) {
            return res.status(404).json({ success: false, message: 'Comment not found or unauthorized' });
        }

        // Remove the comment
        reel.comments.splice(commentIndex, 1);

        // Check if user has any other comments remaining on this reel
        const hasOtherComments = reel.comments.some(c => c.username === username);

        await reel.save();

        // Deduct 10 points only if this was the user's last comment on this reel
        if (!hasOtherComments) {
            try {
                const User = require('../models/User');
                const user = await User.findOne({ name: username });
                if (user && user.points >= 10) {
                    user.points = user.points - 10;
                    await user.save();
                }
            } catch (pointError) {
                console.error('Error deducting points:', pointError);
            }
        }

        res.json({ success: true, data: reel, wasLastComment: !hasOtherComments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// @desc    Download a reel
// @route   POST /api/reels/:id/download
// @access  Public
router.post('/:id/download', async (req, res) => {
    try {
        const { username, userId } = req.body;
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({ success: false, message: 'Reel not found' });
        }

        // Initialize arrays
        if (!reel.downloads) reel.downloads = [];
        if (!reel.downloadedBy) reel.downloadedBy = [];

        // Track download
        reel.downloads.push({ username, user: userId, timestamp: new Date() });

        // Check if first download for points
        const alreadyDownloaded = reel.downloadedBy.some(d => d.user && d.user.toString() === userId);

        if (!alreadyDownloaded && userId && username) {
            reel.downloadedBy.push({ username, user: userId, timestamp: new Date() });

            try {
                const PointActivity = require('../models/PointActivity');
                const User = require('../models/User');

                await PointActivity.create({
                    user: userId,
                    username,
                    activityType: 'reel_download',
                    points: 10,
                    description: `Downloaded reel: ${reel.title.substring(0, 50)}...`,
                    relatedId: reel._id
                });

                await User.findByIdAndUpdate(userId, { $inc: { points: 10 } });
            } catch (pointError) {
                console.error('Error awarding points:', pointError);
            }
        }

        await reel.save();
        res.json({ success: true, message: 'Download tracked!', firstDownload: !alreadyDownloaded, points: !alreadyDownloaded ? 10 : 0 });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// @desc    Delete a reel
// @route   DELETE /api/reels/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({ success: false, message: 'Reel not found' });
        }

        await reel.deleteOne();
        res.json({ success: true, message: 'Reel removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

module.exports = router;

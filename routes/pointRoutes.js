const express = require('express');
const router = express.Router();
const PointActivity = require('../models/PointActivity');
const User = require('../models/User');

// @desc    Award points to a user
// @route   POST /api/points/award
// @access  Public
router.post('/award', async (req, res) => {
    try {
        const { username, userId, activityType, points, description, relatedId } = req.body;

        if ((!username && !userId) || !activityType || !points) {
            return res.status(400).json({
                success: false,
                message: 'Please provide userId or username, activityType, and points'
            });
        }

        // Find user by userId (Preferred) or username
        let user;
        if (userId) {
            user = await User.findById(userId);
        } else {
            user = await User.findOne({ name: username });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: `User not found (ID: ${userId}, Name: ${username})` });
        }

        // --- ENFORCE DAILY LIMIT FOR POSTER CREATION ---
        if (activityType === 'poster_create') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const dailyCount = await PointActivity.countDocuments({
                user: user._id,
                activityType: 'poster_create',
                timestamp: { $gte: startOfDay }
            });

            if (dailyCount >= 4) {
                return res.status(429).json({
                    success: false,
                    message: 'Daily limit reached. You can only create 4 posters per day.'
                });
            }
        }

        // Create point activity record
        const activity = await PointActivity.create({
            user: user._id,
            username,
            activityType,
            points,
            description: description || `Earned ${points} points for ${activityType}`,
            relatedId
        });

        // Update user's total points
        user.points = (user.points || 0) + points;
        await user.save();

        res.json({
            success: true,
            data: activity,
            totalPoints: user.points
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// @desc    Get user's point history
// @route   GET /api/points/history/:username
// @access  Public
router.get('/history/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        const activities = await PointActivity.find({ username })
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const user = await User.findOne({ name: username });

        res.json({
            success: true,
            data: activities,
            totalPoints: user?.points || 0,
            count: activities.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// @desc    Get user's total points
// @route   GET /api/points/total/:username
// @access  Public
router.get('/total/:username', async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ name: username });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            totalPoints: user.points || 0,
            username: user.name
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// @desc    Get points leaderboard
// @route   GET /api/points/leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const topUsers = await User.find({})
            .select('name points profileImage')
            .sort({ points: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: topUsers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// @desc    Check daily limit status
// @route   GET /api/points/check-limit
// @access  Public
router.get('/check-limit', async (req, res) => {
    try {
        const { userId, activityType } = req.query;
        if (!userId || !activityType) {
            return res.status(400).json({ success: false, message: 'Missing userId or activityType' });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Check combined limit for Create and Share
        const isPosterActivity = ['poster_create', 'poster_share'].includes(activityType);

        let count = 0;
        let limit = 999;

        if (isPosterActivity) {
            count = await PointActivity.countDocuments({
                user: userId,
                activityType: { $in: ['poster_create', 'poster_share'] },
                timestamp: { $gte: startOfDay }
            });
            limit = 4;
        } else {
            count = await PointActivity.countDocuments({
                user: userId,
                activityType: activityType,
                timestamp: { $gte: startOfDay }
            });
        }

        const remaining = Math.max(0, limit - count);

        res.json({
            success: true,
            count,
            limit,
            remaining,
            hasReachedLimit: count >= limit
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;

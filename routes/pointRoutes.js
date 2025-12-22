const express = require('express');
const router = express.Router();
const PointActivity = require('../models/PointActivity');
const User = require('../models/User');

// @desc    Award points to a user
// @route   POST /api/points/award
// @access  Public
router.post('/award', async (req, res) => {
    try {
        const { username, activityType, points, description, relatedId } = req.body;

        if (!username || !activityType || !points) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, activityType, and points'
            });
        }

        // Find user by username
        const user = await User.findOne({ name: username });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
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

module.exports = router;

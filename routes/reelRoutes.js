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

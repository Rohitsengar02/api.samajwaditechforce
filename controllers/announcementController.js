const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public (Temporarily)
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({}).sort({ date: -1 });
        res.status(200).json({
            success: true,
            count: announcements.length,
            data: announcements
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Public (Temporarily)
const createAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.create(req.body);

        // Create a notification entry for this announcement
        const notification = await Notification.create({
            title: announcement.title,
            message: announcement.content,
            type: 'update',
            target: 'all',
            sentCount: 1250, // Simulated count
            relatedItem: {
                id: announcement._id,
                model: 'Announcement'
            }
        });

        // Broadcast via Socket.IO for real-time updates
        const io = req.app.get('io');
        if (io) {
            io.emit('notification', {
                id: notification._id,
                type: 'update',
                title: announcement.title,
                message: announcement.content,
                createdAt: announcement.createdAt,
                relatedItem: {
                    id: announcement._id,
                    model: 'Announcement'
                }
            });
            console.log('✅ Announcement broadcasted as notification via Socket.IO');
        }

        res.status(201).json({
            success: true,
            data: announcement
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Public (Temporarily)
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ success: false, error: 'Announcement not found' });
        }

        await announcement.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };

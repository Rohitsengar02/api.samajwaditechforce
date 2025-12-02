const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');

// @desc    Get all announcements
// @route   GET /api/communication/announcements
// @access  Public
exports.getAnnouncements = async (req, res, next) => {
    try {
        const announcements = await Announcement.find().sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: announcements.length,
            data: announcements
        });
    } catch (err) {
        console.error('Error fetching announcements:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create new announcement
// @route   POST /api/communication/announcements
// @access  Private (Admin)
exports.createAnnouncement = async (req, res, next) => {
    try {
        const announcement = await Announcement.create(req.body);

        res.status(201).json({
            success: true,
            data: announcement
        });
    } catch (err) {
        console.error('Error creating announcement:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/communication/announcements/:id
// @access  Private (Admin)
exports.deleteAnnouncement = async (req, res, next) => {
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
    } catch (err) {
        console.error('Error deleting announcement:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all notifications (history)
// @route   GET /api/communication/notifications
// @access  Private (Admin)
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Send (Create) notification
// @route   POST /api/communication/notifications
// @access  Private (Admin)
exports.sendNotification = async (req, res, next) => {
    try {
        // In a real app, here we would trigger the push notification service (e.g., Firebase/Expo)
        // For now, we just save the record to history

        // Simulate sent count based on target
        let sentCount = 0;
        switch (req.body.target) {
            case 'all': sentCount = 1250; break;
            case 'district_heads': sentCount = 75; break;
            case 'active': sentCount = 850; break;
            case 'youth': sentCount = 300; break;
            default: sentCount = 0;
        }

        const notification = await Notification.create({
            ...req.body,
            sentCount
        });

        res.status(201).json({
            success: true,
            data: notification,
            message: 'Notification sent successfully'
        });
    } catch (err) {
        console.error('Error sending notification:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

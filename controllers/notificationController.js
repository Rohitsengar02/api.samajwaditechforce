const Notification = require('../models/Notification');

// @desc    Get all notifications (history)
// @route   GET /api/notifications
// @access  Public (Temporarily)
const getNotifications = async (req, res) => {
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
// @route   POST /api/notifications
// @access  Public (Temporarily)
const sendNotification = async (req, res) => {
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

module.exports = { getNotifications, sendNotification };

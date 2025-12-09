const Notification = require('../models/Notification');
const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
const expo = new Expo();

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

        // Broadcast via Socket.IO for real-time updates
        const io = req.app.get('io');
        if (io) {
            io.emit('notification', {
                id: notification._id,
                type: notification.type || 'update',
                title: notification.title,
                message: notification.message,
                createdAt: notification.createdAt,
                relatedItem: notification.relatedItem
            });
            console.log('✅ Notification broadcasted via Socket.IO');
        }

        // TODO: Send Expo Push Notifications
        // You would need to:
        // 1. Get push tokens from User/Member model based on target
        // 2. Send push notifications using Expo SDK
        // Example code (when you have push tokens):
        /*
        const Member = require('../models/Member');
        let query = {};
        if (req.body.target === 'district_heads') {
            query = { role: 'district_head' };
        } else if (req.body.target === 'active') {
            query = { isActive: true };
        } else if (req.body.target === 'youth') {
            query = { ageGroup: 'youth' };
        }
        
        const users = await Member.find(query).select('pushToken');
        const pushTokens = users.map(u => u.pushToken).filter(Boolean);
        
        const messages = pushTokens.map(token => ({
            to: token,
            sound: 'default',
            title: notification.title,
            body: notification.message,
            data: { notificationId: notification._id, type: notification.type }
        }));
        
        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
            try {
                await expo.sendPushNotificationsAsync(chunk);
            } catch (error) {
                console.error('Error sending push notification chunk:', error);
            }
        }
        */

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

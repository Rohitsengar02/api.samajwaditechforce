const express = require('express');
const router = express.Router();
const {
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
    getNotifications,
    sendNotification
} = require('../controllers/communicationController');
const { protect, admin } = require('../middleware/authMiddleware');

// Announcements
// Temporarily disabled auth for testing
router.route('/announcements')
    .get(getAnnouncements)
    .post(createAnnouncement);

router.route('/announcements/:id')
    .delete(deleteAnnouncement);

// Notifications
router.route('/notifications')
    .get(getNotifications)
    .post(sendNotification);

module.exports = router;

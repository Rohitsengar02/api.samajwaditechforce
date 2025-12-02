const express = require('express');
const router = express.Router();
const { getNotifications, sendNotification } = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

// Temporarily disabled auth for testing
router.route('/')
    .get(getNotifications)
    .post(sendNotification);

module.exports = router;

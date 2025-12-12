const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, admin } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../utils/cache');

// Temporarily disabled auth for testing
router.route('/')
    .get(cacheMiddleware('announcements', 5 * 60), getAnnouncements)  // 5 minutes cache
    .post(createAnnouncement);

router.route('/:id')
    .delete(deleteAnnouncement);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, admin } = require('../middleware/authMiddleware');

// Temporarily disabled auth for testing
router.route('/')
    .get(getAnnouncements)
    .post(createAnnouncement);

router.route('/:id')
    .delete(deleteAnnouncement);

module.exports = router;

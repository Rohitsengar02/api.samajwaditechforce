const express = require('express');
const router = express.Router();
const { uploadImage, uploadVideo, uploadPosterForShare } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected routes (User & Admin)
router.post('/image', protect, uploadImage);

// Admin routes
router.post('/video', protect, admin, uploadVideo);

// Public route for poster sharing (anyone can share their poster)
router.post('/poster-share', uploadPosterForShare);

module.exports = router;

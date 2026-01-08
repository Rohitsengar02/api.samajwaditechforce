const express = require('express');
const router = express.Router();
const { uploadImage, uploadPosterForShare } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected/Admin routes
router.post('/image', protect, admin, uploadImage);

// Public route for poster sharing (anyone can share their poster)
router.post('/poster-share', uploadPosterForShare);

module.exports = router;

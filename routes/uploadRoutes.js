const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected/Admin routes
router.post('/image', protect, admin, uploadImage);

module.exports = router;

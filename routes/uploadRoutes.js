const express = require('express');
const router = express.Router();
const { uploadImage, uploadVideo, uploadPosterForShare } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');

const multer = require('multer');
const upload = multer();

// Protected routes (User & Admin)
router.post('/image', protect, upload.single('image'), uploadImage);

// Admin routes
router.post('/video', protect, admin, upload.single('video'), uploadVideo);

// Public route for poster sharing (anyone can share their poster)
router.post('/poster-share', upload.single('image'), uploadPosterForShare);

module.exports = router;

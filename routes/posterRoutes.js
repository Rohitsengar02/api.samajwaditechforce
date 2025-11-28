const express = require('express');
const router = express.Router();
const posterController = require('../controllers/posterController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', posterController.getAllPosters);
router.get('/stats', posterController.getPosterStats);
router.get('/:id', posterController.getPosterById);

// Protected routes (require authentication)
router.post('/upload', protect, posterController.uploadPoster);
router.post('/:id/download', protect, posterController.trackDownload);
router.put('/:id', protect, posterController.updatePoster);
router.delete('/:id', protect, posterController.deletePoster);

module.exports = router;

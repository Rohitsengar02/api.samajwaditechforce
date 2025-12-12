const express = require('express');
const router = express.Router();
const posterController = require('../controllers/posterController');
const { protect } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../utils/cache');

// Public routes with caching
router.get('/', cacheMiddleware('posters_list', 10 * 60), posterController.getAllPosters);
router.get('/stats', cacheMiddleware('posters_stats', 10 * 60), posterController.getPosterStats);
router.get('/:id', cacheMiddleware('poster', 15 * 60), posterController.getPosterById);

// Protected routes (require authentication)
router.post('/upload', protect, posterController.uploadPoster);
router.post('/:id/download', protect, posterController.trackDownload);
router.put('/:id', protect, posterController.updatePoster);
router.delete('/:id', protect, posterController.deletePoster);

module.exports = router;

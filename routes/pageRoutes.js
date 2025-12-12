const express = require('express');
const router = express.Router();
const {
    getPages,
    getPageById,
    getPageBySlug,
    createPage,
    updatePage,
    updatePageContent,
    deletePage
} = require('../controllers/pageController');
const { protect, admin } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../utils/cache');

// NOTE: Auth temporarily disabled for testing - enable in production!

// Public routes with caching
router.get('/', cacheMiddleware('pages_list', 20 * 60), getPages);
router.get('/slug/:slug', cacheMiddleware('page_slug', 20 * 60), getPageBySlug);
router.get('/:id', cacheMiddleware('page', 20 * 60), getPageById);

// Admin routes
router.post('/', createPage);
router.put('/:id', updatePage);
router.patch('/:id/content', updatePageContent);
router.delete('/:id', deletePage);

module.exports = router;

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

// NOTE: Auth temporarily disabled for testing - enable in production!

// Public routes
router.get('/', getPages);
router.get('/slug/:slug', getPageBySlug);
router.get('/:id', getPageById);

// Admin routes
router.post('/', createPage);
router.put('/:id', updatePage);
router.patch('/:id/content', updatePageContent);
router.delete('/:id', deletePage);

module.exports = router;

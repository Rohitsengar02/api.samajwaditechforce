const express = require('express');
const router = express.Router();
const { getBanners, createBanner } = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../utils/cache');

router.route('/')
    .get(cacheMiddleware('banners', 15 * 60), getBanners)  // 15 minutes cache
    .post(protect, admin, createBanner);

module.exports = router;

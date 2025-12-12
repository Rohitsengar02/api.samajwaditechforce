const express = require('express');
const router = express.Router();
const { getBanners, createBanner } = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getBanners)
    .post(protect, admin, createBanner);

module.exports = router;

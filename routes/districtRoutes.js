const express = require('express');
const router = express.Router();
const { getDistricts, createDistrict } = require('../controllers/districtController');
const { protect, admin } = require('../middleware/authMiddleware');

// NOTE: Auth temporarily disabled for testing - enable in production!
router.route('/')
    .get(getDistricts)
    .post(createDistrict);

module.exports = router;

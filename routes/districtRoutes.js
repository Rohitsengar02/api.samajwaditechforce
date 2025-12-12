const express = require('express');
const router = express.Router();
const { getDistricts, createDistrict, getDistrictById, updateDistrict, deleteDistrict } = require('../controllers/districtController');
const { protect, admin } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../utils/cache');

// NOTE: Auth temporarily disabled for testing - enable in production!
router.route('/')
    .get(cacheMiddleware('districts', 30 * 60), getDistricts)  // 30 minutes cache
    .post(createDistrict);

// District by ID routes
router.route('/:id')
    .get(cacheMiddleware('district', 30 * 60), getDistrictById)  // 30 minutes cache
    .put(updateDistrict)
    .delete(deleteDistrict);

module.exports = router;

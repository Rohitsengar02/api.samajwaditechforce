const express = require('express');
const router = express.Router();
const { getDistricts, createDistrict, getDistrictById, updateDistrict, deleteDistrict } = require('../controllers/districtController');
const { protect, admin } = require('../middleware/authMiddleware');

// NOTE: Auth temporarily disabled for testing - enable in production!
router.route('/')
    .get(getDistricts)
    .post(createDistrict);

// District by ID routes
router.route('/:id')
    .get(getDistrictById)
    .put(updateDistrict)
    .delete(deleteDistrict);

module.exports = router;

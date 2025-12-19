const express = require('express');
const router = express.Router();
const {
    getVidhansabhas,
    getDistricts,
    searchVidhansabhas
} = require('../controllers/vidhansabhaController');

// Get all unique districts
router.get('/districts', getDistricts);

// Search vidhansabhas
router.get('/search', searchVidhansabhas);

// Get all vidhansabhas (with optional district filter)
router.get('/', getVidhansabhas);

module.exports = router;

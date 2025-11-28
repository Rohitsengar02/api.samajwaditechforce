const express = require('express');
const router = express.Router();
const { getModules, createModule } = require('../controllers/trainingController');
const { protect, admin } = require('../middleware/authMiddleware');

// NOTE: Auth temporarily disabled for testing - enable in production!
router.route('/')
    .get(getModules)
    .post(createModule);

module.exports = router;

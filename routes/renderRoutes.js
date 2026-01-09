const express = require('express');
const router = express.Router();
const renderController = require('../controllers/renderController');
const auth = require('../middleware/authMiddleware'); // Fixed path

router.post('/poster', renderController.renderPoster);

module.exports = router;

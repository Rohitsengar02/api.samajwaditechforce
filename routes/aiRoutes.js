const express = require('express');
const router = express.Router();
const { removeBackground } = require('../controllers/aiController');

router.post('/remove-background', removeBackground);

module.exports = router;

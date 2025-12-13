const express = require('express');
const router = express.Router();
const { getFooter, updateFooter, deleteFooter } = require('../controllers/footerController');

router.get('/', getFooter);
router.put('/', updateFooter);
router.delete('/', deleteFooter);

module.exports = router;

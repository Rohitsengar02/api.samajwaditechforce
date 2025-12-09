const express = require('express');
const router = express.Router();
const { getModules, getModuleById, createModule, updateModule, deleteModule } = require('../controllers/trainingController');
const { protect, admin } = require('../middleware/authMiddleware');

// NOTE: Auth temporarily disabled for testing - enable in production!
router.route('/')
    .get(getModules)
    .post(createModule);

router.route('/:id')
    .get(getModuleById)
    .put(updateModule)
    .delete(deleteModule);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus
} = require('../controllers/taskController');
const { protect, admin } = require('../middleware/authMiddleware');

// Task CRUD routes
// NOTE: Auth temporarily disabled for testing - enable in production!
router.route('/')
    .get(getTasks)  // Removed auth for testing
    .post(createTask);  // Removed auth for testing

router.route('/:id')
    .get(protect, admin, getTaskById)
    .put(protect, admin, updateTask)
    .delete(protect, admin, deleteTask);

// Status update route
router.route('/:id/status')
    .patch(protect, admin, updateTaskStatus);

module.exports = router;

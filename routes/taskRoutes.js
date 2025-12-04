const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    completeTask,
    getMyCompletedTasks,
    getAllSubmissions
} = require('../controllers/taskController');
const { protect, admin } = require('../middleware/authMiddleware');

// Task CRUD routes
// NOTE: Auth temporarily disabled for testing - enable in production!
router.route('/')
    .get(getTasks)  // Removed auth for testing
    .post(createTask);  // Removed auth for testing

// Get my completed tasks
router.route('/my-completed')
    .get(protect, getMyCompletedTasks);

// Get all submissions (Admin)
router.route('/submissions')
    .get(getAllSubmissions); // Removed auth for testing, add protect/admin later if needed

// Status update route
router.route('/:id/status')
    .patch(protect, admin, updateTaskStatus);

// Complete task route
router.route('/:id/complete')
    .post(protect, completeTask);

router.route('/:id')
    .get(protect, getTaskById)
    .put(protect, admin, updateTask)
    .delete(protect, admin, deleteTask);

module.exports = router;

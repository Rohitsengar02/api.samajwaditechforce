const express = require('express');
const router = express.Router();
const { createFeedback, getFeedbacks, deleteFeedback } = require('../controllers/feedbackController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(createFeedback) // Public access for submission
    .get(protect, admin, getFeedbacks); // Admin only for viewing

router.route('/:id')
    .delete(protect, admin, deleteFeedback); // Admin only for deletion

module.exports = router;

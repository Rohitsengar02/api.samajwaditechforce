const express = require('express');
const router = express.Router();
const { getMembers, getMemberById, createMember, updateMember } = require('../controllers/memberController');
const { protect, admin } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../utils/cache');

// Cache: 5 min for list, 10 min for single member
router.route('/').get(protect, admin, cacheMiddleware('members', 5 * 60), getMembers).post(protect, admin, createMember);
router.route('/:id').get(protect, admin, cacheMiddleware('member', 10 * 60), getMemberById).put(protect, admin, updateMember);

module.exports = router;

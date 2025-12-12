const express = require('express');
const router = express.Router();
const { getMembers, getMemberById, createMember, updateMember } = require('../controllers/memberController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getMembers).post(protect, admin, createMember);
router.route('/:id').get(protect, admin, getMemberById).put(protect, admin, updateMember);

module.exports = router;

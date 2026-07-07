const express = require('express');
const router = express.Router();
const {
  getAllMembers,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAllMembers).post(createMember);
router.route('/:id').put(protect, updateMember).delete(protect, deleteMember);

module.exports = router;
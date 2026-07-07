const express = require('express');
const {
  submitContact,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// @route   POST /api/contact
// @desc    Submit a contact form
// @access  Public
router.post('/', submitContact);

// @desc    All following routes are protected admin routes
router.use(protect, admin);

router.get('/', getContacts);
router.get('/:id', getContactById);
router.patch('/:id/status', updateContactStatus);
router.delete('/:id', deleteContact);

module.exports = router;

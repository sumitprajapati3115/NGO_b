const express = require('express');
const router = express.Router();
const {
    createDonation,
    getAllDonations,
    getDonationById,
    updateDonationStatus,
} = require('../controllers/donationController');
// Assuming you have admin authentication middleware, you should apply it here.
// Example: const { protect, admin } = require('../middleware/authMiddleware');

// Public route
router.post('/', createDonation);

// Admin routes (should be protected)
router.get('/', /* protect, admin, */ getAllDonations);
router.get('/:id', /* protect, admin, */ getDonationById);
router.patch('/:id/status', /* protect, admin, */ updateDonationStatus);

module.exports = router;
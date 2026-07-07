const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');
const { registerAdmin } = require('../controllers/adminController');
const { getAdminStats } = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', registerAdmin); // नया एडमिन बनाने के लिए रूट
router.get('/stats', protect, admin, getAdminStats);

module.exports = router;

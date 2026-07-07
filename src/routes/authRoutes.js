// const express = require('express');
// const router = express.Router();
// const { loginUser } = require('../controllers/authController');

// // एडमिन लॉगिन के लिए रूट
// router.post('/login', loginUser);

// module.exports = router;
const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

// एडमिन लॉगिन के लिए रूट
router.post('/login', loginUser);

module.exports = router;
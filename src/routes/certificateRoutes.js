const express = require('express');
const router = express.Router();
const { previewCertificate, downloadCertificate } = require('../controllers/memberController');

// @desc    Preview a member's certificate
// @route   GET /api/certificates/preview/:id
// @access  Public
router.get('/preview/:id', previewCertificate);

// @desc    Download a member's certificate as PDF
// @route   GET /api/certificates/download/:id
// @access  Public
router.get('/download/:id', downloadCertificate);

module.exports = router;
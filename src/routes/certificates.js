const express = require('express');
const router = express.Router();
const {
  createCertificate,
  getAllCertificates,
  deleteCertificate,
  downloadCertificate,
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAllCertificates).post(protect, createCertificate);
router.route('/:id').delete(protect, deleteCertificate);
router.route('/:id/download').get(protect, downloadCertificate);

module.exports = router;
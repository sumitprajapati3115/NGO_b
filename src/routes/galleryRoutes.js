const express = require('express');
const { uploadGalleryImage, getGallery } = require('../controllers/galleryController');
const router = express.Router();

router.post('/', uploadGalleryImage);
router.get('/', getGallery);

module.exports = router;


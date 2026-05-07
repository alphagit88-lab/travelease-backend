const express = require('express');
const router = express.Router();
const {
  getAllImages,
  createImage,
  updateImage,
  deleteImage,
  reorderImages,
} = require('../controllers/galleryController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const { validateGalleryImage } = require('../middleware/validation');
const upload = require('../utils/upload');

// Public access for home slider
router.get('/', getAllImages);

// Protected admin routes for management
router.use(authenticate);
router.use(requireAdmin);

router.post('/', upload.single('image'), validateGalleryImage, createImage);
router.put('/:id', validateGalleryImage, updateImage);
router.delete('/:id', deleteImage);
router.post('/reorder', reorderImages);

module.exports = router;

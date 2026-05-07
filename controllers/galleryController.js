const GalleryImage = require('../models/GalleryImage');
const fs = require('fs');
const path = require('path');

const getAllImages = async (req, res) => {
  try {
    const images = await GalleryImage.findAll({ activeOnly: req.query.active === 'true' });
    res.json({
      success: true,
      data: { images },
    });
  } catch (error) {
    console.error('Get gallery images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery images',
      error: error.message,
    });
  }
};

const createImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image provided',
      });
    }

    const { title, description, sort_order, is_active } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const image = await GalleryImage.create({
      title,
      description,
      image_url: imageUrl,
      sort_order: sort_order ? parseInt(sort_order) : 0,
      is_active: is_active === 'false' ? false : true,
      uploaded_by: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Gallery image uploaded successfully',
      data: { image },
    });
  } catch (error) {
    console.error('Create gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading gallery image',
      error: error.message,
    });
  }
};

const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, sort_order, is_active } = req.body;

    const image = await GalleryImage.update(id, {
      title,
      description,
      sort_order: sort_order !== undefined ? parseInt(sort_order) : undefined,
      is_active: is_active !== undefined ? (is_active === 'true' || is_active === true) : undefined,
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    res.json({
      success: true,
      message: 'Gallery image updated successfully',
      data: { image },
    });
  } catch (error) {
    console.error('Update gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating gallery image',
      error: error.message,
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await GalleryImage.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    // Try to delete physical file
    try {
      const filePath = path.join(__dirname, '..', deleted.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Error deleting physical file:', err);
    }

    res.json({
      success: true,
      message: 'Gallery image deleted successfully',
    });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting gallery image',
      error: error.message,
    });
  }
};

const reorderImages = async (req, res) => {
  try {
    const { items } = req.body; // Expects [{ id, sort_order }, ...]

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array',
      });
    }

    await GalleryImage.reorder(items);

    res.json({
      success: true,
      message: 'Images reordered successfully',
    });
  } catch (error) {
    console.error('Reorder gallery images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering gallery images',
      error: error.message,
    });
  }
};

module.exports = {
  getAllImages,
  createImage,
  updateImage,
  deleteImage,
  reorderImages,
};

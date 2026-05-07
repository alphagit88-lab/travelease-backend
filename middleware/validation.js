const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const validateGalleryImage = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Title must be at most 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('sort_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be a boolean'),
  handleValidationErrors,
];

module.exports = {
  validateLogin,
  validateChangePassword,
  validateGalleryImage,
  handleValidationErrors,
};

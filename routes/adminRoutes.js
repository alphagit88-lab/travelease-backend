const express = require('express');
const router = express.Router();
const { login, createAdmin, getAdmins } = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const { validateLogin } = require('../middleware/validation');

// Public login
router.post('/login', validateLogin, login);

// Protected admin routes
router.use(authenticate);
router.use(requireAdmin);

router.get('/admins', getAdmins);
router.post('/admins', createAdmin);

module.exports = router;

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const bcrypt = require('bcryptjs');

// Admin login - uses email and password
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create admin user (only accessible via protected admin endpoint)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
    }
    const admin = await User.create({ name, email, password });
    res.status(201).json({ success: true, message: 'Admin created', data: { admin } });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get all admins (list)
const getAdmins = async (req, res) => {
  try {
    const users = await User.findAll();
    const admins = users.filter(u => u.role === 'admin');
    res.json({ success: true, data: { admins } });
  } catch (err) {
    console.error('Get admins error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = { login, createAdmin, getAdmins };

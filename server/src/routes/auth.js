const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { ensureDbConnection } = require('../middleware/database');
const {
  register,
  login,
  getProfile,
  updateProfile,
  logout
} = require('../controllers/authController');

// Public routes
router.post('/register', ensureDbConnection, register);
router.post('/login', ensureDbConnection, login);
router.post('/logout', ensureDbConnection, logout);

// Protected routes
router.get('/profile', ensureDbConnection, protect, getProfile);
router.put('/profile', ensureDbConnection, protect, updateProfile);

module.exports = router; 
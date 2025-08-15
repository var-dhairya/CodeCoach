const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboard } = require('../controllers/analyticsController');

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/analytics/dashboard - Get comprehensive analytics dashboard
router.get('/dashboard', getDashboard);

module.exports = router;
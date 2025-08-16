const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { ensureDbConnection } = require('../middleware/database');
const { importFromKattis, getImportHistory } = require('../controllers/importController');

// Test endpoint without auth for debugging
router.post('/kattis/test', ensureDbConnection, importFromKattis);

// Apply middleware to protected routes
router.use(ensureDbConnection);
router.use(protect);

// POST /api/import/kattis - Import problem from Kattis URL (protected)
router.post('/kattis', importFromKattis);

// GET /api/import/history - Get import history (optional)
router.get('/history', getImportHistory);

module.exports = router;
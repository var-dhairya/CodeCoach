const express = require('express');
const router = express.Router();
const { getAllProblems, getProblemById, generateAIAnalysis, addSampleProblems, getProblemAnalysis } = require('../controllers/problemController');
const { protect, admin } = require('../middleware/auth');
const { ensureDbConnection } = require('../middleware/database');

// Public routes
router.get('/', ensureDbConnection, getAllProblems);
router.get('/:id', ensureDbConnection, getProblemById);
router.get('/:id/analysis', ensureDbConnection, getProblemAnalysis);

// Protected routes (require authentication)
router.post('/:id/analysis', ensureDbConnection, protect, generateAIAnalysis);

// Admin routes (for adding sample problems)
router.post('/sample', ensureDbConnection, addSampleProblems); // Temporarily remove admin requirement

module.exports = router; 
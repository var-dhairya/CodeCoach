const express = require('express');
const router = express.Router();
const { getAllProblems, getProblemById, generateAIAnalysis, addSampleProblems, getProblemAnalysis } = require('../controllers/problemController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getAllProblems);
router.get('/:id', getProblemById);
router.get('/:id/analysis', getProblemAnalysis);

// Protected routes (require authentication)
router.post('/:id/analysis', protect, generateAIAnalysis);

// Admin routes (for adding sample problems)
router.post('/sample', addSampleProblems); // Temporarily remove admin requirement

module.exports = router; 
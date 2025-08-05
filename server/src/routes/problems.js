const express = require('express');
const router = express.Router();
const { getAllProblems, getProblemById, addSampleProblems, getProblemAnalysis } = require('../controllers/problemController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getAllProblems);
router.get('/:id', getProblemById);
router.get('/:id/analysis', getProblemAnalysis);

// Admin routes (for adding sample problems)
router.post('/sample', addSampleProblems); // Temporarily remove admin requirement

module.exports = router; 
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { ensureDbConnection } = require('../middleware/database');
const {
  submitSolution,
  getUserSubmissions,
  getSubmissionDetails
} = require('../controllers/submissionController');

// Submit a solution (temporarily without auth for testing)
router.post('/', ensureDbConnection, submitSolution);

// Get user's submissions
router.get('/', ensureDbConnection, protect, getUserSubmissions);

// Get specific submission details
router.get('/:id', ensureDbConnection, protect, getSubmissionDetails);

module.exports = router; 
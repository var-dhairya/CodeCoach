const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  submitSolution,
  getUserSubmissions,
  getSubmissionDetails
} = require('../controllers/submissionController');

// Submit a solution (temporarily without auth for testing)
router.post('/', submitSolution);

// Get user's submissions
router.get('/', protect, getUserSubmissions);

// Get specific submission details
router.get('/:id', protect, getSubmissionDetails);

module.exports = router; 
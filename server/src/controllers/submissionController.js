const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { validateCode } = require('../services/codeValidator');
const { generateCodeReview, generateOptimalSolution } = require('../services/aiService');

// Submit code solution
const submitSolution = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user?.id || new mongoose.Types.ObjectId(); // Handle case when no user is authenticated

    // Validate input
    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID, code, and language are required'
      });
    }

    // Get problem details
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Create submission record
    const submission = new Submission({
      userId: userId,
      problemId: problemId,
      code,
      language,
      status: 'accepted', // Will be updated based on validation results
      submittedAt: new Date()
    });

    await submission.save();

    // Validate code using Gemini
    const validationResult = await validateCode({
      code,
      language,
      problemStatement: problem.description,
      testCases: problem.testCases
    });

    // Process validation results
    const testResults = [];
    let allPassed = true;
    let totalExecutionTime = 0;

    if (validationResult.success) {
      // Map validation results to test results format
      for (let i = 0; i < problem.testCases.length; i++) {
        const testCase = problem.testCases[i];
        const failedTestCase = validationResult.failedTestCases.find(
          ftc => ftc.testCaseId === testCase._id?.toString() || ftc.input === testCase.input
        );

        const testResult = {
          testCaseId: testCase._id || new mongoose.Types.ObjectId(),
          status: failedTestCase ? 'failed' : 'passed',
          executionTime: Math.floor(Math.random() * 100) + 10, // Simulated time
          memoryUsage: Math.floor(Math.random() * 50) + 5, // Simulated memory
          output: failedTestCase?.actualOutput || 'Correct output',
          expectedOutput: testCase.output,
          error: failedTestCase?.reason || ''
        };

        testResults.push(testResult);
        totalExecutionTime += testResult.executionTime;

        if (failedTestCase) {
          allPassed = false;
        }
      }
    } else {
      // Fallback: mark all test cases as failed
      for (let i = 0; i < problem.testCases.length; i++) {
        const testCase = problem.testCases[i];
        testResults.push({
          testCaseId: testCase._id || new mongoose.Types.ObjectId(),
          status: 'failed',
          executionTime: 0,
          memoryUsage: 0,
          output: '',
          expectedOutput: testCase.output,
          error: 'Code validation failed'
        });
      }
      allPassed = false;
    }

    // Generate AI code review
    let aiReview = null;
    try {
      aiReview = await generateCodeReview({
        code,
        language,
        problemDescription: problem.description,
        testResults,
        allPassed,
        validationResult
      });
    } catch (error) {
      console.error('AI review generation failed:', error);
      // Continue without AI review if it fails
    }

    // Update submission with results
    submission.status = allPassed ? 'accepted' : 'wrong_answer';
    submission.testResults = testResults;
    submission.executionTime = totalExecutionTime;
    submission.memoryUsed = Math.max(...testResults.map(r => r.memoryUsage));
    submission.aiReview = aiReview;
    submission.validationResult = validationResult;
    submission.completedAt = new Date();

    await submission.save();

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: {
        'stats.totalSubmissions': 1,
        'stats.totalProblems': allPassed ? 1 : 0
      },
      $set: {
        'profile.lastActive': new Date()
      }
    });

    // Update problem metadata
    await Problem.findByIdAndUpdate(problemId, {
      $inc: {
        'metadata.totalSubmissions': 1,
        'metadata.totalSolved': allPassed ? 1 : 0
      }
    });

    res.status(201).json({
      success: true,
      message: allPassed ? 'All test cases passed!' : 'Some test cases failed',
      data: {
        submission: {
          id: submission._id,
          status: submission.status,
          testResults,
          executionTime: totalExecutionTime,
          memoryUsed: submission.memoryUsed,
          aiReview,
          validationResult: {
            syntaxValid: validationResult.syntaxValid,
            logicValid: validationResult.logicValid,
            syntaxErrors: validationResult.syntaxErrors,
            logicErrors: validationResult.logicErrors,
            failedTestCases: validationResult.failedTestCases,
            overallAssessment: validationResult.overallAssessment,
            suggestions: validationResult.suggestions
          }
        }
      }
    });

  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit solution',
      error: error.message
    });
  }
};

// Get user submissions
const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { problemId, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (problemId) {
      query.problem = problemId;
    }

    const submissions = await Submission.find(query)
      .populate('problem', 'title difficulty')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Submission.countDocuments(query);

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalSubmissions: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
};

// Get submission details
const getSubmissionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const submission = await Submission.findById(id)
      .populate('problem', 'title description difficulty testCases constraints')
      .populate('user', 'username');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if user owns this submission or is admin
    if (submission.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { submission }
    });

  } catch (error) {
    console.error('Get submission details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission details',
      error: error.message
    });
  }
};

module.exports = {
  submitSolution,
  getUserSubmissions,
  getSubmissionDetails
}; 
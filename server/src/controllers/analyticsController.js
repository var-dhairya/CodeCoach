const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');

// Get comprehensive analytics dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get basic counts
    const totalProblems = await Problem.countDocuments();
    const userSubmissions = await Submission.find({ userId });
    const acceptedSubmissions = userSubmissions.filter(s => s.status === 'accepted');
    const solvedProblems = [...new Set(acceptedSubmissions.map(s => s.problemId.toString()))].length;
    
    // Calculate accuracy
    const accuracy = userSubmissions.length > 0 
      ? Math.round((acceptedSubmissions.length / userSubmissions.length) * 100) 
      : 0;
    
    // Calculate streak (simplified - consecutive days with at least one accepted submission)
    const streak = calculateStreak(acceptedSubmissions);
    
    // Calculate time statistics
    const totalTimeSpent = acceptedSubmissions.reduce((sum, sub) => sum + (sub.executionTime || 0), 0);
    const avgTimePerProblem = solvedProblems > 0 ? Math.round(totalTimeSpent / solvedProblems) : 0;
    
    // Get topic statistics
    const topicStats = await calculateTopicStats(userId);
    
    // Get difficulty statistics
    const difficultyStats = await calculateDifficultyStats(userId);
    
    // Get submission statistics
    const submissionStats = calculateSubmissionStats(userSubmissions);
    
    // Get recent activity (last 7 days)
    const recentActivity = await calculateRecentActivity(userId);
    
    // Get achievements
    const achievements = generateAchievements(solvedProblems, accuracy, streak, acceptedSubmissions.length);
    
    const analytics = {
      totalProblems,
      solvedProblems,
      accuracy,
      streak,
      favoriteLanguage: getMostUsedLanguage(userSubmissions),
      avgTimePerProblem,
      totalTimeSpent,
      recentActivity,
      topicStats,
      difficultyStats,
      submissionStats,
      achievements
    };
    
    res.json(analytics);
    
  } catch (error) {
    console.error('Error getting analytics dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics dashboard',
      error: error.message
    });
  }
};

// Helper function to calculate streak
function calculateStreak(acceptedSubmissions) {
  if (acceptedSubmissions.length === 0) return 0;
  
  // Group submissions by date
  const submissionDates = acceptedSubmissions
    .map(sub => new Date(sub.submittedAt).toDateString())
    .filter((date, index, array) => array.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  if (submissionDates.length === 0) return 0;
  
  let streak = 1;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  // Check if user solved something today or yesterday
  if (submissionDates[0] !== today && submissionDates[0] !== yesterday) {
    return 0; // Streak broken
  }
  
  // Count consecutive days
  for (let i = 1; i < submissionDates.length; i++) {
    const prevDate = new Date(submissionDates[i - 1]);
    const currDate = new Date(submissionDates[i]);
    const diffDays = (prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000);
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// Calculate topic statistics
async function calculateTopicStats(userId) {
  const acceptedSubmissions = await Submission.find({ 
    userId, 
    status: 'accepted' 
  }).populate('problemId');
  
  const allSubmissions = await Submission.find({ userId }).populate('problemId');
  
  const topicMap = {};
  
  // Initialize topic counts
  const problems = await Problem.find({}, 'primaryTopic');
  problems.forEach(problem => {
    if (problem.primaryTopic) {
      if (!topicMap[problem.primaryTopic]) {
        topicMap[problem.primaryTopic] = { solved: 0, total: 0, attempted: 0 };
      }
      topicMap[problem.primaryTopic].total++;
    }
  });
  
  // Count solved problems per topic
  acceptedSubmissions.forEach(submission => {
    if (submission.problemId && submission.problemId.primaryTopic) {
      const topic = submission.problemId.primaryTopic;
      if (topicMap[topic]) {
        topicMap[topic].solved++;
      }
    }
  });
  
  // Count attempted problems per topic
  allSubmissions.forEach(submission => {
    if (submission.problemId && submission.problemId.primaryTopic) {
      const topic = submission.problemId.primaryTopic;
      if (topicMap[topic]) {
        topicMap[topic].attempted++;
      }
    }
  });
  
  return Object.entries(topicMap)
    .map(([topic, stats]) => ({
      topic,
      solved: stats.solved,
      total: stats.total,
      accuracy: stats.attempted > 0 ? Math.round((stats.solved / stats.attempted) * 100) : 0
    }))
    .filter(topic => topic.total > 0)
    .sort((a, b) => b.solved - a.solved);
}

// Calculate difficulty statistics
async function calculateDifficultyStats(userId) {
  const acceptedSubmissions = await Submission.find({ 
    userId, 
    status: 'accepted' 
  }).populate('problemId');
  
  const difficultyMap = {
    easy: { solved: 0, total: 0 },
    medium: { solved: 0, total: 0 },
    hard: { solved: 0, total: 0 }
  };
  
  // Count total problems by difficulty
  const difficultyCounts = await Problem.aggregate([
    { $group: { _id: '$difficulty', count: { $sum: 1 } } }
  ]);
  
  difficultyCounts.forEach(item => {
    if (difficultyMap[item._id]) {
      difficultyMap[item._id].total = item.count;
    }
  });
  
  // Count solved problems by difficulty
  acceptedSubmissions.forEach(submission => {
    if (submission.problemId && submission.problemId.difficulty) {
      const difficulty = submission.problemId.difficulty;
      if (difficultyMap[difficulty]) {
        difficultyMap[difficulty].solved++;
      }
    }
  });
  
  return difficultyMap;
}

// Calculate submission statistics
function calculateSubmissionStats(submissions) {
  return {
    accepted: submissions.filter(s => s.status === 'accepted').length,
    wrong: submissions.filter(s => s.status === 'wrong_answer').length,
    timeLimit: submissions.filter(s => s.status === 'time_limit_exceeded').length,
    memoryLimit: submissions.filter(s => s.status === 'memory_limit_exceeded').length,
    runtime: submissions.filter(s => s.status === 'runtime_error').length
  };
}

// Calculate recent activity
async function calculateRecentActivity(userId) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const recentSubmissions = await Submission.find({
    userId,
    submittedAt: { $gte: sevenDaysAgo },
    status: 'accepted'
  });
  
  const activityMap = {};
  
  // Group by date
  recentSubmissions.forEach(submission => {
    const date = submission.submittedAt.toISOString().split('T')[0];
    if (!activityMap[date]) {
      activityMap[date] = { problemsSolved: 0, timeSpent: 0 };
    }
    activityMap[date].problemsSolved++;
    activityMap[date].timeSpent += submission.executionTime || 0;
  });
  
  // Convert to array and sort by date
  return Object.entries(activityMap)
    .map(([date, stats]) => ({
      date: new Date(date).toLocaleDateString(),
      problemsSolved: stats.problemsSolved,
      timeSpent: stats.timeSpent
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);
}

// Get most used programming language
function getMostUsedLanguage(submissions) {
  const languageCount = {};
  
  submissions.forEach(submission => {
    const lang = submission.language || 'javascript';
    languageCount[lang] = (languageCount[lang] || 0) + 1;
  });
  
  return Object.entries(languageCount)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'javascript';
}

// Generate achievements based on user progress
function generateAchievements(solvedProblems, accuracy, streak, totalAccepted) {
  const achievements = [];
  
  if (solvedProblems >= 1) {
    achievements.push({
      id: 'first-solve',
      title: 'First Steps',
      description: 'Solved your first problem',
      unlockedAt: 'Recently',
      icon: '🎯'
    });
  }
  
  if (solvedProblems >= 10) {
    achievements.push({
      id: 'ten-solver',
      title: 'Problem Crusher',
      description: 'Solved 10 problems',
      unlockedAt: 'Recently',
      icon: '💪'
    });
  }
  
  if (solvedProblems >= 50) {
    achievements.push({
      id: 'fifty-solver',
      title: 'Coding Warrior',
      description: 'Solved 50 problems',
      unlockedAt: 'Recently',
      icon: '⚔️'
    });
  }
  
  if (accuracy >= 80) {
    achievements.push({
      id: 'accuracy-master',
      title: 'Accuracy Master',
      description: 'Achieved 80%+ accuracy',
      unlockedAt: 'Recently',
      icon: '🎯'
    });
  }
  
  if (streak >= 7) {
    achievements.push({
      id: 'week-streak',
      title: 'Consistent Coder',
      description: '7-day solving streak',
      unlockedAt: 'Recently',
      icon: '🔥'
    });
  }
  
  if (totalAccepted >= 100) {
    achievements.push({
      id: 'century-club',
      title: 'Century Club',
      description: '100 accepted submissions',
      unlockedAt: 'Recently',
      icon: '💯'
    });
  }
  
  return achievements.slice(0, 6); // Show recent 6 achievements
}

module.exports = {
  getDashboard
};
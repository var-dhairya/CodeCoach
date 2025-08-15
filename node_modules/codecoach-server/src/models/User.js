const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: ''
    },
    joinDate: {
      type: Date,
      default: Date.now
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  stats: {
    totalProblems: {
      type: Number,
      default: 0
    },
    solvedProblems: {
      type: Number,
      default: 0
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number, // in minutes
      default: 0
    }
  },
  topicStrengths: {
    type: Map,
    of: {
      score: {
        type: Number,
        default: 0
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      },
      problemsSolved: {
        type: Number,
        default: 0
      },
      averageScore: {
        type: Number,
        default: 0
      }
    },
    default: {}
  },
  preferences: {
    preferredLanguage: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp'],
      default: 'javascript'
    },
    difficultyPreference: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    dailyGoal: {
      type: Number,
      default: 3
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  solvedProblems: [{
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem'
    },
    solvedAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      default: 0
    },
    attempts: {
      type: Number,
      default: 1
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ username: 1, email: 1 });
userSchema.index({ 'stats.solvedProblems': -1 });
userSchema.index({ 'stats.averageScore': -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.profile.lastActive = new Date();
  return this.save();
};

// Calculate overall strength score
userSchema.methods.calculateOverallStrength = function() {
  const topics = Array.from(this.topicStrengths.values());
  if (topics.length === 0) return 0;
  
  const totalScore = topics.reduce((sum, topic) => sum + topic.score, 0);
  return totalScore / topics.length;
};

// Get user's weak topics
userSchema.methods.getWeakTopics = function(threshold = 0.6) {
  const weakTopics = [];
  
  this.topicStrengths.forEach((value, key) => {
    if (value.score < threshold) {
      weakTopics.push({
        topic: key,
        score: value.score,
        problemsSolved: value.problemsSolved
      });
    }
  });
  
  return weakTopics.sort((a, b) => a.score - b.score);
};

// Get user's strong topics
userSchema.methods.getStrongTopics = function(threshold = 0.8) {
  const strongTopics = [];
  
  this.topicStrengths.forEach((value, key) => {
    if (value.score >= threshold) {
      strongTopics.push({
        topic: key,
        score: value.score,
        problemsSolved: value.problemsSolved
      });
    }
  });
  
  return strongTopics.sort((a, b) => b.score - a.score);
};

module.exports = mongoose.model('User', userSchema); 
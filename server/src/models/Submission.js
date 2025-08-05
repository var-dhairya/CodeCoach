const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  testCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    enum: ['passed', 'failed', 'timeout', 'error'],
    required: true
  },
  executionTime: {
    type: Number, // milliseconds
    default: 0
  },
  memoryUsage: {
    type: Number, // MB
    default: 0
  },
  output: {
    type: String,
    default: ''
  },
  expectedOutput: {
    type: String,
    required: true
  },
  error: {
    type: String,
    default: ''
  }
});

const aiReviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'AI review is required']
  },
  suggestions: [{
    type: String,
    trim: true
  }],
  alternativeApproaches: [{
    type: String,
    trim: true
  }],
  complexityAnalysis: {
    timeComplexity: {
      type: String,
      default: ''
    },
    spaceComplexity: {
      type: String,
      default: ''
    },
    isOptimal: {
      type: Boolean,
      default: false
    },
    explanation: {
      type: String,
      default: ''
    }
  },
  codeQuality: {
    readability: {
      type: Number, // 1-10
      min: 1,
      max: 10,
      default: 5
    },
    maintainability: {
      type: Number, // 1-10
      min: 1,
      max: 10,
      default: 5
    },
    bestPractices: {
      type: Number, // 1-10
      min: 1,
      max: 10,
      default: 5
    }
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: [true, 'Problem ID is required']
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    maxlength: [50000, 'Code cannot exceed 50000 characters']
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp'],
    required: [true, 'Programming language is required']
  },
  status: {
    type: String,
    enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error', 'memory_limit_exceeded'],
    required: [true, 'Submission status is required']
  },
  executionTime: {
    type: Number, // milliseconds
    default: 0
  },
  memoryUsage: {
    type: Number, // MB
    default: 0
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  testResults: [testResultSchema],
  aiReview: {
    type: aiReviewSchema,
    default: null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for better query performance
submissionSchema.index({ userId: 1, submittedAt: -1 });
submissionSchema.index({ problemId: 1, status: 1 });
submissionSchema.index({ status: 1, submittedAt: -1 });
submissionSchema.index({ language: 1, submittedAt: -1 });

// Update timestamp before saving
submissionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate score based on test results
submissionSchema.methods.calculateScore = function() {
  if (!this.testResults || this.testResults.length === 0) {
    return 0;
  }
  
  const passedTests = this.testResults.filter(result => result.status === 'passed').length;
  const totalTests = this.testResults.length;
  
  return Math.round((passedTests / totalTests) * 100);
};

// Get execution statistics
submissionSchema.methods.getExecutionStats = function() {
  if (!this.testResults || this.testResults.length === 0) {
    return {
      averageTime: 0,
      averageMemory: 0,
      maxTime: 0,
      maxMemory: 0
    };
  }
  
  const times = this.testResults.map(result => result.executionTime);
  const memories = this.testResults.map(result => result.memoryUsage);
  
  return {
    averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
    averageMemory: memories.reduce((sum, memory) => sum + memory, 0) / memories.length,
    maxTime: Math.max(...times),
    maxMemory: Math.max(...memories)
  };
};

// Check if submission is optimal
submissionSchema.methods.isOptimal = function() {
  if (!this.aiReview || !this.aiReview.complexityAnalysis) {
    return false;
  }
  
  return this.aiReview.complexityAnalysis.isOptimal;
};

// Get submission summary
submissionSchema.methods.getSummary = function() {
  const stats = this.getExecutionStats();
  
  return {
    id: this._id,
    status: this.status,
    score: this.score,
    language: this.language,
    executionTime: this.executionTime,
    memoryUsage: this.memoryUsage,
    testResults: {
      total: this.testResults.length,
      passed: this.testResults.filter(r => r.status === 'passed').length,
      failed: this.testResults.filter(r => r.status === 'failed').length
    },
    averageTime: stats.averageTime,
    averageMemory: stats.averageMemory,
    hasAIReview: !!this.aiReview,
    isOptimal: this.isOptimal(),
    submittedAt: this.submittedAt
  };
};

// Get performance rating
submissionSchema.methods.getPerformanceRating = function() {
  if (this.status !== 'accepted') {
    return 'failed';
  }
  
  const stats = this.getExecutionStats();
  
  if (stats.averageTime < 100 && stats.averageMemory < 50) {
    return 'excellent';
  } else if (stats.averageTime < 500 && stats.averageMemory < 100) {
    return 'good';
  } else if (stats.averageTime < 1000 && stats.averageMemory < 200) {
    return 'average';
  } else {
    return 'poor';
  }
};

module.exports = mongoose.model('Submission', submissionSchema); 
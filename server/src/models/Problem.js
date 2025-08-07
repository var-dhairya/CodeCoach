const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: [true, 'Test case input is required']
  },
  output: {
    type: String,
    required: [true, 'Test case output is required']
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ''
  }
});

const constraintSchema = new mongoose.Schema({
  timeLimit: {
    type: Number, // milliseconds
    default: 1000
  },
  memoryLimit: {
    type: Number, // MB
    default: 256
  },
  inputFormat: {
    type: String,
    default: ''
  },
  outputFormat: {
    type: String,
    default: ''
  }
});

const solutionSchema = new mongoose.Schema({
  approach: {
    type: String,
    default: 'To be determined'
  },
  timeComplexity: {
    type: String,
    default: 'O(n)'
  },
  spaceComplexity: {
    type: String,
    default: 'O(1)'
  },
  code: {
    type: String,
    default: ''
  },
  explanation: {
    type: String,
    default: ''
  }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Problem description is required'],
    maxlength: [10000, 'Description cannot exceed 10000 characters']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Difficulty level is required']
  },
  primaryTopic: {
    type: String,
    required: [true, 'Primary topic is required']
  },
  subTopics: [{
    type: String,
    trim: true
  }],
  allTags: [{
    type: String,
    trim: true
  }],
  source: {
    type: String,
    enum: ['leetcode', 'codeforces', 'hackerrank', 'custom', 'kattis'],
    default: 'custom'
  },
  externalId: {
    type: String,
    default: ''
  },
  testCases: [testCaseSchema],
  constraints: {
    type: constraintSchema,
    default: () => ({})
  },
  solution: {
    type: solutionSchema,
    default: () => ({})
  },
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    popularity: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    totalSolved: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
problemSchema.index({ title: 'text', description: 'text' });
problemSchema.index({ difficulty: 1, primaryTopic: 1 });
problemSchema.index({ source: 1, externalId: 1 });
problemSchema.index({ 'metadata.popularity': -1 });
problemSchema.index({ 'metadata.successRate': -1 });

// Update metadata before saving
problemSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  next();
});

// Calculate success rate
problemSchema.methods.calculateSuccessRate = function() {
  if (this.metadata.totalSubmissions === 0) return 0;
  return (this.metadata.totalSolved / this.metadata.totalSubmissions) * 100;
};

// Update popularity based on views and submissions
problemSchema.methods.updatePopularity = function() {
  const views = this.metadata.totalSubmissions || 0;
  const solved = this.metadata.totalSolved || 0;
  const difficulty = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
  
  this.metadata.popularity = (views * 0.3) + (solved * 0.7) + (difficulty * 0.1);
  return this.save();
};

// Get related problems by topic
problemSchema.methods.getRelatedProblems = async function(limit = 5) {
  const Problem = this.constructor;
  return await Problem.find({
    _id: { $ne: this._id },
    primaryTopic: this.primaryTopic,
    difficulty: this.difficulty,
    isActive: true
  })
  .limit(limit)
  .select('title difficulty primaryTopic metadata.popularity');
};

// Validate test cases
problemSchema.methods.validateTestCases = function() {
  if (!this.testCases || this.testCases.length === 0) {
    throw new Error('At least one test case is required');
  }
  
  this.testCases.forEach((testCase, index) => {
    if (!testCase.input || !testCase.output) {
      throw new Error(`Test case ${index + 1} is incomplete`);
    }
  });
};

// Get problem statistics
problemSchema.methods.getStatistics = function() {
  return {
    totalSubmissions: this.metadata.totalSubmissions,
    totalSolved: this.metadata.totalSolved,
    successRate: this.calculateSuccessRate(),
    popularity: this.metadata.popularity,
    averageTime: this.metadata.averageTime || 0,
    averageMemory: this.metadata.averageMemory || 0
  };
};

module.exports = mongoose.model('Problem', problemSchema); 
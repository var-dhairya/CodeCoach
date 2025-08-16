const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config({ path: './.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    seedUsers();
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

const seedUsers = async () => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('👤 Test user already exists');
      process.exit(0);
    }

    // Create test user
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'test123',
      profile: {
        bio: 'Test user for development',
        joinDate: new Date(),
        lastActive: new Date()
      },
      stats: {
        totalProblems: 0,
        solvedProblems: 0,
        totalSubmissions: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalTimeSpent: 0
      },
      preferences: {
        preferredLanguage: 'javascript',
        difficultyPreference: 'easy',
        dailyGoal: 3
      }
    });

    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: test123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
};

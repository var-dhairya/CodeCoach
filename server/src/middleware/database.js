const mongoose = require('mongoose');

// Database connection middleware
const ensureDbConnection = async (req, res, next) => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return next();
    }

    console.log('🔄 Establishing MongoDB connection for request...');
    
    // Connect to MongoDB with serverless-optimized settings
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 8000,
      connectTimeoutMS: 5000,
      maxPoolSize: 1,
      minPoolSize: 0,
      maxIdleTimeMS: 5000,
      retryWrites: true,
      w: 'majority',
      bufferCommands: false
    });

    console.log('✅ MongoDB connected for request');
    next();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
};

module.exports = { ensureDbConnection };

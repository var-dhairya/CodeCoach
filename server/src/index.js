const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Simple environment loading
console.log('🔍 Current working directory:', process.cwd());
console.log('🔍 __dirname:', __dirname);

// Try to load .env from multiple locations
const envResult1 = dotenv.config({ path: '.env' });
console.log('📁 Tried .env:', envResult1.parsed ? 'SUCCESS' : 'FAILED');

const envResult2 = dotenv.config({ path: path.join(__dirname, '..', '.env') });
console.log('📁 Tried ../.env:', envResult2.parsed ? 'SUCCESS' : 'FAILED');

// Debug: Check what was loaded
console.log('🔧 After loading .env files:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');

// Check required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  // Don't exit in serverless environment
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

// Debug environment variables
console.log('🔧 Final environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');

console.log('PORT:', process.env.PORT || '5000 (default)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development (default)');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://code-coach-client.vercel.app', // Frontend URL from environment
        'https://code-coach-client.vercel.app' // Explicit frontend URL
      ]
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors());

// Lazy MongoDB connection - connect only when needed
let mongooseConnection = null;

const getMongoConnection = async () => {
  if (mongooseConnection && mongoose.connection.readyState === 1) {
    return mongooseConnection;
  }
  
  try {
    console.log('🔄 Establishing MongoDB connection...');
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
    
    mongooseConnection = mongoose.connection;
    console.log('✅ MongoDB connection established');
    return mongooseConnection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

// Monitor MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB connection disconnected');
  mongooseConnection = null;
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB connection reestablished');
  mongooseConnection = mongoose.connection;
});

// Import routes
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const submissionRoutes = require('./routes/submissions');
const analyticsRoutes = require('./routes/analytics');
const importRoutes = require('./routes/import');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/import', importRoutes);

// Basic route
app.get('/', async (req, res) => {
  try {
    const connection = await getMongoConnection();
    res.json({ 
      message: '🚀 CodeCoach API is running!',
      version: '1.0.0',
      status: 'active',
      database: connection.readyState === 1 ? 'connected' : 'disconnected',
      endpoints: {
        auth: '/api/auth',
        health: '/api/health',
        problems: '/api/problems',
        submissions: '/api/submissions',
        analytics: '/api/analytics',
        import: '/api/import'
      }
    });
  } catch (error) {
    res.json({ 
      message: '🚀 CodeCoach API is running!',
      version: '1.0.0',
      status: 'active',
      database: 'disconnected',
      error: error.message,
      endpoints: {
        auth: '/api/auth',
        health: '/api/health',
        problems: '/api/problems',
        submissions: '/api/submissions',
        analytics: '/api/analytics',
        import: '/api/import'
      }
    });
  }
});

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    const connection = await getMongoConnection();
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}` 
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 API available at http://localhost:${PORT}`);
      console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
      console.log(`📊 Problems endpoint at http://localhost:${PORT}/api/problems`);
      console.log(`💻 Submissions endpoint at http://localhost:${PORT}/api/submissions`);
      console.log(`📈 Analytics endpoint at http://localhost:${PORT}/api/analytics`);
      console.log(`🔐 Auth endpoints at http://localhost:${PORT}/api/auth`);
      console.log(`📥 Import endpoints at http://localhost:${PORT}/api/import`);
      console.log('Press Ctrl+C to stop the server');
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err);
      server.close(() => {
        console.log('✅ Server closed due to uncaught exception');
        mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(1);
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      server.close(() => {
        console.log('✅ Server closed due to unhandled rejection');
        mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(1);
      });
    });

  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer(); 

// Export for Vercel serverless functions
module.exports = app; 
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables (works locally; harmless on Vercel)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure required env vars
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment variables');
  throw new Error('MONGODB_URI missing');
}

// Connect to MongoDB once per runtime
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    });
}

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
app.get('/', (req, res) => {
  res.json({
    message: '🚀 CodeCoach API is running!',
    version: '1.0.0',
    status: 'active',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      auth: '/api/auth',
      problems: '/api/problems',
      submissions: '/api/submissions',
      analytics: '/api/analytics',
      import: '/api/import',
    },
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Attach connection for local shutdown usage
app.locals.mongooseConnection = mongoose.connection;

// Export Express app for serverless
module.exports = app;


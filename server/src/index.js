const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Environment variables are loaded from .env file

// Debug environment variables
console.log('🔧 Environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment variables');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    
    // Demo data setup (commented out for now)
    // console.log('Demo data will be created on first login');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
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
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 CodeCoach API is running!',
    version: '1.0.0',
    status: 'active',
    database: 'connected',
          endpoints: {
        auth: '/api/auth',
        problems: '/api/problems',
        submissions: '/api/submissions',
        analytics: '/api/analytics',
        import: '/api/import'
      }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
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
      console.log(`📊 Problems endpoint at http://localhost:${PORT}/api/problems`);
      console.log(`🔐 Auth endpoints at http://localhost:${PORT}/api/auth`);
      console.log(`📈 Analytics endpoint at http://localhost:${PORT}/api/analytics`);
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
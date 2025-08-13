const app = require('./app');
const mongooseConnection = app.locals.mongooseConnection;

// Start server (local development only)
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 API available at http://localhost:${PORT}`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        mongooseConnection.close(false).then(() => {
          console.log('✅ Database connection closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        mongooseConnection.close(false).then(() => {
          console.log('✅ Database connection closed');
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();
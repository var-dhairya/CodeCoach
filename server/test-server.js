const express = require('express');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Test Server is Running!',
    timestamp: new Date().toISOString(),
    status: 'SUCCESS'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime()
  });
});

const PORT = 5000;

console.log('Starting test server...');

const server = app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🌐 Test at: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 
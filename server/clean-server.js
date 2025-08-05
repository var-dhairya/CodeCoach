const express = require('express');

const app = express();

// Basic middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'CodeCoach Server is WORKING!',
    status: 'SUCCESS',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime()
  });
});

// Start server
const PORT = 5000;

console.log('Starting clean server...');

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Test at: http://localhost:${PORT}`);
  console.log(`🏥 Health at: http://localhost:${PORT}/health`);
});

// Keep the server alive
server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 
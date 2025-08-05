const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Simple test server is running!',
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

app.listen(PORT, () => {
  console.log(`🚀 Simple test server running on port ${PORT}`);
  console.log(`📱 Test at http://localhost:${PORT}`);
  console.log(`🏥 Health at http://localhost:${PORT}/health`);
}); 
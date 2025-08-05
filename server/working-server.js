const express = require('express');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 CodeCoach Server is WORKING!',
    timestamp: new Date().toISOString(),
    status: 'SUCCESS'
  });
});

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working!',
    data: 'Everything is fine!'
  });
});

const PORT = 5000;

console.log('Starting server...');

app.listen(PORT, () => {
  console.log(`✅ Server SUCCESSFULLY running on port ${PORT}`);
  console.log(`🌐 Test it at: http://localhost:${PORT}`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log('Press Ctrl+C to stop the server');
});

// Handle errors
app.on('error', (error) => {
  console.error('❌ Server error:', error);
}); 
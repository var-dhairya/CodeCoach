const express = require('express');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Test server on port 3000!',
    timestamp: new Date().toISOString()
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📱 Test at http://localhost:${PORT}`);
}); 
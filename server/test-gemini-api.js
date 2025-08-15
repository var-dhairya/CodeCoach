const axios = require('axios');
require('dotenv').config({ path: './server/.env' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log('🔑 Gemini API Key:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 20) + '...' : 'NOT SET');

// Test different API endpoints and formats
async function testGeminiAPI() {
  console.log('\n🧪 Testing Gemini API...\n');

  // Test 1: Current format (likely wrong)
  console.log('📝 Test 1: Current format');
  try {
    const response1 = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      {
        contents: [{
          parts: [{
            text: 'Hello, can you say "Hello World"?'
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`
        }
      }
    );
    console.log('✅ Test 1 SUCCESS:', response1.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.log('❌ Test 1 FAILED:', error.response?.status, error.response?.data?.error?.message || error.message);
  }

  // Test 2: Correct Gemini API format with query parameter
  console.log('\n📝 Test 2: Correct format with query parameter');
  try {
    const response2 = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: 'Hello, can you say "Hello World"?'
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Test 2 SUCCESS:', response2.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.log('❌ Test 2 FAILED:', error.response?.status, error.response?.data?.error?.message || error.message);
  }

  // Test 3: Alternative model (gemini-1.5-flash)
  console.log('\n📝 Test 3: Alternative model (gemini-1.5-flash)');
  try {
    const response3 = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: 'Hello, can you say "Hello World"?'
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Test 3 SUCCESS:', response3.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.log('❌ Test 3 FAILED:', error.response?.status, error.response?.data?.error?.message || error.message);
  }

  // Test 4: Check if API key is valid by testing a simple endpoint
  console.log('\n📝 Test 4: API key validation');
  try {
    const response4 = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    console.log('✅ Test 4 SUCCESS: API key is valid');
    console.log('Available models:', response4.data.data.map(m => m.name).join(', '));
  } catch (error) {
    console.log('❌ Test 4 FAILED:', error.response?.status, error.response?.data?.error?.message || error.message);
  }
}

testGeminiAPI().catch(console.error);

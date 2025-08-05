const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test authentication endpoints
async function testAuth() {
  console.log('🧪 Testing CodeCoach Authentication API...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test 2: Register new user
    console.log('2️⃣ Testing user registration...');
    const registerData = {
      username: 'testuser',
      email: 'test@codecoach.com',
      password: 'password123'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful:', {
      message: registerResponse.data.message,
      user: registerResponse.data.data.user.username,
      hasToken: !!registerResponse.data.data.token
    });
    console.log('');

    // Test 3: Login
    console.log('3️⃣ Testing user login...');
    const loginData = {
      email: 'test@codecoach.com',
      password: 'password123'
    };
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful:', {
      message: loginResponse.data.message,
      user: loginResponse.data.data.user.username,
      hasToken: !!token
    });
    console.log('');

    // Test 4: Get profile (protected route)
    console.log('4️⃣ Testing protected profile route...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Profile access successful:', {
      user: profileResponse.data.data.user.username,
      email: profileResponse.data.data.user.email
    });
    console.log('');

    // Test 5: Update profile
    console.log('5️⃣ Testing profile update...');
    const updateData = {
      bio: 'Updated bio for testing',
      preferredLanguage: 'python',
      difficultyPreference: 'hard'
    };
    
    const updateResponse = await axios.put(`${BASE_URL}/auth/profile`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Profile update successful:', {
      message: updateResponse.data.message,
      bio: updateResponse.data.data.user.profile.bio,
      language: updateResponse.data.data.user.preferences.preferredLanguage
    });
    console.log('');

    console.log('🎉 All authentication tests passed!');
    console.log('🚀 Your CodeCoach backend is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAuth(); 
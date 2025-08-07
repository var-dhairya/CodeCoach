const axios = require('axios');

// Test the API endpoints
async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');

    // Test basic health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health:', healthResponse.data);

    // Test recommender test endpoint
    console.log('\n2. Testing recommender test endpoint...');
    const testResponse = await axios.get('http://localhost:5000/api/recommender/test');
    console.log('✅ Recommender test:', testResponse.data);

    // Test import without auth
    console.log('\n3. Testing import without auth...');
    const importResponse = await axios.post('http://localhost:5000/api/recommender/test-import');
    console.log('✅ Test import:', importResponse.data);

    console.log('\n🎉 All tests passed! The API is working correctly.');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();
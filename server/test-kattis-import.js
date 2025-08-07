const axios = require('axios');

async function testKattisImport() {
  console.log('🧪 Testing Kattis Import API\n');
  
  // Test URLs
  const testUrls = [
    'https://open.kattis.com/problems/hello',
    'https://open.kattis.com/problems/quadrant',
    'https://open.kattis.com/problems/r2'
  ];
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Server is running:', healthResponse.data.status);
    
    // Test 2: Test scraping service directly
    console.log('\n2. Testing Kattis scraping service...');
    const kattisImportService = require('./src/services/kattisImportService');
    
    for (const url of testUrls) {
      try {
        console.log(`\n   Testing URL: ${url}`);
        const problemData = await kattisImportService.scrapeKattisProblem(url);
        console.log(`   ✅ Title: "${problemData.title}"`);
        console.log(`   ✅ Slug: "${problemData.slug}"`);
        console.log(`   ✅ Description: ${problemData.description.substring(0, 100)}...`);
        console.log(`   ✅ Sample inputs: ${problemData.sampleInputs.length}`);
        console.log(`   ✅ Sample outputs: ${problemData.sampleOutputs.length}`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Kattis import tests completed!');
    console.log('\n📝 To test the full API:');
    console.log('1. Start the server: npm start');
    console.log('2. Login to get an auth token');
    console.log('3. POST to http://localhost:5000/api/import/kattis with:');
    console.log('   { "url": "https://open.kattis.com/problems/hello" }');
    console.log('   Header: Authorization: Bearer <your-token>');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testKattisImport();
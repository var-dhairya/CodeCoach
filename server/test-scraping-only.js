const kattisImportService = require('./src/services/kattisImportService');

async function testScrapingOnly() {
  console.log('🧪 Testing Kattis Scraping Only\n');
  
  const testUrl = 'https://open.kattis.com/problems/hello';
  
  try {
    console.log(`Testing URL: ${testUrl}`);
    const problemData = await kattisImportService.scrapeKattisProblem(testUrl);
    
    console.log('\n✅ Scraping Results:');
    console.log(`   Title: "${problemData.title}"`);
    console.log(`   Slug: "${problemData.slug}"`);
    console.log(`   External ID: "${problemData.externalId}"`);
    console.log(`   Source: "${problemData.source}"`);
    console.log(`   Description length: ${problemData.description.length} chars`);
    console.log(`   Input format: "${problemData.inputFormat.substring(0, 50)}..."`);
    console.log(`   Output format: "${problemData.outputFormat.substring(0, 50)}..."`);
    console.log(`   Sample inputs: ${problemData.sampleInputs.length}`);
    console.log(`   Sample outputs: ${problemData.sampleOutputs.length}`);
    
    if (problemData.sampleInputs.length > 0) {
      console.log(`   First sample input: "${problemData.sampleInputs[0]}"`);
    }
    if (problemData.sampleOutputs.length > 0) {
      console.log(`   First sample output: "${problemData.sampleOutputs[0]}"`);
    }
    
    console.log('\n🎉 Scraping test successful!');
    
  } catch (error) {
    console.error('❌ Scraping test failed:', error.message);
    console.error('Full error:', error);
  }
}

testScrapingOnly();
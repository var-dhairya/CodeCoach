const axios = require('axios');
const cheerio = require('cheerio');

async function debugKattisScraping() {
  console.log('🔍 Debugging Kattis Scraping\n');
  
  const testUrl = 'https://open.kattis.com/problems/24game';
  
  try {
    console.log(`Testing URL: ${testUrl}`);
    
    // Step 1: Test if we can fetch the page
    console.log('\n1. Testing basic page fetch...');
    const response = await axios.get(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000
    });
    
    console.log(`✅ Page fetched successfully`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Content length: ${response.data.length} chars`);
    
    // Step 2: Parse with Cheerio
    console.log('\n2. Testing Cheerio parsing...');
    const $ = cheerio.load(response.data);
    
    // Debug: Show page structure
    console.log(`   Title tag: "${$('title').text()}"`);
    console.log(`   H1 tags found: ${$('h1').length}`);
    
    // Step 3: Test title extraction
    console.log('\n3. Testing title extraction...');
    let title = '';
    
    // Try multiple selectors
    const titleSelectors = [
      'h1.problem-title',
      'h1',
      '.problem-title', 
      'title'
    ];
    
    for (const selector of titleSelectors) {
      const found = $(selector).first().text().trim();
      console.log(`   "${selector}": "${found}"`);
      if (found && !title) {
        title = found;
      }
    }
    
    console.log(`   Final title: "${title}"`);
    
    // Step 4: Test description extraction
    console.log('\n4. Testing description extraction...');
    const descSelectors = [
      '.problem_description',
      '.problem-description',
      '.problem_statement',
      '.problem-statement',
      '.main',
      '.content'
    ];
    
    let description = '';
    for (const selector of descSelectors) {
      const found = $(selector).first().text().trim();
      if (found) {
        console.log(`   "${selector}": "${found.substring(0, 100)}..."`);
        if (!description) description = found;
      } else {
        console.log(`   "${selector}": Not found`);
      }
    }
    
    // Step 5: Test sample extraction
    console.log('\n5. Testing sample extraction...');
    const sampleInputs = [];
    const sampleOutputs = [];
    
    $('pre.sample-input, .sample-input pre, .sample_input pre').each((i, el) => {
      const input = $(el).text().trim();
      if (input) sampleInputs.push(input);
    });
    
    $('pre.sample-output, .sample-output pre, .sample_output pre').each((i, el) => {
      const output = $(el).text().trim();
      if (output) sampleOutputs.push(output);
    });
    
    console.log(`   Sample inputs found: ${sampleInputs.length}`);
    console.log(`   Sample outputs found: ${sampleOutputs.length}`);
    
    // Step 6: Show all pre tags for debugging
    console.log('\n6. All <pre> tags found:');
    $('pre').each((i, el) => {
      const text = $(el).text().trim();
      const classes = $(el).attr('class') || 'no-class';
      console.log(`   Pre ${i}: class="${classes}", content="${text.substring(0, 50)}..."`);
    });
    
    // Step 7: Show page structure
    console.log('\n7. Page structure analysis:');
    console.log(`   All classes with 'sample': ${$('[class*="sample"]').length}`);
    console.log(`   All classes with 'input': ${$('[class*="input"]').length}`);
    console.log(`   All classes with 'output': ${$('[class*="output"]').length}`);
    console.log(`   All classes with 'problem': ${$('[class*="problem"]').length}`);
    
    console.log('\n✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers
    });
  }
}

debugKattisScraping();
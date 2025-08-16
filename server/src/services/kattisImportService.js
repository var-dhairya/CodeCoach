const axios = require('axios');
const cheerio = require('cheerio');
const Problem = require('../models/Problem');

class KattisImportService {
  // Clean and normalize text to handle UTF-8 encoding issues
  cleanText(text) {
    if (!text) return '';
    
    return text
      // Normalize Unicode characters
      .normalize('NFKC')
      // Replace mathematical notation with plain text
      .replace(/\$(\d+)\$-D/g, '$1D') // Convert $2$-D to 2D
      .replace(/\$(\d+)\$-D/g, '$1D') // Convert $1$-D to 1D
      // Remove other LaTeX-style math notation
      .replace(/\$([^$]+)\$/g, '$1') // Remove $...$ math notation
      // Handle specific patterns like "company.1" -> "company. 1"
      .replace(/([a-zA-Z])\.(\d+)/g, '$1. $2') // Add space after period before number
      // Clean up special characters
      .replace(/[\u2018\u2019]/g, "'") // Smart quotes to regular quotes
      .replace(/[\u201C\u201D]/g, '"') // Smart quotes to regular quotes
      .replace(/[\u2013\u2014]/g, '-') // Em/en dashes to regular dashes
      // Remove any remaining control characters
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      // Clean up multiple spaces and newlines
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  // Extract clean text from HTML element, handling entities and special characters
  extractCleanText($, element) {
    if (!element) return '';
    
    // Get the HTML content first
    let html = $(element).html() || '';
    
    // Decode HTML entities
    html = html
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&hellip;/g, '...');
    
    // Now get the text content
    let text = $(element).text().trim();
    
    // Clean the text
    text = this.cleanText(text);
    
    return text;
  }

  // Extract text from HTML content more robustly, handling complex structures
  extractRobustText($, selector) {
    let text = '';
    
    try {
      // Try to get the element
      const element = $(selector);
      if (element.length === 0) {
        return '';
      }
      
      // First try to get clean text
      text = this.extractCleanText($, element);
      
      // If that doesn't work well, try a different approach
      if (!text || text.length < 10) {
        // Get all text nodes recursively
        const textNodes = [];
        element.find('*').each((i, el) => {
          const node = $(el);
          if (node.children().length === 0) { // Leaf node
            const nodeText = node.text().trim();
            if (nodeText && nodeText.length > 0) {
              textNodes.push(nodeText);
            }
          }
        });
        text = textNodes.join(' ').trim();
        text = this.cleanText(text);
      }
      
    } catch (error) {
      console.error(`Error extracting text from ${selector}:`, error.message);
      // Fallback: just get the text content
      text = $(selector).text().trim();
      text = this.cleanText(text);
    }
    
    return text;
  }

  // Extract text from the entire problem body, handling complex HTML structures
  extractFullProblemText($) {
    let fullText = '';
    
    try {
      // Try to get the problem body
      const problemBody = $('.problembody');
      if (problemBody.length > 0) {
        // Get all text content, preserving some structure
        const textParts = [];
        
        // Get text from different types of elements
        problemBody.find('p, h1, h2, h3, h4, h5, h6, div, span').each((i, el) => {
          const element = $(el);
          const tagName = element.prop('tagName').toLowerCase();
          const text = this.extractCleanText($, element);
          
          if (text && text.length > 10) {
            // Add appropriate spacing based on element type
            if (tagName.startsWith('h')) {
              textParts.push(`\n\n${text}\n`);
            } else if (tagName === 'p') {
              textParts.push(text);
            } else {
              textParts.push(text);
            }
          }
        });
        
        fullText = textParts.join('\n\n');
      }
      
      // If no problem body found, try alternative selectors
      if (!fullText) {
        const mainContent = $('main, .content, .problem-content, #content');
        if (mainContent.length > 0) {
          fullText = this.extractRobustText($, mainContent);
        }
      }
      
      // Final fallback: get all text from the page
      if (!fullText) {
        fullText = $('body').text().trim();
      }
      
      // Clean the full text
      fullText = this.cleanText(fullText);
      
      // Remove excessive whitespace
      fullText = fullText.replace(/\n{3,}/g, '\n\n');
      
    } catch (error) {
      console.error('Error extracting full problem text:', error.message);
      // Fallback to basic text extraction
      fullText = $('body').text().trim();
      fullText = this.cleanText(fullText);
    }
    
    return fullText;
  }

  // Generate slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single
      .replace(/^-|-$/g, '');   // Remove leading/trailing hyphens
  }

  // Scrape Kattis problem from URL
  async scrapeKattisProblem(url) {
    try {
      console.log(`Scraping Kattis problem from: ${url}`);
      
      // Validate URL
      if (!url.includes('kattis.com/problems/')) {
        throw new Error('Invalid Kattis URL. Must be a Kattis problem URL.');
      }

      // Fetch the page
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      console.log(`✅ Successfully fetched page (${response.data.length} characters)`);
      
      const $ = cheerio.load(response.data);
      
      // Debug: Log raw content for troubleshooting
      this.logRawContent($);
      
      // Extract problem data
      const title = this.extractTitle($);
      console.log(`📝 Extracted title: "${title}"`);
      
      let description = this.extractDescription($);
      console.log(`📝 Extracted description: ${description.length} characters`);
      
      // If description is too short, try to extract full problem text
      if (description.length < 200) {
        console.log(`⚠️ Description too short, trying full text extraction...`);
        const fullText = this.extractFullProblemText($);
        if (fullText.length > description.length) {
          console.log(`📝 Using full text extraction: ${fullText.length} characters`);
          // Use the full text as description
          description = fullText;
        }
      }
      
      const inputFormat = this.extractInputFormat($);
      console.log(`📝 Extracted input format: ${inputFormat.length} characters`);
      
      const outputFormat = this.extractOutputFormat($);
      console.log(`📝 Extracted output format: ${outputFormat.length} characters`);
      
      const { sampleInputs, sampleOutputs } = this.extractSamples($);
      console.log(`📝 Extracted ${sampleInputs.length} sample inputs and ${sampleOutputs.length} sample outputs`);
      
      // Generate slug
      const slug = this.generateSlug(title);
      console.log(`🔗 Generated slug: "${slug}"`);
      
      // Extract problem ID from URL
      const problemId = url.split('/problems/')[1].split('/')[0];
      
      return {
        title,
        slug,
        description,
        inputFormat,
        outputFormat,
        sampleInputs,
        sampleOutputs,
        externalId: problemId,
        source: 'kattis',
        originalUrl: url
      };
    } catch (error) {
      console.error('❌ Error scraping Kattis problem:', error.message);
      if (error.response) {
        console.error(`   HTTP Status: ${error.response.status}`);
        console.error(`   Response length: ${error.response.data?.length || 'unknown'}`);
      }
      throw new Error(`Failed to scrape Kattis problem: ${error.message}`);
    }
  }

  // Extract title from Kattis page
  extractTitle($) {
    // Try multiple selectors for title
    let title = $('h1.problem-title').text().trim();
    if (!title) title = $('h1').first().text().trim();
    if (!title) title = $('.problem-title').text().trim();
    if (!title) title = $('title').text().split(' - ')[0].trim();
    
    if (!title) {
      throw new Error('Could not extract problem title');
    }
    
    return this.cleanText(title);
  }

  // Extract description from Kattis page
  extractDescription($) {
    let description = '';
    
    // Kattis uses .problembody for the main content
    const problemBody = $('.problembody');
    if (problemBody.length > 0) {
      // Get all paragraphs from the problem body
      const paragraphs = [];
      problemBody.find('p').each((i, el) => {
        const text = this.extractRobustText($, el);
        if (text.length > 20) { // Skip very short paragraphs
          paragraphs.push(text);
        }
      });
      description = paragraphs.join('\n\n');
    }
    
    // Fallback: try to get first few paragraphs
    if (!description) {
      const paragraphs = [];
      $('p').each((i, el) => {
        const text = this.extractRobustText($, el);
        if (text.length > 50 && paragraphs.length < 3) {
          paragraphs.push(text);
        }
      });
      description = paragraphs.join('\n\n');
    }
    
    // If still no description, try to get text from the entire problem body
    if (!description || description.length < 100) {
      description = this.extractRobustText($, '.problembody');
    }
    
    return description || 'Problem description not available';
  }

  // Extract input format
  extractInputFormat($) {
    let inputFormat = '';
    
    // Look for "Input" h2 header and get the following content
    $('h2').each((i, el) => {
      if ($(el).text().trim().toLowerCase() === 'input') {
        // Get all paragraphs after the Input header until the next header
        let current = $(el).next();
        const inputParagraphs = [];
        
        while (current.length > 0 && !current.is('h2') && inputParagraphs.length < 3) {
          if (current.is('p')) {
            const text = this.extractCleanText($, current);
            if (text.length > 10) {
              inputParagraphs.push(text);
            }
          }
          current = current.next();
        }
        
        inputFormat = inputParagraphs.join(' ');
      }
    });
    
    return inputFormat || 'Input format not specified';
  }

  // Extract output format
  extractOutputFormat($) {
    let outputFormat = '';
    
    // Look for "Output" h2 header and get the following content
    $('h2').each((i, el) => {
      if ($(el).text().trim().toLowerCase() === 'output') {
        // Get all paragraphs after the Output header until the next header
        let current = $(el).next();
        const outputParagraphs = [];
        
        while (current.length > 0 && !current.is('h2') && outputParagraphs.length < 3) {
          if (current.is('p')) {
            const text = this.extractCleanText($, current);
            if (text.length > 10) {
              outputParagraphs.push(text);
            }
          }
          current = current.next();
        }
        
        outputFormat = outputParagraphs.join(' ');
      }
    });
    
    return outputFormat || 'Output format not specified';
  }

  // Extract sample inputs and outputs
  extractSamples($) {
    const sampleInputs = [];
    const sampleOutputs = [];
    
    // Kattis uses tables with headers like "Sample Input 1", "Sample Output 1"
    $('table').each((tableIndex, table) => {
      const headers = $(table).find('th').map((i, th) => $(th).text().trim()).get();
      const rows = $(table).find('tr');
      
      // Check if this table contains sample data
      const hasInputHeader = headers.some(h => h.toLowerCase().includes('sample input'));
      const hasOutputHeader = headers.some(h => h.toLowerCase().includes('sample output'));
      
      if (hasInputHeader && hasOutputHeader) {
        // Find the data row (usually the second row)
        const dataRow = rows.eq(1);
        const cells = dataRow.find('td');
        
        if (cells.length >= 2) {
          // First cell is input, second is output
          const input = cells.eq(0).find('pre').text().trim() || cells.eq(0).text().trim();
          const output = cells.eq(1).find('pre').text().trim() || cells.eq(1).text().trim();
          
          if (input) sampleInputs.push(input);
          if (output) sampleOutputs.push(output);
        }
      }
    });
    
    // Alternative method: Look for .sample elements
    if (sampleInputs.length === 0) {
      $('.sample').each((i, el) => {
        const text = $(el).text();
        const preElements = $(el).find('pre');
        
        if (preElements.length >= 2) {
          // Assume first pre is input, second is output
          const input = preElements.eq(0).text().trim();
          const output = preElements.eq(1).text().trim();
          
          if (input && output) {
            sampleInputs.push(input);
            sampleOutputs.push(output);
          }
        }
      });
    }
    
    // Final fallback: Parse pre tags in pairs
    if (sampleInputs.length === 0) {
      const allPres = $('pre');
      for (let i = 0; i < allPres.length; i += 2) {
        if (i + 1 < allPres.length) {
          const input = $(allPres[i]).text().trim();
          const output = $(allPres[i + 1]).text().trim();
          
          if (input && output) {
            sampleInputs.push(input);
            sampleOutputs.push(output);
          }
        }
      }
    }
    
    return { sampleInputs, sampleOutputs };
  }

  // Import problem to database
  async importProblem(problemData) {
    try {
      // Check if problem already exists
      const existingProblem = await Problem.findOne({ 
        $or: [
          { slug: problemData.slug },
          { externalId: problemData.externalId, source: 'kattis' }
        ]
      });
      
      if (existingProblem) {
        return {
          success: false,
          message: 'Problem already exists',
          existing: true
        };
      }
      
      // Create test cases from samples
      const testCases = [];
      for (let i = 0; i < Math.max(problemData.sampleInputs.length, problemData.sampleOutputs.length); i++) {
        testCases.push({
          input: problemData.sampleInputs[i] || '',
          output: problemData.sampleOutputs[i] || '',
          isHidden: false,
          description: `Sample test case ${i + 1}`
        });
      }
      
      // Create new problem
      const newProblem = new Problem({
        title: problemData.title,
        slug: problemData.slug,
        description: problemData.description,
        difficulty: 'medium', // Default difficulty
        primaryTopic: 'implementation', // Default topic
        subTopics: ['implementation'],
        source: problemData.source,
        externalId: problemData.externalId,
        isPremium: false,
        testCases: testCases.length > 0 ? testCases : [
          {
            input: "Sample input",
            output: "Sample output",
            isHidden: false,
            description: "Default test case"
          }
        ],
        constraints: {
          timeLimit: 2000,
          memoryLimit: 256,
          inputFormat: problemData.inputFormat,
          outputFormat: problemData.outputFormat
        },
        solution: this.generateSolution(problemData), // Generate intelligent solution
        metadata: {
          originalUrl: problemData.originalUrl,
          importedAt: new Date(),
          popularity: 0.5
        }
      });
      
      const savedProblem = await newProblem.save();
      
      return {
        success: true,
        message: 'Problem imported successfully',
        problem: savedProblem
      };
    } catch (error) {
      console.error('Error importing problem:', error);
      throw new Error(`Failed to import problem: ${error.message}`);
    }
  }

  // Generate topic from title/description
  inferTopicFromTitle(title) {
    const topics = {
      'graph': ['graph', 'tree', 'dfs', 'bfs', 'shortest', 'path'],
      'dynamic programming': ['dp', 'dynamic', 'fibonacci', 'knapsack', 'optimal'],
      'string': ['string', 'substring', 'palindrome', 'match'],
      'math': ['math', 'number', 'prime', 'gcd', 'modulo', 'factorial', 'game', 'calculate'],
      'greedy': ['greedy', 'interval', 'schedule'],
      'sorting': ['sort', 'merge', 'quick'],
      'implementation': ['simulation', 'array', 'output', 'print']
    };
    
    const lowerTitle = title.toLowerCase();
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => lowerTitle.includes(keyword))) {
        return topic;
      }
    }
    
    return 'implementation';
  }

  // Generate solution based on problem analysis
  generateSolution(problemData) {
    const { title, description, inputFormat, outputFormat, sampleInputs, sampleOutputs } = problemData;
    const topic = this.inferTopicFromTitle(title);
    
    // Analyze the problem to generate appropriate solution
    const solution = {
      approach: this.generateApproach(title, description, topic),
      timeComplexity: this.estimateTimeComplexity(description, topic),
      spaceComplexity: this.estimateSpaceComplexity(description, topic),
      code: this.generateCodeTemplate(title, description, topic, sampleInputs, sampleOutputs),
      explanation: this.generateExplanation(title, description, topic, sampleInputs, sampleOutputs)
    };
    
    return solution;
  }

  // Generate approach description
  generateApproach(title, description, topic) {
    const approaches = {
      'graph': 'Use graph traversal algorithms (DFS/BFS) or shortest path algorithms to solve the connectivity/path problems.',
      'dynamic programming': 'Break down the problem into overlapping subproblems and use memoization or tabulation to avoid redundant calculations.',
      'string': 'Use string manipulation techniques, pattern matching, or character-by-character processing.',
      'math': 'Apply mathematical formulas, number theory concepts, or iterative calculations.',
      'greedy': 'Make locally optimal choices at each step to reach a global optimum.',
      'sorting': 'Sort the input data and then process it in the sorted order.',
      'implementation': 'Follow the problem statement step by step with careful implementation of the required logic.'
    };
    
    let approach = approaches[topic] || approaches['implementation'];
    
    // Add specific hints based on title/description keywords
    const lowerTitle = title.toLowerCase();
    const lowerDesc = description.toLowerCase();
    
    if (lowerTitle.includes('game') || lowerDesc.includes('game')) {
      approach += ' This appears to be a game theory problem - consider the rules and winning conditions carefully.';
    }
    if (lowerTitle.includes('shortest') || lowerDesc.includes('shortest')) {
      approach += ' Use Dijkstra\'s algorithm or BFS for shortest path problems.';
    }
    if (lowerDesc.includes('maximum') || lowerDesc.includes('minimum')) {
      approach += ' Focus on optimization - consider greedy approach or dynamic programming.';
    }
    if (lowerTitle.includes('24') && lowerTitle.includes('game')) {
      approach += ' For the 24 game, use recursive backtracking to try all possible combinations of operations (+, -, *, /) and parentheses until you find one that equals the target.';
    }
    
    return approach;
  }

  // Estimate time complexity
  estimateTimeComplexity(description, topic) {
    const complexities = {
      'graph': 'O(V + E)',
      'dynamic programming': 'O(n²)',
      'string': 'O(n)',
      'math': 'O(n!)', // For game problems with combinations
      'greedy': 'O(n log n)',
      'sorting': 'O(n log n)',
      'implementation': 'O(n)'
    };
    
    // Adjust based on description hints
    if (description.includes('nested') || description.includes('all pairs')) {
      return 'O(n²)';
    }
    if (description.includes('sort')) {
      return 'O(n log n)';
    }
    if (description.includes('combinations') || description.includes('permutations')) {
      return 'O(n!)';
    }
    
    return complexities[topic] || 'O(n)';
  }

  // Estimate space complexity
  estimateSpaceComplexity(description, topic) {
    const complexities = {
      'graph': 'O(V)',
      'dynamic programming': 'O(n)',
      'string': 'O(1)',
      'math': 'O(n)', // For recursion stack in game problems
      'greedy': 'O(1)',
      'sorting': 'O(1)',
      'implementation': 'O(1)'
    };
    
    if (description.includes('store') || description.includes('cache') || description.includes('memoiz')) {
      return 'O(n)';
    }
    if (description.includes('recursive') || description.includes('backtrack')) {
      return 'O(n)';
    }
    
    return complexities[topic] || 'O(1)';
  }

  // Generate code template
  generateCodeTemplate(title, description, topic, sampleInputs, sampleOutputs) {
    const hasMultipleTestCases = sampleInputs.length > 1;
    const inputPattern = this.analyzeInputPattern(sampleInputs);
    
    let code = `// ${title} - Solution\n`;
    code += `// Topic: ${topic}\n`;
    code += `// Approach: ${this.generateApproach(title, description, topic).split('.')[0]}\n\n`;
    
    if (topic === 'math' && title.toLowerCase().includes('game')) {
      // Mathematical game solution template (like 24 game)
      code += `#include <iostream>\n#include <vector>\n#include <stack>\n#include <string>\n#include <sstream>\nusing namespace std;\n\n`;
      code += `// Recursive function to try all combinations\n`;
      code += `string solve(vector<double>& nums, double target, double eps = 1e-6) {\n`;
      code += `    if (nums.size() == 1) {\n`;
      code += `        return abs(nums[0] - target) < eps ? to_string((int)nums[0]) : "";\n`;
      code += `    }\n    \n`;
      code += `    for (int i = 0; i < nums.size(); i++) {\n`;
      code += `        for (int j = i + 1; j < nums.size(); j++) {\n`;
      code += `            double a = nums[i], b = nums[j];\n`;
      code += `            vector<double> next;\n`;
      code += `            \n`;
      code += `            // Copy remaining numbers\n`;
      code += `            for (int k = 0; k < nums.size(); k++) {\n`;
      code += `                if (k != i && k != j) next.push_back(nums[k]);\n`;
      code += `            }\n            \n`;
      code += `            // Try all operations\n`;
      code += `            vector<pair<double, string>> ops = {\n`;
      code += `                {a + b, "(" + to_string((int)a) + "+" + to_string((int)b) + ")"},\n`;
      code += `                {a - b, "(" + to_string((int)a) + "-" + to_string((int)b) + ")"},\n`;
      code += `                {b - a, "(" + to_string((int)b) + "-" + to_string((int)a) + ")"},\n`;
      code += `                {a * b, "(" + to_string((int)a) + "*" + to_string((int)b) + ")"},\n`;
      code += `            };\n`;
      code += `            if (abs(b) > eps) ops.push_back({a / b, "(" + to_string((int)a) + "/" + to_string((int)b) + ")"});\n`;
      code += `            if (abs(a) > eps) ops.push_back({b / a, "(" + to_string((int)b) + "/" + to_string((int)a) + ")"});\n            \n`;
      code += `            for (auto& op : ops) {\n`;
      code += `                next.push_back(op.first);\n`;
      code += `                string result = solve(next, target, eps);\n`;
      code += `                if (!result.empty()) {\n`;
      code += `                    // Replace the last number with the operation\n`;
      code += `                    return result; // Simplified return\n`;
      code += `                }\n`;
      code += `                next.pop_back();\n`;
      code += `            }\n`;
      code += `        }\n`;
      code += `    }\n`;
      code += `    return "";\n`;
      code += `}\n\n`;
      code += `int main() {\n`;
      code += `    int c, t;\n    cin >> c >> t;\n`;
      code += `    vector<double> cards(c);\n`;
      code += `    for(int i = 0; i < c; i++) {\n`;
      code += `        int x; cin >> x; cards[i] = x;\n`;
      code += `    }\n    \n`;
      code += `    string result = solve(cards, t);\n`;
      code += `    cout << result << endl;\n`;
      code += `    return 0;\n}\n`;
    } else if (topic === 'implementation') {
      // Basic implementation template
      code += `#include <iostream>\n`;
      if (description.includes('string') || (sampleOutputs.length > 0 && sampleOutputs[0].includes('string'))) {
        code += `#include <string>\n`;
      }
      if (description.includes('vector') || description.includes('array')) {
        code += `#include <vector>\n`;
      }
      code += `using namespace std;\n\n`;
      code += `int main() {\n`;
      
      if (inputPattern.includes('two_integers')) {
        code += `    int a, b;\n    cin >> a >> b;\n`;
      } else if (inputPattern.includes('string')) {
        code += `    string input;\n    getline(cin, input);\n`;
      } else if (inputPattern.includes('two_lines')) {
        code += `    int c, t;\n    cin >> c >> t;\n`;
        code += `    // Read second line of input\n`;
      } else {
        code += `    // Read input based on problem requirements\n`;
        code += `    // Hint: ${inputFormat.substring(0, 50)}...\n`;
      }
      
      code += `    \n    // TODO: Implement solution logic here\n`;
      code += `    // Follow the problem description step by step\n    \n`;
      
      if (sampleOutputs.length > 0 && sampleOutputs[0].includes('(')) {
        code += `    // Output format: mathematical expression with parentheses\n`;
        code += `    cout << result_expression << endl;\n`;
      } else {
        code += `    cout << result << endl;\n`;
      }
      
      code += `    return 0;\n}\n`;
    } else {
      // Generic template for other topics
      code += `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\n`;
      code += `int main() {\n`;
      code += `    // Read input according to: ${inputFormat.substring(0, 100)}\n`;
      code += `    \n    // TODO: Implement ${topic} solution\n`;
      code += `    // Output format: Check problem description\n`;
      code += `    \n    return 0;\n}\n`;
    }
    
    return code;
  }

  // Analyze input pattern from samples
  analyzeInputPattern(sampleInputs) {
    if (sampleInputs.length === 0) return 'unknown';
    
    const firstInput = sampleInputs[0];
    const lines = firstInput.split('\n');
    
    if (lines.length === 1) {
      const parts = lines[0].split(' ');
      if (parts.length === 2) {
        return 'two_integers';
      }
      return 'single_line';
    } else if (lines.length === 2) {
      return 'two_lines';
    }
    
    return 'multiple_lines';
  }

  // Generate explanation
  generateExplanation(title, description, topic, sampleInputs, sampleOutputs) {
    let explanation = `**Problem:** ${title}\n\n`;
    explanation += `**Category:** ${topic.charAt(0).toUpperCase() + topic.slice(1)}\n\n`;
    
    explanation += `**Problem Analysis:**\n`;
    explanation += `${description.substring(0, 300)}${description.length > 300 ? '...' : ''}\n\n`;
    
    if (sampleInputs.length > 0) {
      explanation += `**Sample Analysis:**\n`;
      for (let i = 0; i < Math.min(sampleInputs.length, 2); i++) {
        const input = sampleInputs[i].replace(/\n/g, ' ');
        const output = sampleOutputs[i] || 'N/A';
        explanation += `- **Test Case ${i + 1}:** Input \`${input}\` → Output \`${output}\`\n`;
        
        if (title.toLowerCase().includes('24') && title.toLowerCase().includes('game')) {
          explanation += `  - This shows how to combine the numbers ${input.split(' ').slice(1).join(', ')} to get ${input.split(' ')[1]} using the expression ${output}\n`;
        }
      }
      explanation += '\n';
    }
    
    explanation += `**Solution Approach:**\n`;
    explanation += `1. **Input Parsing:** ${this.getInputHint(sampleInputs)}\n`;
    explanation += `2. **Core Logic:** ${this.getCoreLogicHint(title, topic)}\n`;
    explanation += `3. **Output:** ${this.getOutputHint(sampleOutputs)}\n\n`;
    
    explanation += `**Implementation Tips:**\n`;
    explanation += this.getImplementationTips(title, topic, description);
    
    return explanation;
  }

  // Helper methods for explanation generation
  getInputHint(sampleInputs) {
    if (sampleInputs.length === 0) return 'Parse input according to problem specification';
    
    const lines = sampleInputs[0].split('\n');
    if (lines.length === 2) {
      return `First line contains parameters, second line contains the data array`;
    }
    return 'Read input values as specified in the input format';
  }

  getCoreLogicHint(title, topic) {
    if (title.toLowerCase().includes('24') && title.toLowerCase().includes('game')) {
      return 'Use recursive backtracking to try all combinations of operations and parentheses';
    }
    
    const hints = {
      'math': 'Apply mathematical operations or formulas',
      'graph': 'Build graph and apply traversal algorithms',
      'dynamic programming': 'Define optimal substructure and solve subproblems',
      'string': 'Process string character by character or use pattern matching',
      'implementation': 'Follow the problem logic step by step'
    };
    
    return hints[topic] || 'Implement the solution according to problem requirements';
  }

  getOutputHint(sampleOutputs) {
    if (sampleOutputs.length === 0) return 'Output the result as specified';
    
    const firstOutput = sampleOutputs[0];
    if (firstOutput.includes('(') && firstOutput.includes(')')) {
      return 'Output mathematical expression with proper parentheses';
    }
    if (firstOutput.match(/^\d+$/)) {
      return 'Output a single integer result';
    }
    return 'Output in the format shown in sample outputs';
  }

  getImplementationTips(title, topic, description) {
    let tips = `- **Time Complexity:** Consider the constraints and choose an efficient algorithm\n`;
    tips += `- **Edge Cases:** Handle boundary conditions and invalid inputs\n`;
    
    if (title.toLowerCase().includes('game')) {
      tips += `- **Game Logic:** Understand the rules thoroughly before implementing\n`;
      tips += `- **Backtracking:** Use systematic exploration of all possibilities\n`;
    }
    
    if (topic === 'math') {
      tips += `- **Precision:** Be careful with floating point calculations\n`;
      tips += `- **Operations:** Consider order of operations and parentheses\n`;
    }
    
    return tips;
  }

  // Test method to verify text cleaning works correctly
  testTextCleaning() {
    const testCases = [
      {
        input: "Frogger is a classic $2$-D video game that challenges the player to move a frog character safely across a traffic-filled road and a hazardous river. What is not well known is that Frogger actually began as a prototype board game based on a $1$-D concept at a now-defunct toy company.1 After spending millions of dollars following the advice of consultants, company executives realized that the resulting game was almost completely deterministic, and therefore not much fun to play,2 so they sold all Frogger rights to a video game company in an attempt to recoup some of the development costs. The rest, as they say, is video game history.",
        expected: "Frogger is a classic 2D video game that challenges the player to move a frog character safely across a traffic-filled road and a hazardous river. What is not well known is that Frogger actually began as a prototype board game based on a 1D concept at a now-defunct toy company.1 After spending millions of dollars following the advice of consultants, company executives realized that the resulting game was almost completely deterministic, and therefore not much fun to play,2 so they sold all Frogger rights to a video game company in an attempt to recoup some of the development costs. The rest, as they say, is video game history."
      },
      {
        input: "Test with smart quotes: 'hello' and \"world\" and em-dash — and en-dash –",
        expected: "Test with smart quotes: 'hello' and \"world\" and em-dash - and en-dash -"
      }
    ];

    console.log('🧪 Testing text cleaning functionality...');
    testCases.forEach((testCase, index) => {
      const result = this.cleanText(testCase.input);
      const passed = result === testCase.expected;
      console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
      if (!passed) {
        console.log(`  Input:    "${testCase.input}"`);
        console.log(`  Expected: "${testCase.expected}"`);
        console.log(`  Got:      "${result}"`);
      }
    });
  }

  // Debug method to log raw HTML content for troubleshooting
  logRawContent($, selector = '.problembody') {
    try {
      const element = $(selector);
      if (element.length > 0) {
        console.log(`🔍 Raw HTML content from ${selector}:`);
        console.log(element.html().substring(0, 1000) + '...');
        console.log(`📏 Element length: ${element.html().length} characters`);
      } else {
        console.log(`❌ No element found with selector: ${selector}`);
        // Try to find alternative selectors
        const alternatives = ['main', '.content', '.problem-content', '#content', 'body'];
        alternatives.forEach(alt => {
          const altElement = $(alt);
          if (altElement.length > 0) {
            console.log(`🔍 Found alternative selector: ${alt} (${altElement.html().length} characters)`);
          }
        });
      }
    } catch (error) {
      console.error(`Error logging raw content from ${selector}:`, error.message);
    }
  }
}

module.exports = new KattisImportService();
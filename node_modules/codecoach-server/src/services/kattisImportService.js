const axios = require('axios');
const cheerio = require('cheerio');
const Problem = require('../models/Problem');

class KattisImportService {
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

      const $ = cheerio.load(response.data);
      
      // Extract problem data
      const title = this.extractTitle($);
      const description = this.extractDescription($);
      const inputFormat = this.extractInputFormat($);
      const outputFormat = this.extractOutputFormat($);
      const { sampleInputs, sampleOutputs } = this.extractSamples($);
      
      // Generate slug
      const slug = this.generateSlug(title);
      
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
      console.error('Error scraping Kattis problem:', error.message);
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
    
    return title;
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
        const text = $(el).text().trim();
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
        const text = $(el).text().trim();
        if (text.length > 50 && paragraphs.length < 3) {
          paragraphs.push(text);
        }
      });
      description = paragraphs.join('\n\n');
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
            const text = current.text().trim();
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
            const text = current.text().trim();
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
}

module.exports = new KattisImportService();
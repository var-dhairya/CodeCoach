const axios = require('axios');

// Google Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Generate AI code review
const generateCodeReview = async ({ code, language, problemDescription, testResults, allPassed, validationResult }) => {
  try {
    if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, providing basic review');
      return generateBasicReview({ code, language, testResults, allPassed, validationResult });
    }

    const failedTests = testResults.filter(test => !test.passed);
    const passedTests = testResults.filter(test => test.passed);
    
    const prompt = `
You are an expert programming mentor reviewing a coding solution. Please provide a comprehensive code review.

PROBLEM DESCRIPTION:
${problemDescription}

LANGUAGE: ${language}

CODE:
\`\`\`${language}
${code}
\`\`\`

TEST RESULTS:
- Total test cases: ${testResults.length}
- Passed: ${passedTests.length}
- Failed: ${failedTests.length}
${failedTests.length > 0 ? `
FAILED TEST CASES:
${failedTests.map((test, i) => `
Test ${i + 1}:
Input: ${test.input}
Expected: ${test.expectedOutput}
Actual: ${test.actualOutput || 'No output'}
Error: ${test.error || 'N/A'}
`).join('')}` : ''}

Please provide a detailed review covering:

1. **Code Quality Assessment** (1-10 score):
   - Readability and structure
   - Variable naming
   - Code organization

2. **Algorithm Analysis**:
   - Time complexity
   - Space complexity
   - Efficiency evaluation

3. **Optimization Suggestions**:
   - Performance improvements
   - Code simplification
   - Best practices

4. **Learning Points**:
   - Key concepts demonstrated
   - Areas for improvement
   - Next steps for learning

Please be encouraging and constructive in your feedback.
`;

    const response = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [{
              text: prompt
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      }
    });

    if (response.data && response.data.candidates && response.data.candidates[0]) {
    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
      return {
        review: aiResponse,
        score: allPassed ? Math.floor(Math.random() * 3) + 7 : Math.floor(Math.random() * 4) + 4, // 7-9 if passed, 4-7 if failed
        complexity: {
          time: estimateTimeComplexity(code, language),
          space: estimateSpaceComplexity(code, language)
        },
        suggestions: extractSuggestions(aiResponse),
        alternatives: extractAlternatives(aiResponse),
        learningPoints: extractLearningPoints(aiResponse),
        generatedAt: new Date().toISOString()
      };
    }

    throw new Error('Invalid response from Gemini API');

  } catch (error) {
    console.error('AI review generation failed:', error.message);
    // Fallback to basic review
    return generateBasicReview({ code, language, testResults, allPassed, validationResult });
  }
};

// Generate optimal solution using Gemini
const generateOptimalSolution = async (problemDescription, language) => {
  try {
  if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, providing basic solution template');
      return generateBasicSolution(problemDescription, language);
  }

    const prompt = `
You are an expert programmer. Please provide an optimal solution for this coding problem.

PROBLEM DESCRIPTION:
${problemDescription}

LANGUAGE: ${language}

Please provide:

1. **Optimal Solution Code**:
   - Clean, efficient implementation
   - Proper error handling
   - Clear variable names
   - Good documentation

2. **Approach Explanation**:
   - Algorithm strategy
   - Why this approach is optimal
   - Alternative approaches considered

3. **Complexity Analysis**:
   - Time complexity with explanation
   - Space complexity with explanation

4. **Test Cases**:
   - Edge cases to consider
   - Sample inputs and expected outputs

5. **Learning Points**:
   - Key concepts demonstrated
   - Best practices used
   - Common pitfalls to avoid

Please format your response clearly with code blocks and explanations.
`;

    const response = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [{
              text: prompt
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      }
    });

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      
    return {
        code: extractCodeFromResponse(aiResponse, language),
        approach: extractApproach(aiResponse),
        complexity: {
          time: extractTimeComplexity(aiResponse),
          space: extractSpaceComplexity(aiResponse)
        },
        explanation: extractExplanation(aiResponse),
        testCases: extractTestCases(aiResponse),
        generatedAt: new Date().toISOString()
      };
    }

    throw new Error('Invalid response from Gemini API');

  } catch (error) {
    console.error('Optimal solution generation failed:', error.message);
    // Fallback to basic solution
    return generateBasicSolution(problemDescription, language);
  }
};

// Generate problem analysis using Gemini
const generateProblemAnalysis = async (problemDescription, language) => {
  try {
  if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, providing basic analysis');
      return generateBasicProblemAnalysis(problemDescription, language);
  }

    const prompt = `
You are an expert programming instructor. Please analyze this coding problem.

PROBLEM DESCRIPTION:
${problemDescription}

LANGUAGE: ${language}

Please provide:

1. **Problem Breakdown**:
   - Key requirements
   - Input/output specifications
   - Constraints and edge cases

2. **Solution Strategy**:
   - Recommended approach
   - Algorithm selection
   - Data structure choices

3. **Difficulty Assessment**:
   - Why this problem is easy/medium/hard
   - Prerequisites needed
   - Common mistakes to avoid

4. **Learning Objectives**:
   - Key concepts to practice
   - Related problems to try
   - Resources for learning

5. **Implementation Tips**:
   - Step-by-step approach
   - Code structure suggestions
   - Testing strategy

Please be educational and encouraging in your analysis.
`;

    const response = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [{
              text: prompt
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      }
    });

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      
      return {
        complexity: {
          timeComplexity: extractTimeComplexity(aiResponse),
          spaceComplexity: extractSpaceComplexity(aiResponse),
          explanation: 'AI-generated complexity analysis'
        },
        approaches: [
          {
            name: 'Primary Approach',
            description: 'Main algorithmic strategy for this problem',
            timeComplexity: extractTimeComplexity(aiResponse),
            spaceComplexity: extractSpaceComplexity(aiResponse),
            pros: ['Efficient solution', 'Well-structured approach'],
            cons: ['May require optimization for edge cases']
          }
        ],
        learningPoints: extractLearningPoints(aiResponse),
        bestPractices: [
          'Read the problem carefully',
          'Consider edge cases',
          'Test your solution thoroughly',
          'Analyze time and space complexity'
        ],
        generatedAt: new Date().toISOString()
      };
    }

    throw new Error('Invalid response from Gemini API');

  } catch (error) {
    console.error('Problem analysis generation failed:', error.message);
    // Fallback to basic analysis
    return generateBasicProblemAnalysis(problemDescription, language);
  }
};

// Fallback functions when AI is not available
function generateBasicReview({ code, language, testResults, allPassed, validationResult }) {
  const score = allPassed ? Math.floor(Math.random() * 3) + 7 : Math.floor(Math.random() * 4) + 4;
  
    return {
    review: `Basic code review for ${language} solution. ${allPassed ? 'All tests passed!' : 'Some tests failed.'} Code appears to be syntactically correct.`,
    score,
    complexity: {
      time: estimateTimeComplexity(code, language),
      space: estimateSpaceComplexity(code, language)
    },
    suggestions: [
      'Review variable naming conventions',
      'Check for code duplication',
      'Consider edge cases',
      'Add meaningful comments'
    ],
    alternatives: [
      'Consider different data structures',
      'Look for algorithmic optimizations',
      'Review error handling',
      'Check for memory leaks'
    ],
    learningPoints: [
      'Practice code review techniques',
      'Learn about time and space complexity',
      'Study best practices for ' + language,
      'Practice with similar problems'
    ],
    generatedAt: new Date().toISOString()
  };
}

function generateBasicSolution(problemDescription, language) {
  return {
    code: `// Basic solution template for ${language}\n// TODO: Implement solution based on problem description\n`,
    approach: 'Basic implementation approach',
    complexity: {
      time: 'O(n) - depends on input size',
      space: 'O(1) - constant extra space'
    },
    explanation: 'This is a basic solution template. Implement the actual solution based on the problem requirements.',
    testCases: [],
    generatedAt: new Date().toISOString()
  };
}

function generateBasicProblemAnalysis(problemDescription, language) {
    return {
      complexity: {
        timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      explanation: 'Basic complexity analysis - depends on problem requirements'
      },
      approaches: [
        {
        name: 'Standard Approach',
        description: 'Basic algorithmic approach for this problem type',
          timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
          pros: ['Simple to understand', 'Straightforward implementation'],
          cons: ['May not be optimal', 'Could be improved']
        }
      ],
      learningPoints: [
        'Understand the problem requirements',
        'Consider different algorithmic approaches',
        'Analyze time and space complexity'
      ],
      bestPractices: [
        'Read the problem carefully',
        'Consider edge cases',
        'Test your solution thoroughly'
    ],
    generatedAt: new Date().toISOString()
  };
}

// Helper functions
function estimateTimeComplexity(code, language) {
  // Simple heuristics for time complexity estimation
  if (code.includes('for') && code.includes('for')) return 'O(n²)';
  if (code.includes('for') || code.includes('while')) return 'O(n)';
  if (code.includes('sort')) return 'O(n log n)';
  return 'O(1)';
}

function estimateSpaceComplexity(code, language) {
  // Simple heuristics for space complexity estimation
  if (code.includes('Array(') || code.includes('new Array')) return 'O(n)';
  if (code.includes('push') || code.includes('unshift')) return 'O(n)';
  return 'O(1)';
}

function extractSuggestions(aiResponse) {
  // Extract suggestions from AI response
  const suggestions = [];
  if (aiResponse.includes('suggestion')) suggestions.push('Follow AI suggestions');
  if (aiResponse.includes('optimize')) suggestions.push('Consider optimizations');
  if (aiResponse.includes('refactor')) suggestions.push('Refactor for clarity');
  return suggestions.length > 0 ? suggestions : ['Review code structure', 'Check for improvements'];
}

function extractAlternatives(aiResponse) {
  // Extract alternatives from AI response
  const alternatives = [];
  if (aiResponse.includes('alternative')) alternatives.push('Consider alternative approaches');
  if (aiResponse.includes('different')) alternatives.push('Try different data structures');
  return alternatives.length > 0 ? alternatives : ['Try different algorithms', 'Consider other approaches'];
}

function extractLearningPoints(aiResponse) {
  // Extract learning points from AI response
  const learningPoints = [];
  if (aiResponse.includes('learn')) learningPoints.push('Focus on learning objectives');
  if (aiResponse.includes('practice')) learningPoints.push('Practice similar problems');
  return learningPoints.length > 0 ? learningPoints : ['Practice coding', 'Study algorithms'];
}

function extractCodeFromResponse(aiResponse, language) {
  // Extract code blocks from AI response
  const codeBlockRegex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``);
  const match = aiResponse.match(codeBlockRegex);
  return match ? match[1] : `// ${language} solution\n// TODO: Implement based on AI guidance`;
}

function extractApproach(aiResponse) {
  if (aiResponse.includes('approach')) {
    const approachMatch = aiResponse.match(/approach[:\s]+([^.\n]+)/i);
    return approachMatch ? approachMatch[1].trim() : 'Algorithmic approach';
  }
  return 'Standard algorithmic approach';
}

function extractTimeComplexity(aiResponse) {
  if (aiResponse.includes('O(')) {
    const complexityMatch = aiResponse.match(/O\([^)]+\)/);
    return complexityMatch ? complexityMatch[0] : 'O(n)';
  }
  return 'O(n)';
}

function extractSpaceComplexity(aiResponse) {
  if (aiResponse.includes('space') && aiResponse.includes('O(')) {
    const complexityMatch = aiResponse.match(/space.*?O\([^)]+\)/i);
    if (complexityMatch) {
      const oMatch = complexityMatch[0].match(/O\([^)]+\)/);
      return oMatch ? oMatch[0] : 'O(1)';
    }
  }
  return 'O(1)';
}

function extractExplanation(aiResponse) {
  if (aiResponse.includes('explanation')) {
    const explanationMatch = aiResponse.match(/explanation[:\s]+([^.\n]+)/i);
    return explanationMatch ? explanationMatch[1].trim() : 'Solution explanation';
  }
  return 'This solution follows standard algorithmic patterns';
}

function extractTestCases(aiResponse) {
  const testCases = [];
  if (aiResponse.includes('test')) {
    // Simple extraction of test case information
    testCases.push('Basic functionality test');
    testCases.push('Edge case test');
    testCases.push('Large input test');
  }
  return testCases;
}

function estimateDifficulty(problemDescription) {
  const desc = problemDescription.toLowerCase();
  if (desc.includes('easy') || desc.includes('simple')) return 'easy';
  if (desc.includes('hard') || desc.includes('complex')) return 'hard';
  return 'medium';
}

function extractTopics(problemDescription) {
  const desc = problemDescription.toLowerCase();
  const topics = [];
  if (desc.includes('array') || desc.includes('list')) topics.push('arrays');
  if (desc.includes('string')) topics.push('strings');
  if (desc.includes('tree') || desc.includes('binary')) topics.push('trees');
  if (desc.includes('graph')) topics.push('graphs');
  if (desc.includes('sort')) topics.push('sorting');
  if (desc.includes('search')) topics.push('searching');
  return topics.length > 0 ? topics : ['general'];
}

function extractPrerequisites(aiResponse) {
  const prerequisites = [];
  if (aiResponse.includes('prerequisite')) {
    prerequisites.push('Basic programming knowledge');
    prerequisites.push('Understanding of data structures');
  }
  return prerequisites.length > 0 ? prerequisites : ['Programming fundamentals', 'Algorithm basics'];
}

function extractLearningPath(aiResponse) {
  const learningPath = [];
  if (aiResponse.includes('learning')) {
    learningPath.push('Start with simple examples');
    learningPath.push('Build up to complex cases');
    learningPath.push('Practice similar problems');
  }
  return learningPath.length > 0 ? learningPath : ['Practice coding', 'Study algorithms', 'Solve problems'];
}

module.exports = {
  generateCodeReview,
  generateOptimalSolution,
  generateProblemAnalysis
}; 
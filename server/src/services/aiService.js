const axios = require('axios');

// Google Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required for AI services');
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Generate AI code review
const generateCodeReview = async ({ code, language, problemDescription, testResults, allPassed, optimalSolution }) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('Gemini API key not configured, providing basic review');
    return {
      review: 'AI review is not available because the Gemini API key is not configured. To enable AI code reviews, please add your Gemini API key to the environment variables.',
      score: 5,
      complexity: { time: 'Unknown', space: 'Unknown' },
      suggestions: [
        'Enable AI reviews by configuring the Gemini API key',
        'Check code for basic syntax and structure',
        'Verify test case logic manually'
      ],
      alternatives: [
        'Consider using different data structures',
        'Look for algorithmic optimizations',
        'Review edge cases and error handling'
      ],
      learningPoints: [
        'Practice code review techniques',
        'Learn about time and space complexity analysis',
        'Study different algorithmic approaches'
      ],
      generatedAt: new Date().toISOString()
    };
  }

  try {
    const failedTests = testResults.filter(test => test.status !== 'passed');
    const passedTests = testResults.filter(test => test.status === 'passed');
    
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
Input: ${test.input || 'N/A'}
Expected: ${test.expectedOutput}
Actual: ${test.output || 'No output'}
Error: ${test.error || 'N/A'}
`).join('')}` : ''}

${optimalSolution && optimalSolution.code ? `
OPTIMAL SOLUTION COMPARISON:
Here is an optimal solution for this problem in ${language}:

OPTIMAL SOLUTION CODE:
\`\`\`${language}
${optimalSolution.code}
\`\`\`

OPTIMAL SOLUTION ANALYSIS:
- Approach: ${optimalSolution.approach || 'N/A'}
- Time Complexity: ${optimalSolution.complexity?.time || 'Unknown'}
- Space Complexity: ${optimalSolution.complexity?.space || 'Unknown'}
- Explanation: ${optimalSolution.explanation || 'N/A'}

Please compare the user's solution with this optimal approach and provide specific recommendations for improvement.
` : ''}

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

4. **Alternative Approaches**:
   - Different algorithms
   - Other data structures
   - Edge case handling

5. **Learning Points**:
   - Key concepts demonstrated
   - Areas for improvement
   - Next steps for learning

IMPORTANT: You must respond with valid JSON only. Do not include any other text or formatting.

Format your response exactly as this JSON structure:
{
  "review": "Overall assessment of the code quality, readability, and approach. Focus on the main strengths and areas for improvement.",
  "score": 8,
  "complexity": {
    "time": "O(n)",
    "space": "O(1)"
  },
  "suggestions": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2"
  ],
  "alternatives": [
    "Alternative approach 1",
    "Alternative approach 2"
  ],
  "learningPoints": [
    "Key learning point 1",
    "Key learning point 2"
  ]
}
`;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: 'You are an expert programming mentor who provides constructive, educational code reviews. You must respond with valid JSON only. Do not include any markdown formatting, code blocks, or additional text outside the JSON structure. Ensure the review text is clean and readable without any formatting artifacts.'
            },
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.3
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    try {
      // Clean the response to extract JSON
      let cleanResponse = aiResponse.trim();
      
      // Remove any markdown code blocks
      if (cleanResponse.includes('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResponse.includes('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }
      
      // Find JSON object
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      const review = JSON.parse(cleanResponse);
      
      // Clean the review text to remove any formatting artifacts
      let cleanReviewText = review.review || 'No review provided';
      
      // Remove common formatting artifacts
      cleanReviewText = cleanReviewText
        .replace(/```[a-z]*\n?/g, '') // Remove code blocks
        .replace(/`/g, '') // Remove backticks
        .replace(/\*\*/g, '') // Remove bold markers
        .replace(/\*/g, '') // Remove italic markers
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
        .replace(/#{1,6}\s*/g, '') // Remove headers
        .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
        .trim();
      
      // Validate and provide defaults
      return {
        review: cleanReviewText,
        score: Math.max(0, Math.min(10, review.score || 0)),
        complexity: {
          time: review.complexity?.time || 'Unknown',
          space: review.complexity?.space || 'Unknown'
        },
        suggestions: Array.isArray(review.suggestions) ? review.suggestions.map(s => s.replace(/^[-*]\s*/, '').trim()) : [],
        alternatives: Array.isArray(review.alternatives) ? review.alternatives.map(a => a.replace(/^[-*]\s*/, '').trim()) : [],
        learningPoints: Array.isArray(review.learningPoints) ? review.learningPoints.map(l => l.replace(/^[-*]\s*/, '').trim()) : [],
        generatedAt: new Date().toISOString()
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI response:', aiResponse);
      
      // Try to extract useful information from the response
      let fallbackReview = 'AI review generated but could not be parsed properly. ';
      
      if (aiResponse.includes('review') || aiResponse.includes('assessment')) {
        // Try to extract a review-like text
        const lines = aiResponse.split('\n');
        const reviewLines = lines.filter(line => 
          line.includes('review') || 
          line.includes('assessment') || 
          line.includes('quality') ||
          line.includes('good') ||
          line.includes('improve')
        );
        if (reviewLines.length > 0) {
          fallbackReview += reviewLines.slice(0, 3).join(' ');
        }
      }
      
      // Clean the fallback review
      fallbackReview = fallbackReview
        .replace(/```[a-z]*\n?/g, '')
        .replace(/`/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#{1,6}\s*/g, '')
        .trim();
      
      return {
        review: fallbackReview,
        score: 5,
        complexity: { time: 'Unknown', space: 'Unknown' },
        suggestions: ['Review the code structure and logic', 'Check for potential optimizations'],
        alternatives: ['Consider different algorithmic approaches'],
        learningPoints: ['Practice code review techniques', 'Study time and space complexity'],
        generatedAt: new Date().toISOString()
      };
    }

  } catch (error) {
    console.error('AI review generation failed:', error);
    return {
      review: 'AI review generation failed. Please try again later.',
      score: 0,
      complexity: { time: 'Unknown', space: 'Unknown' },
      suggestions: [],
      alternatives: [],
      learningPoints: [],
      error: error.message,
      generatedAt: new Date().toISOString()
    };
  }
};

// Analyze code complexity
const analyzeComplexity = async (code, language) => {
  if (!GEMINI_API_KEY) {
    return { time: 'Unknown', space: 'Unknown' };
  }

  try {
    const prompt = `
Analyze the time and space complexity of this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide only the complexity analysis in JSON format:
{
  "time": "O(n)",
  "space": "O(1)",
  "explanation": "Brief explanation of the analysis"
}
`;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: 'You are an expert in algorithm analysis. Provide accurate time and space complexity analysis.'
            },
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.1
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const analysis = JSON.parse(response.data.candidates[0].content.parts[0].text);
    return {
      time: analysis.time || 'Unknown',
      space: analysis.space || 'Unknown',
      explanation: analysis.explanation || ''
    };

  } catch (error) {
    console.error('Complexity analysis failed:', error);
    return { time: 'Unknown', space: 'Unknown' };
  }
};

// Generate hints for failed solutions
const generateHints = async (problemDescription, failedTestCases) => {
  if (!GEMINI_API_KEY) {
    return ['AI hints not available (API key not configured)'];
  }

  try {
    const prompt = `
A student is struggling with this coding problem. Please provide 2-3 helpful hints (not complete solutions) to guide them.

PROBLEM:
${problemDescription}

FAILED TEST CASES:
${failedTestCases.map((test, i) => `
Test ${i + 1}:
Input: ${test.input}
Expected: ${test.expectedOutput}
Actual: ${test.actualOutput || 'No output'}
`).join('')}

Provide hints that:
1. Point out common mistakes
2. Suggest debugging strategies
3. Guide toward the correct approach
4. Don't give away the complete solution

Format as JSON array of strings:
["Hint 1", "Hint 2", "Hint 3"]
`;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: 'You are a helpful programming tutor who provides constructive hints without giving away complete solutions.'
            },
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.3
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const hints = JSON.parse(response.data.candidates[0].content.parts[0].text);
    return Array.isArray(hints) ? hints : ['Try debugging with the failed test cases'];

  } catch (error) {
    console.error('Hint generation failed:', error);
    return ['Try debugging with the failed test cases'];
  }
};

// Generate optimal solution and test it
const generateOptimalSolution = async (problemDescription, language) => {
  console.log('🚀 Starting optimal solution generation for:', language);
  console.log('🔑 Gemini API Key configured:', !!GEMINI_API_KEY);
  
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('⚠️ Gemini API key not configured, providing basic fallback');
    return {
      code: null,
      explanation: 'AI solution generation is not available because the Gemini API key is not configured. To enable AI-generated optimal solutions, please add your Gemini API key to the environment variables.',
      complexity: { time: 'Unknown', space: 'Unknown' },
      approach: 'Manual review recommended'
    };
  }

  try {
    const prompt = `
Generate an optimal, production-ready solution for this coding problem in ${language}.

PROBLEM DESCRIPTION:
${problemDescription}

Requirements:
1. Provide the most efficient solution possible
2. Include proper time and space complexity analysis
3. Add clear, concise comments explaining the approach
4. Ensure the code follows ${language} best practices and conventions
5. Make the code readable and maintainable
6. Handle edge cases appropriately
7. Use the most suitable data structures and algorithms

IMPORTANT: The code must be syntactically correct ${language} code that can be executed.

Format your response as JSON:
{
  "code": "The complete solution code in ${language}",
  "explanation": "Brief explanation of the approach and why it's optimal",
  "complexity": {
    "time": "O(n) - detailed explanation",
    "space": "O(1) - detailed explanation"
  },
  "approach": "Detailed explanation of the algorithm and data structures used"
}
`;

    console.log('📤 Sending request to Gemini API...');
    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: `You are an expert ${language} programmer who provides optimal, efficient solutions. Always respond with valid JSON. The code must be syntactically correct ${language} code.`
            },
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 3000,
        temperature: 0.1
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📥 Received response from Gemini API');
    const responseText = response.data.candidates[0].content.parts[0].text;
    console.log('🔍 Raw response length:', responseText.length);
    
    // Clean the response to extract JSON
    let cleanResponse = responseText.trim();
    
    // Remove any markdown code blocks
    if (cleanResponse.includes('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanResponse.includes('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '');
    }
    
    // Find JSON object
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    cleanResponse = jsonMatch[0];
    console.log('🔍 Cleaned response length:', cleanResponse.length);
    
    let solution;
    try {
      solution = JSON.parse(cleanResponse);
      console.log('🔍 Parsed solution:', !!solution);
      console.log('📝 Solution code present:', !!solution.code);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      console.log('🔍 Attempting to fix malformed JSON...');
      
      // Try to fix common JSON issues
      try {
        // Remove any trailing commas
        let fixedResponse = cleanResponse.replace(/,(\s*[}\]])/g, '$1');
        
        // Try to find the end of the JSON object
        let braceCount = 0;
        let endIndex = 0;
        for (let i = 0; i < fixedResponse.length; i++) {
          if (fixedResponse[i] === '{') braceCount++;
          if (fixedResponse[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              endIndex = i + 1;
              break;
            }
          }
        }
        
        if (endIndex > 0) {
          fixedResponse = fixedResponse.substring(0, endIndex);
          console.log('🔧 Fixed JSON length:', fixedResponse.length);
          solution = JSON.parse(fixedResponse);
          console.log('✅ Successfully parsed fixed JSON');
        } else {
          throw new Error('Could not find valid JSON structure');
        }
      } catch (fixError) {
        console.error('❌ JSON fix attempt failed:', fixError.message);
        throw new Error('Failed to parse optimal solution response');
      }
    }
    
    // Clean and validate the code
    let cleanCode = solution.code || '';
    
    // Remove any markdown formatting if present
    if (cleanCode.includes('```')) {
      cleanCode = cleanCode.replace(/```[a-z]*\n?/g, '').replace(/```\n?/g, '');
    }
    
    // Ensure the code is properly formatted
    cleanCode = cleanCode.trim();
    
    return {
      code: cleanCode,
      explanation: solution.explanation || '',
      complexity: solution.complexity || { time: 'Unknown', space: 'Unknown' },
      approach: solution.approach || ''
    };

  } catch (error) {
    console.error('Optimal solution generation failed:', error);
    return {
      code: null,
      explanation: 'Failed to generate optimal solution',
      complexity: { time: 'Unknown', space: 'Unknown' }
    };
  }
};

// Generate problem analysis
const generateProblemAnalysis = async ({ problemTitle, problemDescription, difficulty, primaryTopic, subTopics, testCases }) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('Gemini API key not configured, providing basic analysis');
    return {
      complexity: {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        explanation: 'Basic complexity analysis - please configure Gemini API for detailed analysis'
      },
      approaches: [
        {
          name: 'Basic Approach',
          description: 'Standard solution approach',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
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
      ]
    };
  }

  try {
    const prompt = `
You are an expert programming mentor analyzing a coding problem. Please provide a comprehensive analysis.

PROBLEM TITLE: ${problemTitle}
DIFFICULTY: ${difficulty}
PRIMARY TOPIC: ${primaryTopic}
SUB TOPICS: ${subTopics.join(', ')}

PROBLEM DESCRIPTION:
${problemDescription}

TEST CASES:
${testCases.map((tc, i) => `
Test Case ${i + 1}:
Input: ${tc.input}
Output: ${tc.output}
${tc.description ? `Description: ${tc.description}` : ''}
`).join('')}

Please provide a comprehensive analysis in JSON format with the following structure:

{
  "complexity": {
    "timeComplexity": "O(n) - detailed explanation",
    "spaceComplexity": "O(n) - detailed explanation", 
    "explanation": "Detailed explanation of why these complexities are correct"
  },
  "approaches": [
    {
      "name": "Approach Name",
      "description": "Detailed description of this approach",
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(n)",
      "pros": ["List of advantages"],
      "cons": ["List of disadvantages"]
    }
  ],
  "learningPoints": [
    "Key concepts to learn from this problem"
  ],
  "bestPractices": [
    "Best practices for solving this type of problem"
  ]
}

IMPORTANT:
- Provide 2-3 different approaches with varying complexity
- Be specific about time and space complexity analysis
- Include practical learning points
- Focus on algorithmic thinking and problem-solving strategies
- Do NOT provide the actual solution code
`;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048
      }
    });

    const responseText = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    return {
      success: true,
      ...result
    };

  } catch (error) {
    console.error('Gemini analysis error:', error);
    
    return {
      success: false,
      complexity: {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        explanation: 'Unable to analyze complexity due to API error'
      },
      approaches: [
        {
          name: 'Basic Approach',
          description: 'Standard solution approach',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          pros: ['Simple to understand'],
          cons: ['May not be optimal']
        }
      ],
      learningPoints: [
        'Understand the problem requirements',
        'Consider different approaches'
      ],
      bestPractices: [
        'Read the problem carefully',
        'Test your solution'
      ]
    };
  }
};

module.exports = {
  generateCodeReview,
  analyzeComplexity,
  generateHints,
  generateOptimalSolution,
  generateProblemAnalysis
}; 
const axios = require('axios');

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBJfhBJCoFlH5Uq3Z3vySkMheKyA5Z9T8E';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Validate code using Gemini
const validateCode = async ({ code, language, problemStatement, testCases }) => {
  try {
    const prompt = `
You are a code validator. Analyze the following code and problem statement.

PROBLEM STATEMENT:
${problemStatement}

USER'S CODE (${language}):
${code}

TEST CASES:
${JSON.stringify(testCases, null, 2)}

Please analyze the code and provide a JSON response with the following structure:
{
  "syntaxValid": true/false,
  "logicValid": true/false,
  "syntaxErrors": ["list of syntax errors if any"],
  "logicErrors": ["list of logic errors if any"],
  "failedTestCases": [
    {
      "testCaseId": "id of the test case",
      "input": "test case input",
      "expectedOutput": "expected output",
      "actualOutput": "what the code would produce",
      "reason": "why it failed"
    }
  ],
  "overallAssessment": "brief assessment of the code quality",
  "suggestions": ["list of improvement suggestions without giving solutions"]
}

IMPORTANT: 
- Do NOT provide the correct solution in your response
- Focus on identifying what's wrong and why test cases fail
- Be specific about which test cases fail and why
- Provide constructive feedback without spoiling the learning experience
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
    console.error('Gemini validation error:', error);
    
    return {
      success: false,
      syntaxValid: false,
      logicValid: false,
      syntaxErrors: ['Unable to validate code due to API error'],
      logicErrors: ['Unable to validate logic due to API error'],
      failedTestCases: [],
      overallAssessment: 'Code validation service unavailable',
      suggestions: ['Please check your code manually']
    };
  }
};

// Generate optimal solution for comparison (used internally)
const generateOptimalSolution = async ({ problemStatement, language }) => {
  try {
    const prompt = `
Generate an optimal solution for the following problem in ${language}.

PROBLEM STATEMENT:
${problemStatement}

Provide only the code solution without any explanation or comments.
`;

    const response = await axios.post(`${GEMINI_API_KEY}?key=${GEMINI_API_KEY}`, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1024
      }
    });

    return response.data.candidates[0].content.parts[0].text.trim();

  } catch (error) {
    console.error('Error generating optimal solution:', error);
    return null;
  }
};

module.exports = {
  validateCode,
  generateOptimalSolution
}; 
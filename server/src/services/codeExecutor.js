const axios = require('axios');

// Judge0 API configuration
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || '2fb691eb70msh7410d266ed112dap139e9ejsn525c5551c79a'; // Use provided API key

// Language mappings for Judge0
const LANGUAGE_MAPPINGS = {
  javascript: {
    id: 63, // JavaScript (Node.js 12.14.0)
    name: 'JavaScript (Node.js 12.14.0)'
  },
  python: {
    id: 71, // Python (3.8.1)
    name: 'Python (3.8.1)'
  },
  java: {
    id: 62, // Java (OpenJDK 13.0.1)
    name: 'Java (OpenJDK 13.0.1)'
  },
  cpp: {
    id: 54, // C++ (GCC 9.2.0)
    name: 'C++ (GCC 9.2.0)'
  }
};

// Create submission to Judge0
const createSubmission = async (code, language, input) => {
  const languageConfig = LANGUAGE_MAPPINGS[language.toLowerCase()];
  if (!languageConfig) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const submissionData = {
    source_code: code,
    language_id: languageConfig.id,
    stdin: input,
    cpu_time_limit: 5, // 5 seconds
    memory_limit: 512000, // 512MB
    enable_network: false
  };

  try {
    const response = await axios.post(`${JUDGE0_API_URL}/submissions`, submissionData, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    });

    return response.data.token;
  } catch (error) {
    console.error('Judge0 submission creation failed:', error);
    throw new Error('Failed to submit code for execution');
  }
};

// Get submission result from Judge0
const getSubmissionResult = async (token) => {
  try {
    const response = await axios.get(`${JUDGE0_API_URL}/submissions/${token}`, {
      headers: {
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Judge0 result retrieval failed:', error);
    throw new Error('Failed to get execution result');
  }
};

// Wait for submission to complete
const waitForSubmission = async (token, maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getSubmissionResult(token);
    
    if (result.status && result.status.id > 2) {
      // Status > 2 means processing is complete
      return result;
    }
    
    // Wait 1 second before next check
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Execution timeout');
};

// Execute code using Judge0 API
const executeCode = async ({ code, language, input, expectedOutput, timeLimit = 5000, memoryLimit = 512 }) => {
  const startTime = Date.now();
  
  try {
    // Create submission
    const token = await createSubmission(code, language, input);
    
    // Wait for result
    const result = await waitForSubmission(token);
    
    const executionTime = Date.now() - startTime;
    
    // Parse Judge0 status
    const status = result.status;
    const output = result.stdout || '';
    const error = result.stderr || '';
    const compileError = result.compile_output || '';
    
    // Determine if test passed
    let passed = false;
    let finalOutput = output;
    let finalError = null;
    
    if (status.id === 3) {
      // Accepted
      passed = output.trim() === expectedOutput.trim();
      finalOutput = output;
    } else if (status.id === 4) {
      // Wrong Answer
      passed = false;
      finalOutput = output;
    } else if (status.id === 5) {
      // Time Limit Exceeded
      passed = false;
      finalError = 'Time limit exceeded';
    } else if (status.id === 6) {
      // Compilation Error
      passed = false;
      finalError = compileError || 'Compilation error';
    } else {
      // Other errors
      passed = false;
      finalError = error || status.description || 'Execution error';
    }
    
    return {
      passed,
      output: finalOutput,
      error: finalError,
      executionTime,
      memoryUsed: result.memory || 0,
      status: status.description || 'Unknown'
    };
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    return {
      passed: false,
      output: null,
      error: error.message,
      executionTime,
      memoryUsed: 0,
      status: 'Error'
    };
  }
};

// Fallback for when Judge0 is not available
const executeCodeFallback = async ({ code, language, input, expectedOutput, timeLimit = 1000, memoryLimit = 256 }) => {
  const startTime = Date.now();
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const executionTime = Date.now() - startTime;
  
  // Basic validation
  const hasBasicStructure = code.includes('function') || code.includes('def ') || code.includes('public class') || code.includes('int main');
  
  if (!hasBasicStructure) {
    return {
      passed: false,
      output: null,
      error: 'Code does not contain valid function/class structure',
      executionTime,
      memoryUsed: 0,
      status: 'Compilation Error'
    };
  }
  
  // Simulate execution
  const output = `Simulated output for ${language}`;
  const passed = output.trim() === expectedOutput.trim();
  
  return {
    passed,
    output,
    error: null,
    executionTime,
    memoryUsed: Math.floor(Math.random() * 50) + 10,
    status: passed ? 'Accepted' : 'Wrong Answer'
  };
};

// Test the code execution service
const testCodeExecution = async () => {
  console.log('Testing code execution service...');
  
  const testCases = [
    {
      language: 'javascript',
      code: `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  const [a, b] = input.split(' ').map(Number);
  console.log(a + b);
  rl.close();
});
      `,
      input: '5 3',
      expectedOutput: '8'
    },
    {
      language: 'python',
      code: `
a, b = map(int, input().split())
print(a + b)
      `,
      input: '5 3',
      expectedOutput: '8'
    }
  ];
  
  for (const testCase of testCases) {
    try {
      const result = await executeCode(testCase);
      console.log(`${testCase.language}: ${result.passed ? 'PASS' : 'FAIL'}`);
      if (!result.passed) {
        console.log(`Expected: ${testCase.expectedOutput}, Got: ${result.output}`);
        console.log(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error(`${testCase.language}: ERROR - ${error.message}`);
    }
  }
};

module.exports = {
  executeCode,
  executeCodeFallback,
  testCodeExecution
}; 
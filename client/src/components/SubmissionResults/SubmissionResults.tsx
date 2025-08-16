import React from 'react';

interface TestResult {
  testCaseId: string;
  status: 'passed' | 'failed' | 'timeout' | 'error';
  executionTime: number;
  memoryUsage: number;
  output: string;
  expectedOutput: string;
  error?: string;
}

interface ValidationResult {
  syntaxValid: boolean;
  logicValid: boolean;
  syntaxErrors: string[];
  logicErrors: string[];
  failedTestCases: Array<{
    testCaseId: string;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    reason: string;
  }>;
  overallAssessment: string;
  suggestions: string[];
}

interface AIReview {
  review: string;
  score: number;
  complexity: {
    time: string;
    space: string;
  };
  suggestions: string[];
  alternatives: string[];
  learningPoints: string[];
  generatedAt: string;
}

interface SubmissionResultsProps {
  status: string;
  testResults: TestResult[];
  executionTime: number;
  memoryUsed: number;
  aiReview?: AIReview;
  validationResult?: ValidationResult;
}

const SubmissionResults: React.FC<SubmissionResultsProps> = ({
  status,
  testResults,
  executionTime,
  memoryUsed,
  aiReview,
  validationResult
}) => {
  // Debug logging
  console.log('🔍 SubmissionResults received props:', {
    status,
    testResultsCount: testResults?.length,
    aiReview: !!aiReview
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'wrong_answer':
        return 'bg-red-100 text-red-800';
      case 'time_limit_exceeded':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'wrong_answer':
        return 'Wrong Answer';
      case 'time_limit_exceeded':
        return 'Time Limit Exceeded';
      default:
        return status;
    }
  };

  // Helper function to format AI review text
  const formatReviewText = (text: string) => {
    if (!text) return 'No review available';
    
    // If it looks like JSON, try to extract the review part
    if (text.includes('"review"') || text.includes('{')) {
      try {
        const parsed = JSON.parse(text);
        return parsed.review || text;
      } catch {
        // If JSON parsing fails, return as is
        return text;
      }
    }
    
    // Clean any remaining formatting artifacts
    let cleanText = text
      .replace(/```[a-z]*\n?/g, '') // Remove code blocks
      .replace(/`/g, '') // Remove backticks
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '') // Remove italic markers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
      .replace(/^#+\s*/gm, '') // Remove markdown headings
      .replace(/^[-*+]\s*/gm, '') // Remove list markers
      .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
      .trim();
    
    return cleanText;
  };

  return (
    <div className="space-y-6">
      {/* Submission Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Submission Status</h3>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(status)}`}>
            {getStatusText(status)}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{testResults?.length || 0}</div>
            <div className="text-sm text-gray-600">Test Cases</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {testResults?.filter(t => t.status === 'passed').length || 0}
            </div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {testResults?.filter(t => t.status === 'failed').length || 0}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults && testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div key={test.testCaseId || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Test Case {index + 1}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    test.status === 'passed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {test.status === 'passed' ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Expected Output:</span>
                    <pre className="mt-1 bg-gray-100 p-2 rounded font-mono text-xs">
                      {test.expectedOutput}
                    </pre>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Actual Output:</span>
                    <pre className="mt-1 bg-gray-100 p-2 rounded font-mono text-xs">
                      {test.output || 'No output'}
                    </pre>
                  </div>
                </div>
                
                {test.error && (
                  <div className="mt-2">
                    <span className="font-medium text-red-700">Error:</span>
                    <pre className="mt-1 bg-red-50 p-2 rounded text-xs text-red-700">
                      {test.error}
                    </pre>
                  </div>
                )}
                
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Time: {test.executionTime}ms</span>
                  <span>Memory: {test.memoryUsage}KB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Validation Results */}
      {validationResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Validation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Syntax Validation */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${
                  validationResult.syntaxValid ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                Syntax Validation
              </h4>
              {validationResult.syntaxValid ? (
                <p className="text-green-700 text-sm">✓ Syntax is valid</p>
              ) : (
                <div>
                  <p className="text-red-700 text-sm mb-2">✗ Syntax errors found:</p>
                  <ul className="text-red-600 text-sm space-y-1">
                    {validationResult.syntaxErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Logic Validation */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${
                  validationResult.logicValid ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                Logic Validation
              </h4>
              {validationResult.logicValid ? (
                <p className="text-green-700 text-sm">✓ Logic is sound</p>
              ) : (
                <div>
                  <p className="text-red-700 text-sm mb-2">✗ Logic issues found:</p>
                  <ul className="text-red-600 text-sm space-y-1">
                    {validationResult.logicErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Overall Assessment */}
          {validationResult.overallAssessment && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Overall Assessment</h4>
              <p className="text-blue-800 text-sm">{validationResult.overallAssessment}</p>
            </div>
          )}

          {/* Suggestions */}
          {validationResult.suggestions && validationResult.suggestions.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Suggestions for Improvement</h4>
              <ul className="space-y-1">
                {validationResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* AI Code Review */}
      {aiReview && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Code Review
          </h3>
          
          <div className="space-y-4">
            {/* Review Score */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{aiReview.score}/10</div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">Code Quality</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(aiReview.score / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Review</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 text-sm">{aiReview.review}</p>
              </div>
            </div>

            {/* Complexity Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-1">Time Complexity</h4>
                <p className="text-blue-800 font-mono">{aiReview.complexity.time}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-1">Space Complexity</h4>
                <p className="text-green-900 font-mono">{aiReview.complexity.space}</p>
              </div>
            </div>

            {/* Suggestions */}
            {aiReview.suggestions && aiReview.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Suggestions for Improvement</h4>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {aiReview.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-600 mr-2">💡</span>
                        <span className="text-yellow-800 text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Alternative Approaches */}
            {aiReview.alternatives && aiReview.alternatives.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Alternative Approaches</h4>
                <div className="bg-purple-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {aiReview.alternatives.map((alternative, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-600 mr-2">🔄</span>
                        <span className="text-purple-800 text-sm">{alternative}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Learning Points */}
            {aiReview.learningPoints && aiReview.learningPoints.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Learning Points</h4>
                <div className="bg-green-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {aiReview.learningPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">📚</span>
                        <span className="text-green-800 text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Generated At */}
            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              AI Review generated at {new Date(aiReview.generatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionResults; 
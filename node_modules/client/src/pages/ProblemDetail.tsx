import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config/config';
import CodeEditor from '../components/CodeEditor/CodeEditor';
import SubmissionResults from '../components/SubmissionResults/SubmissionResults';

interface Problem {
  _id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  primaryTopic: string;
  subTopics: string[];
  description: string;
  constraints: {
    timeLimit: number;
    memoryLimit: number;
    inputFormat: string;
    outputFormat: string;
  };
  testCases: Array<{
    input: string;
    output: string;
    description: string;
  }>;
  solution: {
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
    code: string;
    explanation: string;
  };
  metadata?: {
    totalSubmissions: number;
    totalSolved: number;
    successRate: number;
  };
}

interface ProblemResponse {
  success: boolean;
  message: string;
  data: {
    problem: Problem;
  };
}

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'solution' | 'submissions' | 'analysis'>('description');
  
  // Code submission state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Code templates for different languages
  const codeTemplates = {
    javascript: `// JavaScript solution
function solution(input) {
  // Parse input
  const lines = input.trim().split('\\n');
  
  // Your solution here
  // Example: const [a, b] = lines[0].split(' ').map(Number);
  
  // Return result
  return result;
}

// Read input and call solution
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let input = '';
rl.on('line', (line) => {
  input += line + '\\n';
});

rl.on('close', () => {
  console.log(solution(input));
});`,
    python: `# Python solution
def solution(input_str):
    # Parse input
    lines = input_str.strip().split('\\n')
    
    # Your solution here
    # Example: a, b = map(int, lines[0].split())
    
    # Return result
    return result

# Read input and call solution
if __name__ == "__main__":
    import sys
    input_data = sys.stdin.read()
    print(solution(input_data))`,
    java: `// Java solution
import java.util.*;
import java.io.*;

public class Solution {
    public static String solution(String input) {
        // Parse input
        String[] lines = input.trim().split("\\n");
        
        // Your solution here
        // Example: String[] parts = lines[0].split(" ");
        // int a = Integer.parseInt(parts[0]);
        // int b = Integer.parseInt(parts[1]);
        
        // Return result
        return result;
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        StringBuilder input = new StringBuilder();
        
        while (scanner.hasNextLine()) {
            input.append(scanner.nextLine()).append("\\n");
        }
        
        System.out.println(solution(input.toString()));
    }
}`,
    cpp: `// C++ solution
#include <iostream>
#include <string>
#include <sstream>
#include <vector>

using namespace std;

string solution(const string& input) {
    // Parse input
    stringstream ss(input);
    string line;
    vector<string> lines;
    
    while (getline(ss, line)) {
        lines.push_back(line);
    }
    
    // Your solution here
    // Example: stringstream line_ss(lines[0]);
    // int a, b;
    // line_ss >> a >> b;
    
    // Return result
    return result;
}

int main() {
    string input;
    string line;
    
    while (getline(cin, line)) {
        input += line + "\\n";
    }
    
    cout << solution(input) << endl;
    return 0;
}`
  };

  useEffect(() => {
    if (id) {
      fetchProblem();
    }
  }, [id]);

  const fetchProblem = async () => {
    if (!id) {
      setError('Problem ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get<ProblemResponse>(`${config.API_BASE_URL}/api/problems/${id}`);
      
      if (response.data.success) {
        setProblem(response.data.data.problem);
      } else {
        setError('Failed to fetch problem');
      }
    } catch (err) {
      console.error('Error fetching problem:', err);
      setError('Failed to load problem. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    if (!difficulty) return '';
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const handleSubmitSolution = async () => {
    if (!id) {
      alert('Problem ID is required');
      return;
    }

    if (!code.trim()) {
      alert('Please write some code before submitting');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(`${config.API_BASE_URL}/api/submissions`, {
        problemId: id,
        code,
        language
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSubmissionResult(response.data.data.submission);
        setActiveTab('submissions');
      } else {
        alert('Submission failed: ' + response.data.message);
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      alert('Submission failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Set default code template for the new language
    setCode(codeTemplates[newLanguage as keyof typeof codeTemplates] || '');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading problem...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">⚠️ {error || 'Problem not found'}</div>
            <button 
              onClick={() => navigate('/problems')}
              className="btn-primary"
            >
              Back to Problems
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button 
                onClick={() => navigate('/problems')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Problems
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{problem.title}</h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                {getDifficultyText(problem.difficulty)}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {problem.primaryTopic}
              </span>
              {(problem.subTopics || []).map((topic) => (
                <span key={topic} className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {topic}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div>
                <span className="font-medium">{problem.metadata?.totalSolved || 0}</span> solved
              </div>
              <div>
                <span className="font-medium">{(problem.metadata?.successRate || 0).toFixed(1)}%</span> success rate
              </div>
              <div>
                <span className="font-medium">{problem.constraints.timeLimit}ms</span> time limit
              </div>
              <div>
                <span className="font-medium">{problem.constraints.memoryLimit}MB</span> memory limit
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('description')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'description'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Problem
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'solution'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Solution
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'submissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Submit Solution
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analysis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analysis
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'description' && (
            <div className="space-y-6">
              {/* Problem Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Problem Description</h3>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg font-sans">
                    {problem.description}
                  </pre>
                </div>
              </div>

              {/* Constraints */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Constraints</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Time Limit:</span>
                      <span className="ml-2 text-gray-600">{problem.constraints.timeLimit}ms</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Memory Limit:</span>
                      <span className="ml-2 text-gray-600">{problem.constraints.memoryLimit}MB</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Input Format:</span>
                      <div className="mt-1 text-gray-600">{problem.constraints.inputFormat}</div>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Output Format:</span>
                      <div className="mt-1 text-gray-600">{problem.constraints.outputFormat}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Cases */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Example Test Cases</h3>
                <div className="space-y-4">
                  {problem.testCases.map((testCase, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">Example {index + 1}</span>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium text-gray-700">Input:</span>
                            <pre className="mt-1 text-sm bg-gray-100 p-2 rounded font-mono">
                              {testCase.input}
                            </pre>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Output:</span>
                            <pre className="mt-1 text-sm bg-gray-100 p-2 rounded font-mono">
                              {testCase.output}
                            </pre>
                          </div>
                        </div>
                        {testCase.description && (
                          <div className="mt-3">
                            <span className="font-medium text-gray-700">Explanation:</span>
                            <p className="mt-1 text-gray-600">{testCase.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'solution' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Solution Approach</h3>
                <p className="text-gray-700">{problem.solution.approach}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="font-medium text-gray-700">Time Complexity:</span>
                  <span className="ml-2 text-gray-600">{problem.solution.timeComplexity}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="font-medium text-gray-700">Space Complexity:</span>
                  <span className="ml-2 text-gray-600">{problem.solution.spaceComplexity}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Solution Code</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <code>{problem.solution.code}</code>
                </pre>
              </div>

              {problem.solution.explanation && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Explanation</h3>
                  <p className="text-gray-700">{problem.solution.explanation}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="space-y-6">
              {!submissionResult ? (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Your Solution</h3>
                    <p className="text-gray-600">Write your code and submit it for testing and AI review.</p>
                  </div>
                  
                  <CodeEditor
                    code={code}
                    language={language}
                    onCodeChange={setCode}
                    onLanguageChange={handleLanguageChange}
                  />
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitSolution}
                      disabled={submitting || !code.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Solution'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Submission Results</h3>
                    <button
                      onClick={() => {
                        setSubmissionResult(null);
                        setCode('');
                      }}
                      className="btn-secondary"
                    >
                      Submit Another Solution
                    </button>
                  </div>
                  
                  <SubmissionResults
                    status={submissionResult.status}
                    testResults={submissionResult.testResults}
                    executionTime={submissionResult.executionTime}
                    memoryUsed={submissionResult.memoryUsed}
                    aiReview={submissionResult.aiReview}
                    validationResult={submissionResult.validationResult}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="text-blue-600 text-xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Problem Analysis</h3>
                <p className="text-gray-600 mb-4">Get AI-powered analysis of complexity and alternative approaches</p>
                <button
                  onClick={() => navigate(`/problems/${id}/analysis`)}
                  className="btn-primary"
                >
                  View Full Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail; 
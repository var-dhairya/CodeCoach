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
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [optimalSolution, setOptimalSolution] = useState<any>(null);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);

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
        console.log('✅ Submission successful:', response.data.data.submission);
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

  const generateAIAnalysis = async () => {
    if (!id) return;
    
    try {
      setGeneratingAnalysis(true);
      
      // Call the AI analysis endpoint
      const response = await axios.post(`${config.API_BASE_URL}/api/problems/${id}/analysis`, {
        language: language
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setAiAnalysis(response.data.data.analysis);
        setOptimalSolution(response.data.data.optimalSolution);
        setActiveTab('analysis');
      } else {
        alert('Failed to generate AI analysis: ' + response.data.message);
      }
    } catch (error: any) {
      console.error('AI analysis generation error:', error);
      alert('Failed to generate AI analysis: ' + (error.response?.data?.message || error.message));
    } finally {
      setGeneratingAnalysis(false);
    }
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

              {/* AI-Generated Optimal Solution */}
              {optimalSolution && optimalSolution.code && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">AI-Generated Optimal Solution</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {language.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Approach Explanation */}
                    {optimalSolution.approach && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Approach</h4>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-blue-800 text-sm">{optimalSolution.approach}</p>
                        </div>
                      </div>
                    )}

                    {/* Complexity Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-1">Time Complexity</h4>
                        <p className="text-blue-800 font-mono">{optimalSolution.complexity?.time || 'Unknown'}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-1">Space Complexity</h4>
                        <p className="text-green-800 font-mono">{optimalSolution.complexity?.space || 'Unknown'}</p>
                      </div>
                    </div>

                    {/* Optimal Code */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Optimal Code</h4>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-green-400 text-sm whitespace-pre-wrap">
                          <code>{optimalSolution.code}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Explanation */}
                    {optimalSolution.explanation && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Why This Solution is Optimal</h4>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-green-800 text-sm">{optimalSolution.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prompt to generate AI analysis if not available */}
              {!optimalSolution && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <div className="text-blue-600 text-xl mb-3">🤖</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Want an AI-Generated Optimal Solution?</h4>
                    <p className="text-gray-600 mb-4">Click on the Analysis tab to generate an AI-powered analysis and optimal solution for this problem.</p>
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className="btn-primary"
                    >
                      Go to Analysis Tab
                    </button>
                  </div>
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
              {!aiAnalysis ? (
                <div className="text-center py-8">
                  <div className="text-blue-600 text-xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Problem Analysis</h3>
                  <p className="text-gray-600 mb-4">Get AI-powered analysis of complexity, alternative approaches, and optimal solution</p>
                  <button
                    onClick={generateAIAnalysis}
                    disabled={generatingAnalysis}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingAnalysis ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Analysis...
                      </>
                    ) : (
                      'Generate AI Analysis'
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">AI Problem Analysis</h3>
                    <button
                      onClick={() => {
                        setAiAnalysis(null);
                        setOptimalSolution(null);
                      }}
                      className="btn-secondary"
                    >
                      Generate New Analysis
                    </button>
                  </div>
                  
                  {/* AI Analysis Content */}
                  {aiAnalysis && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Problem Analysis</h4>
                      <div className="space-y-4">
                        {/* Complexity Analysis */}
                        {aiAnalysis.complexity && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Complexity Analysis</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-blue-50 rounded-lg p-4">
                                <span className="font-medium text-blue-900">Time Complexity:</span>
                                <p className="text-blue-800 font-mono mt-1">{aiAnalysis.complexity.timeComplexity}</p>
                              </div>
                              <div className="bg-green-50 rounded-lg p-4">
                                <span className="font-medium text-green-900">Space Complexity:</span>
                                <p className="text-green-800 font-mono mt-1">{aiAnalysis.complexity.spaceComplexity}</p>
                              </div>
                            </div>
                            {aiAnalysis.complexity.explanation && (
                              <div className="mt-3 bg-gray-50 rounded-lg p-4">
                                <span className="font-medium text-gray-900">Explanation:</span>
                                <p className="text-gray-700 mt-1">{aiAnalysis.complexity.explanation}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Alternative Approaches */}
                        {aiAnalysis.approaches && aiAnalysis.approaches.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Alternative Approaches</h5>
                            <div className="space-y-3">
                              {aiAnalysis.approaches.map((approach: any, index: number) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                  <h6 className="font-medium text-gray-900 mb-2">{approach.name}</h6>
                                  <p className="text-gray-700 mb-3">{approach.description}</p>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium text-gray-700">Time:</span>
                                      <span className="ml-2 font-mono">{approach.timeComplexity}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-700">Space:</span>
                                      <span className="ml-2 font-mono">{approach.spaceComplexity}</span>
                                    </div>
                                  </div>
                                  <div className="mt-3 grid grid-cols-2 gap-4">
                                    <div>
                                      <span className="font-medium text-green-700">Pros:</span>
                                      <ul className="text-sm text-green-600 mt-1">
                                        {approach.pros.map((pro: string, i: number) => (
                                          <li key={i}>• {pro}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <span className="font-medium text-red-700">Cons:</span>
                                      <ul className="text-sm text-red-600 mt-1">
                                        {approach.cons.map((con: string, i: number) => (
                                          <li key={i}>• {con}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Learning Points */}
                        {aiAnalysis.learningPoints && aiAnalysis.learningPoints.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Learning Points</h5>
                            <div className="bg-yellow-50 rounded-lg p-4">
                              <ul className="space-y-2">
                                {aiAnalysis.learningPoints.map((point: string, index: number) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-yellow-600 mr-2">•</span>
                                    <span className="text-yellow-800">{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Best Practices */}
                        {aiAnalysis.bestPractices && aiAnalysis.bestPractices.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Best Practices</h5>
                            <div className="bg-green-50 rounded-lg p-4">
                              <ul className="space-y-2">
                                {aiAnalysis.bestPractices.map((practice: string, index: number) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-green-600 mr-2">•</span>
                                    <span className="text-green-800">{practice}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Optimal Solution Notice */}
                  {optimalSolution && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-green-800 font-medium">
                          Optimal solution generated! Check the Solution tab to view it.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail; 
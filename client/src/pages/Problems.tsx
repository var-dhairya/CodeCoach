import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface Problem {
  _id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  primaryTopic: string;
  subTopics: string[];
  description: string;
  metadata?: {
    totalSubmissions: number;
    totalSolved: number;
    successRate: number;
  };
}

interface ProblemsResponse {
  success: boolean;
  message: string;
  data: {
    problems: Problem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProblems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

const Problems: React.FC = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ProblemsResponse>(API_ENDPOINTS.PROBLEMS);
      
      if (response.data.success) {
        setProblems(response.data.data.problems);
      } else {
        setError('Failed to fetch problems');
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load problems. Please try again.');
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

  const filteredProblems = problems.filter(problem => {
    if (selectedDifficulty !== 'all' && problem.difficulty !== selectedDifficulty) {
      return false;
    }
    if (selectedTopic !== 'all' && !problem.subTopics.includes(selectedTopic)) {
      return false;
    }
    return true;
  });

  const uniqueTopics = Array.from(new Set(problems.flatMap(p => p.subTopics || []).filter(topic => topic)));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading problems...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">⚠️ {error}</div>
            <button 
              onClick={fetchProblems}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coding Problems</h1>
            <p className="text-gray-600 mt-2">
              {filteredProblems.length} of {problems.length} problems
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">All Topics</option>
              {uniqueTopics.filter(topic => topic).map(topic => (
                <option key={topic} value={topic}>
                  {topic.charAt(0).toUpperCase() + topic.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredProblems.length === 0 ? (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">No problems found matching your criteria</div>
            <button 
              onClick={() => {
                setSelectedDifficulty('all');
                setSelectedTopic('all');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
                 <div className="grid gap-4">
           {filteredProblems.map((problem) => (
             <div 
               key={problem._id} 
               className="card hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group"
               onClick={() => navigate(`/problems/${problem._id}`)}
             >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                                         <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                       {problem.title}
                     </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                      {getDifficultyText(problem.difficulty)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {problem.description.substring(0, 150)}...
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {problem.primaryTopic}
                    </span>
                                         {(problem.subTopics || []).slice(0, 2).map((topic) => (
                       <span key={topic} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                         {topic}
                       </span>
                     ))}
                     {(problem.subTopics || []).length > 2 && (
                       <span className="text-xs text-gray-500">+{(problem.subTopics || []).length - 2} more</span>
                     )}
                  </div>
                </div>
                
                                                    <div className="flex flex-col items-end gap-2 text-sm text-gray-500">
                     <div className="text-right">
                       <div className="font-medium">{problem.metadata?.totalSolved || 0}</div>
                       <div className="text-xs">solved</div>
                     </div>
                     <div className="text-right">
                       <div className="font-medium">{(problem.metadata?.successRate || 0).toFixed(1)}%</div>
                       <div className="text-xs">success rate</div>
                     </div>
                     <div className="mt-2">
                       <span className="text-blue-600 text-xs font-medium">Click to view →</span>
                     </div>
                   </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Problems; 
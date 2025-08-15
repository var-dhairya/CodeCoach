import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config/config';
import {
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  FireIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  CodeBracketIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

interface AnalyticsData {
  totalProblems: number;
  solvedProblems: number;
  accuracy: number;
  streak: number;
  favoriteLanguage: string;
  avgTimePerProblem: number;
  totalTimeSpent: number;
  recentActivity: Array<{
    date: string;
    problemsSolved: number;
    timeSpent: number;
  }>;
  topicStats: Array<{
    topic: string;
    solved: number;
    total: number;
    accuracy: number;
  }>;
  difficultyStats: {
    easy: { solved: number; total: number };
    medium: { solved: number; total: number };
    hard: { solved: number; total: number };
  };
  submissionStats: {
    accepted: number;
    wrong: number;
    timeLimit: number;
    memoryLimit: number;
    runtime: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    unlockedAt: string;
    icon: string;
  }>;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to view analytics');
      }

      console.log('Fetching analytics with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${config.API_BASE_URL}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Analytics response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Analytics data received:', data);
        setAnalytics(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Analytics error response:', errorData);
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Unavailable</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {error?.includes('log in') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                💡 Try using the demo credentials from the login page:
              </p>
              <div className="text-xs text-blue-700 mt-2">
                <strong>Email:</strong> demo@codecoach.com<br/>
                <strong>Password:</strong> demo123
              </div>
            </div>
          )}
          <div className="space-x-3">
            <button 
              onClick={fetchAnalytics}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <ChartBarIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <p className="text-gray-600">Track your coding progress and performance metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Problems Solved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.solvedProblems}/{analytics.totalProblems}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium text-gray-900">
                  {Math.round((analytics.solvedProblems / analytics.totalProblems) * 100)}%
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressColor((analytics.solvedProblems / analytics.totalProblems) * 100)}`}
                  style={{ width: `${(analytics.solvedProblems / analytics.totalProblems) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrophyIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.accuracy}%</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                <span>Based on accepted submissions</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FireIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.streak} days</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                <span>Keep it up!</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-gray-900">{formatTime(analytics.totalTimeSpent)}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span>Avg: {formatTime(analytics.avgTimePerProblem)} per problem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Submission Status Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <ChartBarIcon className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Submission Breakdown</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Accepted', value: analytics.submissionStats?.accepted || 0, color: '#10B981' },
                      { name: 'Wrong Answer', value: analytics.submissionStats?.wrong || 0, color: '#EF4444' },
                      { name: 'Time Limit', value: analytics.submissionStats?.timeLimit || 0, color: '#F59E0B' },
                      { name: 'Memory Limit', value: analytics.submissionStats?.memoryLimit || 0, color: '#8B5CF6' },
                      { name: 'Runtime Error', value: analytics.submissionStats?.runtime || 0, color: '#6B7280' }
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Accepted', value: analytics.submissionStats?.accepted || 0, color: '#10B981' },
                      { name: 'Wrong Answer', value: analytics.submissionStats?.wrong || 0, color: '#EF4444' },
                      { name: 'Time Limit', value: analytics.submissionStats?.timeLimit || 0, color: '#F59E0B' },
                      { name: 'Memory Limit', value: analytics.submissionStats?.memoryLimit || 0, color: '#8B5CF6' },
                      { name: 'Runtime Error', value: analytics.submissionStats?.runtime || 0, color: '#6B7280' }
                    ].filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Difficulty Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <AcademicCapIcon className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Difficulty Distribution</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Easy', value: analytics.difficultyStats?.easy?.solved || 0, color: '#10B981' },
                      { name: 'Medium', value: analytics.difficultyStats?.medium?.solved || 0, color: '#F59E0B' },
                      { name: 'Hard', value: analytics.difficultyStats?.hard?.solved || 0, color: '#EF4444' }
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Easy', value: analytics.difficultyStats?.easy?.solved || 0, color: '#10B981' },
                      { name: 'Medium', value: analytics.difficultyStats?.medium?.solved || 0, color: '#F59E0B' },
                      { name: 'Hard', value: analytics.difficultyStats?.hard?.solved || 0, color: '#EF4444' }
                    ].filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Topic Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <LightBulbIcon className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Topic Progress</h2>
            </div>
            <div className="space-y-4">
              {analytics.topicStats?.map((topic, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{topic.topic}</span>
                    <span className="text-sm text-gray-500">
                      {topic.solved}/{topic.total} ({topic.accuracy}%)
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor((topic.solved / topic.total) * 100)}`}
                      style={{ width: `${(topic.solved / topic.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <AcademicCapIcon className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Difficulty Breakdown</h2>
            </div>
            <div className="space-y-6">
              {Object.entries(analytics.difficultyStats || {}).map(([difficulty, stats]) => (
                <div key={difficulty} className="flex items-center">
                  <div className="w-16">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                        difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {difficulty}
                    </span>
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        {stats.solved}/{stats.total}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round((stats.solved / stats.total) * 100)}%
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full 
                          ${difficulty === 'easy' ? 'bg-green-500' : 
                            difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${(stats.solved / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submission Stats & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <CodeBracketIcon className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Submission Statistics</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{analytics.submissionStats?.accepted || 0}</p>
                <p className="text-sm text-green-600">Accepted</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{analytics.submissionStats?.wrong || 0}</p>
                <p className="text-sm text-red-600">Wrong Answer</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <ClockIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-700">{analytics.submissionStats?.timeLimit || 0}</p>
                <p className="text-sm text-yellow-600">Time Limit</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="h-8 w-8 bg-purple-500 rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">{analytics.submissionStats?.memoryLimit || 0}</p>
                <p className="text-sm text-purple-600">Memory Limit</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <CalendarDaysIcon className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              {analytics.recentActivity?.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.date}</p>
                    <p className="text-sm text-gray-600">{activity.problemsSolved} problems solved</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatTime(activity.timeSpent)}</p>
                    <p className="text-xs text-gray-500">time spent</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <StarIcon className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Recent Achievements</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.achievements?.map((achievement) => (
              <div key={achievement.id} className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                <div className="text-2xl mr-3">{achievement.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Unlocked {achievement.unlockedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 
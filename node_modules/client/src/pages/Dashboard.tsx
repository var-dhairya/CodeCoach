import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CodeBracketIcon,
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  FireIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Problems Solved',
      value: user?.stats?.solvedProblems || 0,
      icon: TrophyIcon,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      name: 'Total Submissions',
      value: user?.stats?.totalSubmissions || 0,
      icon: CodeBracketIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      name: 'Current Streak',
      value: user?.stats?.currentStreak || 0,
      icon: FireIcon,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
    },
    {
      name: 'Average Score',
      value: `${user?.stats?.averageScore || 0}%`,
      icon: ChartBarIcon,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
  ];

  const quickActions = [
    {
      name: 'Practice Problems',
      description: 'Start solving coding problems',
      href: '/problems',
      icon: CodeBracketIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      name: 'View Analytics',
      description: 'Check your progress and insights',
      href: '/analytics',
      icon: ChartBarIcon,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      name: 'Update Profile',
      description: 'Manage your preferences',
      href: '/profile',
      icon: AcademicCapIcon,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600">
              Ready to continue your coding journey?
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              Last active: {user?.profile?.lastActive ? new Date(user.profile.lastActive).toLocaleDateString() : 'Recently'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-2 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="card hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-2 rounded-md ${action.bgColor}`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">{action.name}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <CodeBracketIcon className="h-4 w-4 text-primary-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                Welcome to CodeCoach!
              </p>
              <p className="text-sm text-gray-500">
                Start your coding journey by solving your first problem.
              </p>
            </div>
            <div className="flex-shrink-0 text-sm text-gray-500">
              Just now
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
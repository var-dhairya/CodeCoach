import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CodeBracketIcon,
  ChartBarIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      name: 'AI-Powered Code Review',
      description: 'Get instant feedback and suggestions for your code with advanced AI analysis.',
      icon: LightBulbIcon,
    },
    {
      name: 'Personalized Learning',
      description: 'Track your progress and get recommendations based on your strengths and weaknesses.',
      icon: ChartBarIcon,
    },
    {
      name: 'Real-time Execution',
      description: 'Run your code safely in isolated environments with instant results.',
      icon: CodeBracketIcon,
    },
    {
      name: 'Progress Analytics',
      description: 'Visualize your coding journey with detailed analytics and insights.',
      icon: AcademicCapIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">CodeCoach</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="btn-primary"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      window.location.reload();
                    }}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="text-gradient">Master Coding</span>
              <br />
              <span className="text-primary-600">with AI Guidance</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Practice coding problems, get AI-powered reviews, and track your progress with personalized recommendations.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              {user ? (
                <Link
                  to="/problems"
                  className="btn-primary text-lg px-8 py-3"
                >
                  Start Practicing
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-lg px-8 py-3"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary text-lg px-8 py-3"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to excel at coding
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              From beginners to advanced developers, CodeCoach helps you improve your skills systematically.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="card text-center">
                <div className="flex justify-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to start your coding journey?
            </h2>
            <p className="mt-4 text-lg text-primary-100">
              Join thousands of developers improving their skills with CodeCoach.
            </p>
            <div className="mt-8">
              {user ? (
                <Link
                  to="/problems"
                  className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium text-lg"
                >
                  Start Practicing Now
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium text-lg"
                >
                  Create Free Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white">CodeCoach</h3>
            <p className="mt-4 text-gray-400">
              Empowering developers to master coding through AI-powered practice and personalized learning.
            </p>
            <div className="mt-8 flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 
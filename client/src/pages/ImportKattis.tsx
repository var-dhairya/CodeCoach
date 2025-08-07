import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlusIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  LinkIcon,
  DocumentTextIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface ImportResult {
  success: boolean;
  message: string;
  problem?: any;
  existing?: boolean;
}

const ImportKattis: React.FC = () => {
  const { user, token } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a Kattis URL');
      return;
    }

    if (!url.includes('kattis.com/problems/')) {
      setError('Please enter a valid Kattis problem URL (e.g., https://open.kattis.com/problems/hello)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      // Try the protected endpoint first
      let response;
      try {
        response = await axios.post('http://localhost:5000/api/import/kattis', 
          { url: url.trim() },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (authError: any) {
        console.log('Protected endpoint failed, trying test endpoint...');
        console.log('Auth error:', authError.response?.data);
        
        // If auth fails, try the test endpoint
        response = await axios.post('http://localhost:5000/api/import/kattis/test', 
          { url: url.trim() },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Add a note that we used the test endpoint
        if (response.data.success) {
          response.data.message += ' (imported via test endpoint - please check your login)';
        }
      }

      setResult(response.data);
      if (response.data.success) {
        setUrl(''); // Clear the form on success
      }
    } catch (err: any) {
      console.error('Import error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.data) {
        setResult(err.response.data);
      } else {
        setError(`Failed to import problem: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    
    if (result.success) {
      return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
    } else if (result.existing) {
      return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />;
    } else {
      return <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />;
    }
  };

  const getResultColor = () => {
    if (!result) return '';
    
    if (result.success) {
      return 'border-green-200 bg-green-50';
    } else if (result.existing) {
      return 'border-yellow-200 bg-yellow-50';
    } else {
      return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <LinkIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Import from Kattis</h1>
              <p className="mt-2 text-gray-600">
                Import coding problems directly from Kattis by providing the problem URL
              </p>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <UserIcon className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Authentication Status</h3>
          </div>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>User:</strong> {user ? `${user.username} (${user.email})` : 'Not logged in'}</p>
            <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'No token'}</p>
            <p><strong>Status:</strong> {user && token ? '✅ Authenticated' : '❌ Not authenticated'}</p>
          </div>
          {!user && (
            <p className="text-sm text-yellow-600 mt-2">
              ⚠️ You may need to login first. If auth fails, the system will try a test endpoint.
            </p>
          )}
        </div>

        {/* Import Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Kattis Problem URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://open.kattis.com/problems/hello"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                  disabled={loading}
                />
                <LinkIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Example: https://open.kattis.com/problems/hello
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5" />
                  <span>Import Problem</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className={`border rounded-lg p-6 ${getResultColor()}`}>
            <div className="flex items-start space-x-4">
              {getResultIcon()}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {result.success ? 'Import Successful!' : result.existing ? 'Problem Already Exists' : 'Import Failed'}
                </h3>
                <p className="text-gray-700 mb-4">{result.message}</p>
                
                {result.problem && (
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-start space-x-3">
                      <DocumentTextIcon className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">{result.problem.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Slug: {result.problem.slug}
                        </p>
                        <p className="text-sm text-gray-600">
                          Source: {result.problem.source} • ID: {result.problem.externalId}
                        </p>
                        {result.problem.description && (
                          <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                            {result.problem.description.substring(0, 200)}
                            {result.problem.description.length > 200 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">How to Import</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Go to <a href="https://open.kattis.com/problems" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Kattis Problems</a></li>
            <li>Find a problem you want to import</li>
            <li>Copy the problem URL (e.g., https://open.kattis.com/problems/hello)</li>
            <li>Paste the URL above and click "Import Problem"</li>
            <li>The problem will be automatically scraped and added to your problem set</li>
          </ol>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center space-x-3 mb-3">
              <DocumentTextIcon className="h-6 w-6 text-green-500" />
              <h3 className="font-medium text-gray-900">Complete Import</h3>
            </div>
            <p className="text-sm text-gray-600">
              Automatically extracts title, description, input/output formats, and sample test cases
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircleIcon className="h-6 w-6 text-blue-500" />
              <h3 className="font-medium text-gray-900">Duplicate Detection</h3>
            </div>
            <p className="text-sm text-gray-600">
              Prevents importing the same problem twice by checking titles and external IDs
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center space-x-3 mb-3">
              <LinkIcon className="h-6 w-6 text-purple-500" />
              <h3 className="font-medium text-gray-900">Source Tracking</h3>
            </div>
            <p className="text-sm text-gray-600">
              Maintains links to original problems and tracks import metadata
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportKattis;
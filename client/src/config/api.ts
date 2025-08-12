// API Configuration
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://your-vercel-backend-url.vercel.app';
  }
  
  // For development, detect if we're accessing via network IP
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // We're accessing via network IP, use the same hostname for API
    return `http://${hostname}:5000`;
  }
  
  // Local development
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  
  // Problems endpoints
  PROBLEMS: `${API_BASE_URL}/api/problems`,
  PROBLEM_DETAIL: (id: string) => `${API_BASE_URL}/api/problems/${id}`,
  PROBLEM_ANALYSIS: (id: string) => `${API_BASE_URL}/api/problems/${id}/analysis`,
  
  // Submissions endpoints
  SUBMISSIONS: `${API_BASE_URL}/api/submissions`,
  
  // Analytics endpoints
  ANALYTICS_DASHBOARD: `${API_BASE_URL}/api/analytics/dashboard`,
  
  // Import endpoints
  IMPORT_KATTIS: `${API_BASE_URL}/api/import/kattis`,
  IMPORT_KATTIS_TEST: `${API_BASE_URL}/api/import/kattis/test`,
};

export default API_BASE_URL;
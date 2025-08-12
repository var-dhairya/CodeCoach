// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://code-coach-backend.vercel.app'
  : process.env.REACT_APP_API_URL || 'http://192.168.56.1:5000';

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
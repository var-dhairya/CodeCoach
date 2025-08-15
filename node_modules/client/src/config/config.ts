export const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  ENV: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development',
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      PROFILE: '/api/auth/profile',
      UPDATE_PROFILE: '/api/auth/profile'
    },
    PROBLEMS: {
      LIST: '/api/problems',
      DETAIL: (id: string) => `/api/problems/${id}`,
      ANALYSIS: (problemId: string) => `/api/problems/${problemId}/analysis`
    },
    SUBMISSIONS: {
      CREATE: '/api/submissions'
    },
    ANALYTICS: {
      DASHBOARD: '/api/analytics/dashboard'
    },
    IMPORT: {
      KATTIS: '/api/import/kattis',
      KATTIS_TEST: '/api/import/kattis/test'
    }
  }
};

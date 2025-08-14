import axios from 'axios';

// Configurable base URL - can be overridden via environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for logging (development only)
apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API] Response error:', error.response?.data || error.message);
    }
    
    // Handle common HTTP errors
    if (error.response?.status === 404) {
      throw new Error('Resource not found');
    } else if (error.response?.status === 500) {
      throw new Error('Internal server error');
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to server');
    }
    
    throw error;
  }
);

export default apiClient;
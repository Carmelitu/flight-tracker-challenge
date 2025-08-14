import axios from 'axios';

// Configurable base URL - can be overridden via environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Global flag to track logout state and prevent unnecessary refresh attempts
let isLoggingOut = false;

// Export function to set logout state
export const setLoggingOut = (state: boolean) => {
  isLoggingOut = state;
};

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Always send cookies for authentication
});

// Request interceptor for logging and ensuring withCredentials
apiClient.interceptors.request.use(
  (config) => {
    // Ensure withCredentials is always true for all requests
    config.withCredentials = true;
    
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

// Response interceptor for error handling and automatic token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (import.meta.env.DEV) {
      console.error('[API] Response error:', error.response?.data || error.message);
    }
    
    // If we get a 401 and haven't already tried to refresh this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh on logout or refresh requests to avoid loops
      if (originalRequest.url?.includes('/auth/logout') || originalRequest.url?.includes('/auth/refresh')) {
        console.log('[API] Auth endpoint failed, not retrying');
        return Promise.reject(error);
      }

      // Don't try to refresh if we're in the middle of a logout process
      if (isLoggingOut) {
        console.log('[API] Logout in progress, not attempting refresh');
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshResponse = await apiClient.post('/auth/refresh');
        
        if (refreshResponse.status === 200) {
          // Refresh successful, retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, call logout and redirect
        console.error('[API] Token refresh failed:', refreshError);
        
        // Set logout flag to prevent further refresh attempts
        isLoggingOut = true;
        
        try {
          // Call logout endpoint before redirecting
          await apiClient.post('/auth/logout');
        } catch (logoutError) {
          console.error('[API] Logout failed:', logoutError);
        }
        
        // Dispatch logout event for AuthContext
        if (window.location.pathname !== '/login') {
          window.dispatchEvent(new CustomEvent('auth:logout', { 
            detail: { sessionExpired: true } 
          }));
        }
        
        return Promise.reject(new Error('Session expired'));
      }
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
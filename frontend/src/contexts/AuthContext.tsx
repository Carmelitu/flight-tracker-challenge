import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient, { setLoggingOut } from '@/lib/api';
import { User, LoginRequest, AuthResponse, AuthContextType } from '@/types/auth';
import { useToast } from './ToastContext';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.get<{ user: User }>('/auth/me');
        if (response.data?.user) {
          setUser(response.data.user);
          
          // If user is authenticated but on login page, redirect to home
          if (location.pathname === '/login') {
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
        
        // If not on login page and auth failed, redirect to login
        if (location.pathname !== '/login') {
          navigate('/login', { 
            state: { from: location },
            replace: true 
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location, navigate]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['auth', 'me'], { user: data.user });
      
      // Reset logout flag since we're now logged in
      setLoggingOut(false);
      
      // Show welcome toast
      showSuccess("Welcome back!");
      
      // Redirect to the page they were trying to access, or home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    },
    onError: (error: unknown) => {
      console.error('Login failed:', error);
      throw error;
    },
  });





  // Listen for logout events from axios interceptor
  useEffect(() => {
    const handleLogout = (event: Event) => {
      setUser(null);
      
      // Cancel all pending mutations and clear cache
      queryClient.cancelQueries();
      queryClient.clear();
      
      // Check if this is a session expiry (from axios interceptor)
      const customEvent = event as CustomEvent;
      console.log({customEvent});
      if (customEvent.detail?.sessionExpired) {
        showError("Session expired. Please log in again.");
      }
      
      navigate('/login', { replace: true });
      
      // Reset logout flag after automatic logout
      setTimeout(() => setLoggingOut(false), 1000);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [navigate, queryClient, showError]);

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const logout = () => {
    // Set global logout flag to prevent axios interceptor from making refresh calls
    setLoggingOut(true);
    
    // Clear local state immediately
    setUser(null);
    
    // Cancel all pending mutations and clear cache
    queryClient.cancelQueries();
    queryClient.clear();
    
    // Show logout toast
    showSuccess("You have been logged out.");
    
    navigate('/login', { replace: true });
    
    // Call logout endpoint in background
    apiClient.post('/auth/logout').catch(error => {
      console.error('Logout failed:', error);
    }).finally(() => {
      // Reset logout flag after logout is complete
      setTimeout(() => setLoggingOut(false), 1000);
    });
  };

  const checkAuth = async () => {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/me');
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      setUser(null);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
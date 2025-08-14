import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { 
  getFlights, 
  createFlight, 
  deleteFlight, 
  refreshFlights 
} from '@/services/flightService';
import { Flight, CreateFlightRequest } from '@/types/flight';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

// Query keys for cache management
export const flightQueryKeys = {
  all: ['flights'] as const,
  list: () => [...flightQueryKeys.all, 'list'] as const,
};

/**
 * Hook to fetch all flights
 * Only runs when user is authenticated and on the home page ("/")
 */
export const useGetFlights = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Only enable the query when user is authenticated and on the home page
  const shouldFetchFlights = isAuthenticated && location.pathname === '/';
  
  return useQuery({
    queryKey: flightQueryKeys.list(),
    queryFn: getFlights,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchInterval: shouldFetchFlights ? 60 * 1000 : false, // Auto-refetch every minute only when enabled
    enabled: shouldFetchFlights, // Disable query when not on home page or not authenticated
  });
};

/**
 * Hook to create a new flight
 */
export const useCreateFlight = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: createFlight,
    onSuccess: (newFlight: Flight) => {
      // Only update cache and show toast if user is still authenticated
      if (!isAuthenticated) {
        console.log('User not authenticated, skipping cache update after flight creation');
        return;
      }
      
      // Invalidate and refetch flights list
      queryClient.invalidateQueries({ queryKey: flightQueryKeys.list() });
      
      // Optimistically update the cache
      queryClient.setQueryData<Flight[]>(flightQueryKeys.list(), (oldFlights) => {
        return oldFlights ? [...oldFlights, newFlight] : [newFlight];
      });
      
      // Show success toast
      showSuccess("Flight created successfully.");
    },
    onError: (error) => {
      console.error('Failed to create flight:', error);
      // Only show error toast if user is still authenticated
      if (isAuthenticated) {
        showError("Failed to create flight. Please try again.");
      }
    },
  });
};

/**
 * Hook to delete a flight
 */
export const useDeleteFlight = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: deleteFlight,
    onSuccess: (_, deletedId: string) => {
      // Only update cache and show toast if user is still authenticated
      if (!isAuthenticated) {
        console.log('User not authenticated, skipping cache update after flight deletion');
        return;
      }
      
      // Optimistically update the cache
      queryClient.setQueryData<Flight[]>(flightQueryKeys.list(), (oldFlights) => {
        return oldFlights ? oldFlights.filter(flight => flight.id !== deletedId) : [];
      });
      
      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: flightQueryKeys.list() });
      
      // Show success toast
      showSuccess("Flight deleted successfully.");
    },
    onError: (error) => {
      console.error('Failed to delete flight:', error);
      
      // Only update cache and show error if user is still authenticated
      if (isAuthenticated) {
        // Refetch to restore correct state
        queryClient.invalidateQueries({ queryKey: flightQueryKeys.list() });
        showError("Failed to delete flight. Please try again.");
      }
    },
  });
};

/**
 * Hook to refresh all flights
 */
export const useRefreshFlights = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: refreshFlights,
    onSuccess: (updatedFlights: Flight[]) => {
      // Only update cache and show toast if user is still authenticated
      if (!isAuthenticated) {
        console.log('User not authenticated, skipping cache update after flight refresh');
        return;
      }
      
      // Update the cache with refreshed data
      queryClient.setQueryData<Flight[]>(flightQueryKeys.list(), updatedFlights);
      
      // Invalidate to trigger any dependent queries
      queryClient.invalidateQueries({ queryKey: flightQueryKeys.list() });
      
      // Show success toast
      showSuccess("Flight data refreshed.");
    },
    onError: (error) => {
      console.error('Failed to refresh flights:', error);
      // Only show error toast if user is still authenticated
      if (isAuthenticated) {
        showError("Failed to refresh flight data. Please try again.");
      }
    },
  });
};

/**
 * Combined hook that provides all flight operations
 * This maintains compatibility with the existing useFlights interface
 */
export const useFlights = () => {
  const { data: flights = [], isLoading, error, refetch } = useGetFlights();
  const { isAuthenticated } = useAuth();
  const createFlightMutation = useCreateFlight();
  const deleteFlightMutation = useDeleteFlight();
  const refreshFlightsMutation = useRefreshFlights();

  const addFlight = async (flightNumber: string) => {
    if (!flightNumber.trim()) return;
    
    // Check authentication before attempting mutation
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping flight creation');
      throw new Error('User not authenticated');
    }
    
    try {
      await createFlightMutation.mutateAsync({ 
        flightNumber: flightNumber.toUpperCase() 
      });
    } catch (error) {
      console.error('Failed to add flight:', error);
      throw error;
    }
  };

  const deleteFlight = async (id: string) => {
    // Check authentication before attempting mutation
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping flight deletion');
      throw new Error('User not authenticated');
    }
    
    try {
      await deleteFlightMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete flight:', error);
      throw error;
    }
  };

  const refreshFlights = async () => {
    // Check authentication before attempting mutation
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping flight refresh');
      throw new Error('User not authenticated');
    }
    
    try {
      await refreshFlightsMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to refresh flights:', error);
      throw error;
    }
  };

  return {
    flights,
    isLoading,
    error,
    addFlight,
    deleteFlight,
    refreshFlights,
    refetch,
    // Expose mutation states for more granular control
    isCreating: createFlightMutation.isPending,
    isDeleting: deleteFlightMutation.isPending,
    isRefreshing: refreshFlightsMutation.isPending,
    createError: createFlightMutation.error,
    deleteError: deleteFlightMutation.error,
    refreshError: refreshFlightsMutation.error,
  };
};
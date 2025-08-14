import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getFlights, 
  createFlight, 
  deleteFlight, 
  refreshFlights 
} from '@/services/flightService';
import { Flight, CreateFlightRequest } from '@/types/flight';

// Query keys for cache management
export const flightQueryKeys = {
  all: ['flights'] as const,
  list: () => [...flightQueryKeys.all, 'list'] as const,
};

/**
 * Hook to fetch all flights
 */
export const useGetFlights = () => {
  return useQuery({
    queryKey: flightQueryKeys.list(),
    queryFn: getFlights,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });
};

/**
 * Hook to create a new flight
 */
export const useCreateFlight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFlight,
    onSuccess: (newFlight: Flight) => {
      // Invalidate and refetch flights list
      queryClient.invalidateQueries({ queryKey: flightQueryKeys.list() });
      
      // Optimistically update the cache
      queryClient.setQueryData<Flight[]>(flightQueryKeys.list(), (oldFlights) => {
        return oldFlights ? [...oldFlights, newFlight] : [newFlight];
      });
    },
    onError: (error) => {
      console.error('Failed to create flight:', error);
    },
  });
};

/**
 * Hook to delete a flight
 */
export const useDeleteFlight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFlight,
    onSuccess: (_, deletedId: string) => {
      // Optimistically update the cache
      queryClient.setQueryData<Flight[]>(flightQueryKeys.list(), (oldFlights) => {
        return oldFlights ? oldFlights.filter(flight => flight.id !== deletedId) : [];
      });
      
      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: flightQueryKeys.list() });
    },
    onError: (error) => {
      console.error('Failed to delete flight:', error);
      // Refetch to restore correct state
      queryClient.invalidateQueries({ queryKey: flightQueryKeys.list() });
    },
  });
};

/**
 * Hook to refresh all flights
 */
export const useRefreshFlights = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshFlights,
    onSuccess: (updatedFlights: Flight[]) => {
      // Update the cache with refreshed data
      queryClient.setQueryData<Flight[]>(flightQueryKeys.list(), updatedFlights);
      
      // Invalidate to trigger any dependent queries
      queryClient.invalidateQueries({ queryKey: flightQueryKeys.list() });
    },
    onError: (error) => {
      console.error('Failed to refresh flights:', error);
    },
  });
};

/**
 * Combined hook that provides all flight operations
 * This maintains compatibility with the existing useFlights interface
 */
export const useFlights = () => {
  const { data: flights = [], isLoading, error, refetch } = useGetFlights();
  const createFlightMutation = useCreateFlight();
  const deleteFlightMutation = useDeleteFlight();
  const refreshFlightsMutation = useRefreshFlights();

  const addFlight = async (flightNumber: string) => {
    if (!flightNumber.trim()) return;
    
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
    try {
      await deleteFlightMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete flight:', error);
      throw error;
    }
  };

  const refreshFlights = async () => {
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
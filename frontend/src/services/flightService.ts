import { apiClient } from '@/lib/api';
import { Flight, CreateFlightRequest } from '@/types/flight';

/**
 * Fetch all flights from the backend
 */
export const getFlights = async (): Promise<Flight[]> => {
  const response = await apiClient.get<Flight[]>('/flights');
  return response.data;
};

/**
 * Create a new flight
 */
export const createFlight = async (flightData: CreateFlightRequest): Promise<Flight> => {
  const response = await apiClient.post<Flight>('/flights', flightData);
  return response.data;
};

/**
 * Delete a flight by ID
 */
export const deleteFlight = async (id: string): Promise<void> => {
  await apiClient.delete(`/flights/${id}`);
};

/**
 * Refresh all flights (trigger backend refresh)
 */
export const refreshFlights = async (): Promise<Flight[]> => {
  const response = await apiClient.put<Flight[]>('/flights/refresh');
  return response.data;
};
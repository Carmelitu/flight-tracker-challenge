import React from 'react';
import { Plane } from 'lucide-react';
import { useFlights } from '@/hooks/useFlightsQuery';
import { FlightForm } from './FlightForm';
import { FlightTable } from './FlightTable';
import LogoutButton from './LogoutButton';

const FlightTracker = () => {
  const { 
    flights, 
    isLoading, 
    error, 
    addFlight, 
    deleteFlight, 
    refreshFlights,
    isCreating,
    isDeleting,
    isRefreshing
  } = useFlights();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Plane className="w-12 h-12 text-yellow-500 animate-pulse mx-auto mb-4" />
          <p className="text-lg">Loading flights...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-4">
            Unable to connect to the flight tracking service.
          </p>
          <p className="text-sm text-gray-500">
            Please make sure the backend server is running on port 5001.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Plane className="w-8 h-8 text-yellow-500" />
              <h1 className="text-4xl font-bold">Flight Tracker</h1>
            </div>
            <LogoutButton />
          </div>
          <p className="text-gray-400 text-lg text-center">
            Real-time flight monitoring and status updates
          </p>
        </header>

        <FlightForm 
          onAddFlight={addFlight} 
          isLoading={isCreating}
        />
        <FlightTable 
          flights={flights}
          onDeleteFlight={deleteFlight}
          onRefreshFlights={refreshFlights}
          isDeleting={isDeleting}
          isRefreshing={isRefreshing}
        />

        <footer className="text-center mt-8 text-gray-500 text-sm">
          Connected to live flight tracking API
        </footer>
      </div>
    </div>
  );
};

export default FlightTracker;
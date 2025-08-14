import React from 'react';
import { Plane } from 'lucide-react';
import { useFlights } from '@/hooks/useFlights';
import { FlightForm } from './FlightForm';
import { FlightTable } from './FlightTable';

const FlightTracker = () => {
  const { flights, addFlight, deleteFlight, refreshFlights } = useFlights();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold">Flight Tracker</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Real-time flight monitoring and status updates
          </p>
        </header>

        <FlightForm onAddFlight={addFlight} />
        <FlightTable 
          flights={flights}
          onDeleteFlight={deleteFlight}
          onRefreshFlights={refreshFlights}
        />

        <footer className="text-center mt-8 text-gray-500 text-sm">
          Flight data is simulated for demonstration purposes
        </footer>
      </div>
    </div>
  );
};

export default FlightTracker;
import React from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Flight, FlightStatus } from '@/types/flight';

interface FlightTableProps {
  flights: Flight[];
  onDeleteFlight: (id: string) => void;
  onRefreshFlights: () => void;
  isDeleting?: boolean;
  isRefreshing?: boolean;
}

const getStatusColor = (status: FlightStatus) => {
  switch (status) {
    case 'AWAITING': return 'text-yellow-400';
    case 'DEPARTED': return 'text-blue-400';
    case 'ARRIVED': return 'text-green-400';
    default: return 'text-white';
  }
};

export const FlightTable: React.FC<FlightTableProps> = ({ 
  flights, 
  onDeleteFlight, 
  onRefreshFlights,
  isDeleting = false,
  isRefreshing = false
}) => {
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={onRefreshFlights}
          disabled={isRefreshing}
          className="bg-gray-700 hover:bg-gray-600 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh All'}
        </Button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700 border-b border-gray-600">
                <th className="text-left py-4 px-6 font-semibold text-white">Flight Number</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Departure</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Arrival</th>
                <th className="text-center py-4 px-6 font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    No flights added yet. Add your first flight above.
                  </td>
                </tr>
              ) : (
                flights.map((flight) => (
                  <tr key={flight.id} className="hover:bg-gray-700 border-b border-gray-600">
                    <td className="py-4 px-6 font-mono font-medium text-white">{flight.flightNumber}</td>
                    <td className="py-4 px-6">
                      <span className={`font-semibold ${getStatusColor(flight.status)}`}>
                        {flight.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-gray-300">
                      {flight.actualDepartureTime || '—'}
                    </td>
                    <td className="py-4 px-6 font-mono text-gray-300">
                      {flight.actualArrivalTime || '—'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Button
                        onClick={() => onDeleteFlight(flight.id)}
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        size="sm"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
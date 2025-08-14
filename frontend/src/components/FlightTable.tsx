import React from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Flight, FlightStatus } from '@/hooks/useFlights';

interface FlightTableProps {
  flights: Flight[];
  onDeleteFlight: (id: string) => void;
  onRefreshFlights: () => void;
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
  onRefreshFlights 
}) => {
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={onRefreshFlights} 
          className="bg-gray-700 hover:bg-gray-600 text-white flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh All
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
                      {flight.departureTime || '—'}
                    </td>
                    <td className="py-4 px-6 font-mono text-gray-300">
                      {flight.arrivalTime || '—'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Button
                        onClick={() => onDeleteFlight(flight.id)}
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        size="sm"
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
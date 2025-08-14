import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FlightFormProps {
  onAddFlight: (flightNumber: string) => Promise<void>;
  isLoading?: boolean;
}

export const FlightForm: React.FC<FlightFormProps> = ({ onAddFlight, isLoading = false }) => {
  const [flightNumber, setFlightNumber] = useState('');

  const handleSubmit = async () => {
    if (!flightNumber.trim() || isLoading) return;
    
    try {
      await onAddFlight(flightNumber);
      setFlightNumber('');
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to add flight:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="flight-input" className="block text-sm font-medium mb-2 text-gray-300">
            Flight Number
          </label>
          <Input
            id="flight-input"
            type="text"
            placeholder="e.g., BA123, LH456"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div className="flex items-end">
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !flightNumber.trim()}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add Flight'}
          </Button>
        </div>
      </div>
    </div>
  );
};
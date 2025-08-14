import { useState, useEffect } from 'react';

export type FlightStatus = 'AWAITING' | 'DEPARTED' | 'ARRIVED';

export interface Flight {
  id: string;
  flightNumber: string;
  status: FlightStatus;
  departureTime: string | null;
  arrivalTime: string | null;
}

const dummyFlights: Flight[] = [
  { id: '1', flightNumber: 'BA123', status: 'DEPARTED', departureTime: '14:30', arrivalTime: null },
  { id: '2', flightNumber: 'LH456', status: 'ARRIVED', departureTime: '10:15', arrivalTime: '16:45' },
  { id: '3', flightNumber: 'AF789', status: 'AWAITING', departureTime: null, arrivalTime: null },
];

export const useFlights = () => {
  const [flights, setFlights] = useState<Flight[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('flight-tracker-flights');
    setFlights(saved ? JSON.parse(saved) : dummyFlights);
  }, []);

  useEffect(() => {
    localStorage.setItem('flight-tracker-flights', JSON.stringify(flights));
  }, [flights]);

  const addFlight = (flightNumber: string) => {
    if (!flightNumber.trim()) return;
    
    const newFlight: Flight = {
      id: Date.now().toString(),
      flightNumber: flightNumber.toUpperCase(),
      status: 'AWAITING',
      departureTime: null,
      arrivalTime: null,
    };
    
    setFlights(prev => [...prev, newFlight]);
  };

  const deleteFlight = (id: string) => {
    setFlights(prev => prev.filter(flight => flight.id !== id));
  };

  const refreshFlights = () => {
    const statuses: FlightStatus[] = ['AWAITING', 'DEPARTED', 'ARRIVED'];
    
    setFlights(prev => prev.map(flight => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const now = new Date();
      
      let departureTime = flight.departureTime;
      let arrivalTime = flight.arrivalTime;

      if (status === 'DEPARTED' && !departureTime) {
        departureTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      }

      if (status === 'ARRIVED') {
        if (!departureTime) {
          departureTime = new Date(now.getTime() - 3600000).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        }
        if (!arrivalTime) {
          arrivalTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        }
      }

      return { ...flight, status, departureTime, arrivalTime };
    }));
  };

  return { flights, addFlight, deleteFlight, refreshFlights };
};
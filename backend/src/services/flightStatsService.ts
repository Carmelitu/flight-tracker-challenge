import { FlightServiceResponse, FlightServiceError } from '../types/flight';

export async function getFlightInfo(flightNumber: string): Promise<FlightServiceResponse | FlightServiceError> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 300));

  // Mock error scenario (15% chance)
  if (Math.random() < 0.15) {
    return { error: `FlightStats: Flight ${flightNumber} data temporarily unavailable` };
  }

  // Mock flight data scenarios with different timing patterns than FlightAware
  const scenarios = [
    // Flight awaiting departure
    { actualDepartureTime: null, actualArrivalTime: null },
    // Flight departed recently
    { 
      actualDepartureTime: new Date(Date.now() - Math.random() * 2400000).toISOString(), 
      actualArrivalTime: null 
    },
    // Flight arrived
    { 
      actualDepartureTime: new Date(Date.now() - Math.random() * 5400000).toISOString(), 
      actualArrivalTime: new Date(Date.now() - Math.random() * 900000).toISOString() 
    }
  ];

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  return scenario;
}
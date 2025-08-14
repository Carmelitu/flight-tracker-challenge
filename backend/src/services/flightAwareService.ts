import { FlightServiceResponse, FlightServiceError } from '../types/flight';

export async function getFlightInfo(flightNumber: string): Promise<FlightServiceResponse | FlightServiceError> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

  // Mock error scenario (10% chance)
  if (Math.random() < 0.1) {
    return { error: `FlightAware: Unable to find flight ${flightNumber}` };
  }

  // Mock flight data scenarios
  const scenarios = [
    // Flight awaiting departure
    { actualDepartureTime: null, actualArrivalTime: null },
    // Flight departed but not arrived
    { 
      actualDepartureTime: new Date(Date.now() - Math.random() * 3600000).toISOString(), 
      actualArrivalTime: null 
    },
    // Flight completed
    { 
      actualDepartureTime: new Date(Date.now() - Math.random() * 7200000).toISOString(), 
      actualArrivalTime: new Date(Date.now() - Math.random() * 1800000).toISOString() 
    }
  ];

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  return scenario;
}
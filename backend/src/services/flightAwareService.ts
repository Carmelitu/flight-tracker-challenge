import { FlightServiceResponse, FlightServiceError } from '../types/flight';

// In-memory storage for flight states to ensure consistency
const flightStates = new Map<string, {
  status: 'AWAITING' | 'DEPARTED' | 'ARRIVED';
  departureTime?: string;
  arrivalTime?: string;
  lastUpdated: number;
}>();

export async function getFlightInfo(flightNumber: string): Promise<FlightServiceResponse | FlightServiceError> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

  // Mock error scenario (10% chance for new flights only)
  if (!flightStates.has(flightNumber) && Math.random() < 0.1) {
    return { error: `FlightAware: Unable to find flight ${flightNumber}` };
  }

  const now = Date.now();
  let flightState = flightStates.get(flightNumber);

  // Initialize new flight or progress existing flight
  if (!flightState) {
    // New flight starts as AWAITING
    flightState = {
      status: 'AWAITING',
      lastUpdated: now
    };
    flightStates.set(flightNumber, flightState);
  } else {
    // Progress flight status based on time elapsed (simulate realistic progression)
    const timeSinceLastUpdate = now - flightState.lastUpdated;
    
    if (flightState.status === 'AWAITING' && timeSinceLastUpdate > 30000) { // 30 seconds
      // 50% chance to depart after 30 seconds
      if (Math.random() < 0.5) {
        flightState.status = 'DEPARTED';
        flightState.departureTime = new Date(now - Math.random() * 1800000).toISOString(); // Departed within last 30 min
        flightState.lastUpdated = now;
      }
    } else if (flightState.status === 'DEPARTED' && timeSinceLastUpdate > 60000) { // 60 seconds
      // 30% chance to arrive after being departed for 60 seconds
      if (Math.random() < 0.3) {
        flightState.status = 'ARRIVED';
        flightState.arrivalTime = new Date(now - Math.random() * 900000).toISOString(); // Arrived within last 15 min
        flightState.lastUpdated = now;
      }
    }
  }

  // Return consistent data based on current state
  return {
    actualDepartureTime: flightState.departureTime || null,
    actualArrivalTime: flightState.arrivalTime || null
  };
}
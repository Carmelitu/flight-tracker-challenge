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
  await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 300));

  // Mock error scenario (15% chance for new flights only)
  if (!flightStates.has(flightNumber) && Math.random() < 0.15) {
    return { error: `FlightStats: Flight ${flightNumber} data temporarily unavailable` };
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
    // Progress flight status based on time elapsed (slightly different timing than FlightAware)
    const timeSinceLastUpdate = now - flightState.lastUpdated;
    
    if (flightState.status === 'AWAITING' && timeSinceLastUpdate > 45000) { // 45 seconds
      // 40% chance to depart after 45 seconds
      if (Math.random() < 0.4) {
        flightState.status = 'DEPARTED';
        flightState.departureTime = new Date(now - Math.random() * 2400000).toISOString(); // Departed within last 40 min
        flightState.lastUpdated = now;
      }
    } else if (flightState.status === 'DEPARTED' && timeSinceLastUpdate > 90000) { // 90 seconds
      // 25% chance to arrive after being departed for 90 seconds
      if (Math.random() < 0.25) {
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
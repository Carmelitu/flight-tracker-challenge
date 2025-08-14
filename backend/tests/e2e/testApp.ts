import app from '../../src/app';
import * as flightService from '../../src/services/flightService';

// Helper function to reset the flight service state between tests
export function resetFlightService(): void {
  const allFlights = flightService.getAllFlights();
  allFlights.forEach(flight => {
    flightService.deleteFlight(flight.id);
  });
}

export default app;
import { Flight } from '../types/flight';
import * as flightAwareService from './flightAwareService';
import * as flightStatsService from './flightStatsService';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for flights
let flights: Flight[] = [];

export function getAllFlights(): Flight[] {
  return flights;
}

export function createFlight(flightNumber: string): Flight {
  const newFlight: Flight = {
    id: uuidv4(),
    flightNumber,
    status: 'AWAITING',
    actualDepartureTime: null,
    actualArrivalTime: null
  };

  flights.push(newFlight);
  return newFlight;
}

export function deleteFlight(id: string): boolean {
  const initialLength = flights.length;
  flights = flights.filter(flight => flight.id !== id);
  return flights.length < initialLength;
}

export async function refreshAllFlights(): Promise<Flight[]> {
  const refreshPromises = flights.map(async (flight) => {
    try {
      // Try FlightAware first, fallback to FlightStats
      let flightInfo = await flightAwareService.getFlightInfo(flight.flightNumber);
      
      if ('error' in flightInfo) {
        // Fallback to FlightStats
        flightInfo = await flightStatsService.getFlightInfo(flight.flightNumber);
        
        if ('error' in flightInfo) {
          // Both services failed, keep current data
          return flight;
        }
      }

      // Update flight status based on timing data
      let status: Flight['status'] = 'AWAITING';
      if (flightInfo.actualArrivalTime) {
        status = 'ARRIVED';
      } else if (flightInfo.actualDepartureTime) {
        status = 'DEPARTED';
      }

      return {
        ...flight,
        status,
        actualDepartureTime: flightInfo.actualDepartureTime,
        actualArrivalTime: flightInfo.actualArrivalTime
      };
    } catch (error) {
      // Keep original flight data if refresh fails
      return flight;
    }
  });

  flights = await Promise.all(refreshPromises);
  return flights;
}
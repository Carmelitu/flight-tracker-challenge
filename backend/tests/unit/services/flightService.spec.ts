import * as flightService from '../../../src/services/flightService';
import * as flightAwareService from '../../../src/services/flightAwareService';
import * as flightStatsService from '../../../src/services/flightStatsService';
import { Flight, FlightServiceResponse, FlightServiceError } from '../../../src/types/flight';

// Mock the external services
jest.mock('../../../src/services/flightAwareService');
jest.mock('../../../src/services/flightStatsService');

const mockedFlightAwareService = jest.mocked(flightAwareService);
const mockedFlightStatsService = jest.mocked(flightStatsService);

describe('FlightService', () => {
  // Reset the in-memory flights array before each test
  beforeEach(() => {
    // Clear all flights by getting all and deleting them
    const allFlights = flightService.getAllFlights();
    allFlights.forEach(flight => {
      flightService.deleteFlight(flight.id);
    });
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getAllFlights', () => {
    it('should return an empty array when no flights exist', () => {
      const flights = flightService.getAllFlights();
      expect(flights).toEqual([]);
      expect(Array.isArray(flights)).toBe(true);
    });

    it('should return all stored flights', () => {
      // Create some test flights
      const flight1 = flightService.createFlight('AA123');
      const flight2 = flightService.createFlight('BA456');

      const flights = flightService.getAllFlights();
      
      expect(flights).toHaveLength(2);
      expect(flights).toContainEqual(flight1);
      expect(flights).toContainEqual(flight2);
    });
  });

  describe('createFlight', () => {
    it('should create a new flight with UUID, correct status, and null times', () => {
      const flightNumber = 'DL789';
      
      const flight = flightService.createFlight(flightNumber);
      
      expect(flight).toMatchObject({
        flightNumber: 'DL789',
        status: 'AWAITING',
        actualDepartureTime: null,
        actualArrivalTime: null
      });
      expect(flight.id).toBeDefined();
      expect(typeof flight.id).toBe('string');
      expect(flight.id.length).toBeGreaterThan(0);
    });

    it('should add the flight to the flights array', () => {
      const flightNumber = 'UA101';
      
      const flight = flightService.createFlight(flightNumber);
      const allFlights = flightService.getAllFlights();
      
      expect(allFlights).toHaveLength(1);
      expect(allFlights[0]).toEqual(flight);
    });

    it('should generate unique IDs for different flights', () => {
      const flight1 = flightService.createFlight('AA123');
      const flight2 = flightService.createFlight('BB456');
      
      expect(flight1.id).not.toEqual(flight2.id);
    });

    it('should handle different flight numbers correctly', () => {
      const flights = [
        flightService.createFlight('AA123'),
        flightService.createFlight('BA456'),
        flightService.createFlight('CA789'),
      ];
      
      expect(flights[0].flightNumber).toBe('AA123');
      expect(flights[1].flightNumber).toBe('BA456');
      expect(flights[2].flightNumber).toBe('CA789');
    });
  });

  describe('deleteFlight', () => {
    it('should remove a flight by ID and return true if successful', () => {
      const flight = flightService.createFlight('SW111');
      
      const result = flightService.deleteFlight(flight.id);
      
      expect(result).toBe(true);
      expect(flightService.getAllFlights()).toHaveLength(0);
    });

    it('should return false if flight ID does not exist', () => {
      flightService.createFlight('JB222');
      
      const result = flightService.deleteFlight('non-existent-id');
      
      expect(result).toBe(false);
      expect(flightService.getAllFlights()).toHaveLength(1);
    });

    it('should only remove the specified flight', () => {
      const flight1 = flightService.createFlight('AA123');
      const flight2 = flightService.createFlight('BB456');
      const flight3 = flightService.createFlight('CC789');
      
      const result = flightService.deleteFlight(flight2.id);
      const remainingFlights = flightService.getAllFlights();
      
      expect(result).toBe(true);
      expect(remainingFlights).toHaveLength(2);
      expect(remainingFlights).toContainEqual(flight1);
      expect(remainingFlights).toContainEqual(flight3);
      expect(remainingFlights).not.toContainEqual(flight2);
    });

    it('should handle empty flight array gracefully', () => {
      const result = flightService.deleteFlight('any-id');
      
      expect(result).toBe(false);
      expect(flightService.getAllFlights()).toHaveLength(0);
    });
  });

  describe('refreshAllFlights', () => {
    beforeEach(() => {
      // Create some test flights for refresh scenarios
      flightService.createFlight('AA123');
      flightService.createFlight('BB456');
    });

    describe('when FlightAware returns valid data', () => {
      it('should update flight with AWAITING status when no times are provided', async () => {
        const mockResponse: FlightServiceResponse = {
          actualDepartureTime: null,
          actualArrivalTime: null
        };
        
        mockedFlightAwareService.getFlightInfo.mockResolvedValue(mockResponse);
        
        const updatedFlights = await flightService.refreshAllFlights();
        
        expect(updatedFlights).toHaveLength(2);
        updatedFlights.forEach(flight => {
          expect(flight.status).toBe('AWAITING');
          expect(flight.actualDepartureTime).toBeNull();
          expect(flight.actualArrivalTime).toBeNull();
        });
        
        expect(mockedFlightAwareService.getFlightInfo).toHaveBeenCalledTimes(2);
        expect(mockedFlightStatsService.getFlightInfo).not.toHaveBeenCalled();
      });

      it('should update flight with DEPARTED status when only departure time is provided', async () => {
        const departureTime = '2024-01-15T10:30:00Z';
        const mockResponse: FlightServiceResponse = {
          actualDepartureTime: departureTime,
          actualArrivalTime: null
        };
        
        mockedFlightAwareService.getFlightInfo.mockResolvedValue(mockResponse);
        
        const updatedFlights = await flightService.refreshAllFlights();
        
        expect(updatedFlights).toHaveLength(2);
        updatedFlights.forEach(flight => {
          expect(flight.status).toBe('DEPARTED');
          expect(flight.actualDepartureTime).toBe(departureTime);
          expect(flight.actualArrivalTime).toBeNull();
        });
      });

      it('should update flight with ARRIVED status when both times are provided', async () => {
        const departureTime = '2024-01-15T10:30:00Z';
        const arrivalTime = '2024-01-15T14:45:00Z';
        const mockResponse: FlightServiceResponse = {
          actualDepartureTime: departureTime,
          actualArrivalTime: arrivalTime
        };
        
        mockedFlightAwareService.getFlightInfo.mockResolvedValue(mockResponse);
        
        const updatedFlights = await flightService.refreshAllFlights();
        
        expect(updatedFlights).toHaveLength(2);
        updatedFlights.forEach(flight => {
          expect(flight.status).toBe('ARRIVED');
          expect(flight.actualDepartureTime).toBe(departureTime);
          expect(flight.actualArrivalTime).toBe(arrivalTime);
        });
      });
    });

    describe('when FlightAware fails but FlightStats returns valid data', () => {
      it('should fallback to FlightStats and update flight data', async () => {
        const flightAwareError: FlightServiceError = {
          error: 'FlightAware: Unable to find flight AA123'
        };
        const flightStatsResponse: FlightServiceResponse = {
          actualDepartureTime: '2024-01-15T11:00:00Z',
          actualArrivalTime: null
        };
        
        mockedFlightAwareService.getFlightInfo.mockResolvedValue(flightAwareError);
        mockedFlightStatsService.getFlightInfo.mockResolvedValue(flightStatsResponse);
        
        const updatedFlights = await flightService.refreshAllFlights();
        
        expect(updatedFlights).toHaveLength(2);
        updatedFlights.forEach(flight => {
          expect(flight.status).toBe('DEPARTED');
          expect(flight.actualDepartureTime).toBe('2024-01-15T11:00:00Z');
          expect(flight.actualArrivalTime).toBeNull();
        });
        
        expect(mockedFlightAwareService.getFlightInfo).toHaveBeenCalledTimes(2);
        expect(mockedFlightStatsService.getFlightInfo).toHaveBeenCalledTimes(2);
      });

      it('should call FlightStats with correct flight numbers', async () => {
        const flightAwareError: FlightServiceError = { error: 'Service unavailable' };
        const flightStatsResponse: FlightServiceResponse = {
          actualDepartureTime: null,
          actualArrivalTime: null
        };
        
        mockedFlightAwareService.getFlightInfo.mockResolvedValue(flightAwareError);
        mockedFlightStatsService.getFlightInfo.mockResolvedValue(flightStatsResponse);
        
        await flightService.refreshAllFlights();
        
        expect(mockedFlightStatsService.getFlightInfo).toHaveBeenCalledWith('AA123');
        expect(mockedFlightStatsService.getFlightInfo).toHaveBeenCalledWith('BB456');
      });
    });

    describe('when both services fail', () => {
      it('should keep original flight data unchanged', async () => {
        const originalFlights = flightService.getAllFlights();
        
        const flightAwareError: FlightServiceError = { error: 'FlightAware error' };
        const flightStatsError: FlightServiceError = { error: 'FlightStats error' };
        
        mockedFlightAwareService.getFlightInfo.mockResolvedValue(flightAwareError);
        mockedFlightStatsService.getFlightInfo.mockResolvedValue(flightStatsError);
        
        const updatedFlights = await flightService.refreshAllFlights();
        
        expect(updatedFlights).toHaveLength(2);
        expect(updatedFlights).toEqual(originalFlights);
        
        // Verify both services were called
        expect(mockedFlightAwareService.getFlightInfo).toHaveBeenCalledTimes(2);
        expect(mockedFlightStatsService.getFlightInfo).toHaveBeenCalledTimes(2);
      });
    });

    describe('when services throw exceptions', () => {
      it('should keep original data when FlightAware throws exceptions', async () => {
        const originalFlights = flightService.getAllFlights();
        
        mockedFlightAwareService.getFlightInfo.mockRejectedValue(new Error('Network error'));
        
        const updatedFlights = await flightService.refreshAllFlights();
        
        // When FlightAware throws an exception, the catch block returns original flight data
        expect(updatedFlights).toHaveLength(2);
        expect(updatedFlights).toEqual(originalFlights);
        
        // FlightAware should be called, but FlightStats should not be called due to exception handling
        expect(mockedFlightAwareService.getFlightInfo).toHaveBeenCalledTimes(2);
        expect(mockedFlightStatsService.getFlightInfo).not.toHaveBeenCalled();
      });

      it('should keep original data when both services throw exceptions', async () => {
        const originalFlights = flightService.getAllFlights();
        
        mockedFlightAwareService.getFlightInfo.mockRejectedValue(new Error('FlightAware network error'));
        mockedFlightStatsService.getFlightInfo.mockRejectedValue(new Error('FlightStats network error'));
        
        const updatedFlights = await flightService.refreshAllFlights();
        
        expect(updatedFlights).toEqual(originalFlights);
      });
    });

    it('should handle empty flights array', async () => {
      // Clear all flights
      const allFlights = flightService.getAllFlights();
      allFlights.forEach(flight => flightService.deleteFlight(flight.id));
      
      const updatedFlights = await flightService.refreshAllFlights();
      
      expect(updatedFlights).toHaveLength(0);
      expect(mockedFlightAwareService.getFlightInfo).not.toHaveBeenCalled();
      expect(mockedFlightStatsService.getFlightInfo).not.toHaveBeenCalled();
    });

    it('should process multiple flights concurrently', async () => {
      // Add more flights to test concurrency
      flightService.createFlight('CC789');
      flightService.createFlight('DD101');
      
      const mockResponse: FlightServiceResponse = {
        actualDepartureTime: '2024-01-15T09:00:00Z',
        actualArrivalTime: null
      };
      
      mockedFlightAwareService.getFlightInfo.mockResolvedValue(mockResponse);
      
      const startTime = Date.now();
      const updatedFlights = await flightService.refreshAllFlights();
      const endTime = Date.now();
      
      expect(updatedFlights).toHaveLength(4);
      expect(mockedFlightAwareService.getFlightInfo).toHaveBeenCalledTimes(4);
      
      // Should complete relatively quickly due to concurrent processing
      // This is a rough test - actual timing may vary
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
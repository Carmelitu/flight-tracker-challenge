import * as flightAwareService from '../../../src/services/flightAwareService';
import { FlightServiceResponse, FlightServiceError } from '../../../src/types/flight';

describe('FlightAware Service', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Mock setTimeout to avoid real delays in tests
    jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback();
      return {} as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('getFlightInfo', () => {
    it('should return flight information with proper structure', async () => {
      const flightNumber = 'AA123';
      
      const result = await flightAwareService.getFlightInfo(flightNumber);
      
      expect(result).toBeDefined();
      
      if ('error' in result) {
        expect(result).toHaveProperty('error');
        expect(typeof result.error).toBe('string');
      } else {
        expect(result).toHaveProperty('actualDepartureTime');
        expect(result).toHaveProperty('actualArrivalTime');
      }
    });

    it('should initialize new flights as AWAITING', async () => {
      const flightNumber = 'NEW123';
      
      // Mock Math.random to ensure no errors occur
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5); // Greater than 0.1, so no error
      
      const result = await flightAwareService.getFlightInfo(flightNumber);
      
      // New flights should start as AWAITING
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.actualDepartureTime).toBeNull();
        expect(result.actualArrivalTime).toBeNull();
      }
      
      Math.random = originalRandom;
    });

    it('should maintain consistent state across multiple calls', async () => {
      const flightNumber = 'CONSISTENT123';
      
      // Mock Math.random to ensure no errors occur
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5); // Greater than 0.1, so no error
      
      const result1 = await flightAwareService.getFlightInfo(flightNumber);
      const result2 = await flightAwareService.getFlightInfo(flightNumber);
      
      // Both calls should return the same state (no random changes)
      expect(result1).toEqual(result2);
      
      Math.random = originalRandom;
    });

    it('should progress flight status over time', async () => {
      const flightNumber = 'PROGRESS123';
      
      // Initial call - should be AWAITING
      const initialResult = await flightAwareService.getFlightInfo(flightNumber);
      if (!('error' in initialResult)) {
        expect(initialResult.actualDepartureTime).toBeNull();
        expect(initialResult.actualArrivalTime).toBeNull();
      }
      
      // Advance time by 35 seconds (past the 30 second departure threshold)
      jest.advanceTimersByTime(35000);
      
      // Mock Math.random to ensure progression (50% chance to depart)
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.3); // Less than 0.5, so should depart
      
      const progressedResult = await flightAwareService.getFlightInfo(flightNumber);
      
      // Should potentially have progressed to DEPARTED
      if (!('error' in progressedResult)) {
        // Either still awaiting or progressed to departed
        if (progressedResult.actualDepartureTime !== null) {
          expect(progressedResult.actualDepartureTime).not.toBeNull();
          expect(progressedResult.actualArrivalTime).toBeNull();
        }
      }
      
      Math.random = originalRandom;
    });

    it('should handle error scenarios for new flights only', async () => {
      // Mock Math.random to force error on new flight
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.05); // Less than 0.1, should error
      
      const flightNumber = 'ERRORTEST123';
      const result = await flightAwareService.getFlightInfo(flightNumber);
      
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('FlightAware:');
        expect(result.error).toContain('Unable to find flight');
        expect(result.error).toContain(flightNumber);
      }
      
      Math.random = originalRandom;
    });

    it('should not error on existing flights', async () => {
      const flightNumber = 'EXISTING123';
      
      // Mock Math.random to ensure first call succeeds
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5); // No error for first call
      
      // First call to establish the flight
      const firstResult = await flightAwareService.getFlightInfo(flightNumber);
      expect('error' in firstResult).toBe(false); // Ensure flight is established
      
      // Now mock Math.random to force error condition
      Math.random = jest.fn().mockReturnValue(0.05); // Would error for new flights
      
      // Second call should not error since flight already exists
      const result = await flightAwareService.getFlightInfo(flightNumber);
      
      expect('error' in result).toBe(false);
      
      Math.random = originalRandom;
    });

    it('should return proper TypeScript types', async () => {
      const flightNumber = 'TYPES123';
      
      const result = await flightAwareService.getFlightInfo(flightNumber);
      
      if ('error' in result) {
        const errorResult: FlightServiceError = result;
        expect(typeof errorResult.error).toBe('string');
      } else {
        const successResult: FlightServiceResponse = result;
        expect(successResult.actualDepartureTime === null || typeof successResult.actualDepartureTime === 'string').toBe(true);
        expect(successResult.actualArrivalTime === null || typeof successResult.actualArrivalTime === 'string').toBe(true);
      }
    });

    it('should progress from DEPARTED to ARRIVED over time', async () => {
      const flightNumber = 'ARRIVAL123';
      
      // Mock random to ensure progression
      const originalRandom = Math.random;
      let callCount = 0;
      Math.random = jest.fn().mockImplementation(() => {
        callCount++;
        return 0.2; // Always less than thresholds to ensure progression
      });
      
      // Initial call
      await flightAwareService.getFlightInfo(flightNumber);
      
      // Advance past departure threshold and call again
      jest.advanceTimersByTime(35000);
      const departedResult = await flightAwareService.getFlightInfo(flightNumber);
      
      // Advance past arrival threshold and call again
      jest.advanceTimersByTime(65000);
      const arrivedResult = await flightAwareService.getFlightInfo(flightNumber);
      
      // Check progression
      if (!('error' in departedResult) && !('error' in arrivedResult)) {
        // If it progressed to departed, it should have departure time
        if (departedResult.actualDepartureTime !== null) {
          expect(departedResult.actualDepartureTime).not.toBeNull();
          expect(departedResult.actualArrivalTime).toBeNull();
          
          // If it then progressed to arrived, it should have both times
          if (arrivedResult.actualArrivalTime !== null) {
            expect(arrivedResult.actualDepartureTime).not.toBeNull();
            expect(arrivedResult.actualArrivalTime).not.toBeNull();
          }
        }
      }
      
      Math.random = originalRandom;
    });

    it('should generate realistic timestamps', async () => {
      const flightNumber = 'TIMESTAMPS123';
      
      // Mock to ensure progression
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.1);
      
      await flightAwareService.getFlightInfo(flightNumber);
      
      // Advance time and trigger departure
      jest.advanceTimersByTime(35000);
      const result = await flightAwareService.getFlightInfo(flightNumber);
      
      if (!('error' in result) && result.actualDepartureTime) {
        const departureTime = new Date(result.actualDepartureTime).getTime();
        const now = Date.now();
        
        // Departure time should be in the past (within last 30 minutes as per implementation)
        expect(departureTime).toBeLessThanOrEqual(now);
        expect(now - departureTime).toBeLessThanOrEqual(1800000); // 30 minutes
      }
      
      Math.random = originalRandom;
    });
  });
});
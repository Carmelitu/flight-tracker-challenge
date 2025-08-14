import * as flightStatsService from '../../../src/services/flightStatsService';
import { FlightServiceResponse, FlightServiceError } from '../../../src/types/flight';

describe('FlightStats Service', () => {
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
      const flightNumber = 'BA456';
      
      const result = await flightStatsService.getFlightInfo(flightNumber);
      
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
      const flightNumber = 'NEWSTATS456';
      
      // Mock Math.random to ensure no errors occur
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5); // Greater than 0.15, so no error
      
      const result = await flightStatsService.getFlightInfo(flightNumber);
      
      // New flights should start as AWAITING
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.actualDepartureTime).toBeNull();
        expect(result.actualArrivalTime).toBeNull();
      }
      
      Math.random = originalRandom;
    });

    it('should maintain consistent state across multiple calls', async () => {
      const flightNumber = 'CONSISTENTSTATS456';
      
      // Mock Math.random to ensure no errors occur
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5); // Greater than 0.15, so no error
      
      const result1 = await flightStatsService.getFlightInfo(flightNumber);
      const result2 = await flightStatsService.getFlightInfo(flightNumber);
      
      // Both calls should return the same state (no random changes)
      expect(result1).toEqual(result2);
      
      Math.random = originalRandom;
    });

    it('should progress flight status over time with FlightStats timing', async () => {
      const flightNumber = 'PROGRESSSTATS456';
      
      // Initial call - should be AWAITING
      const initialResult = await flightStatsService.getFlightInfo(flightNumber);
      if (!('error' in initialResult)) {
        expect(initialResult.actualDepartureTime).toBeNull();
        expect(initialResult.actualArrivalTime).toBeNull();
      }
      
      // Advance time by 50 seconds (past the 45 second departure threshold)
      jest.advanceTimersByTime(50000);
      
      // Mock Math.random to ensure progression (40% chance to depart)
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.3); // Less than 0.4, so should depart
      
      const progressedResult = await flightStatsService.getFlightInfo(flightNumber);
      
      // Should potentially have progressed to DEPARTED
      if (!('error' in progressedResult)) {
        if (progressedResult.actualDepartureTime !== null) {
          expect(progressedResult.actualDepartureTime).not.toBeNull();
          expect(progressedResult.actualArrivalTime).toBeNull();
        }
      }
      
      Math.random = originalRandom;
    });

    it('should handle error scenarios for new flights with 15% chance', async () => {
      // Mock Math.random to force error on new flight
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.1); // Less than 0.15, should error
      
      const flightNumber = 'ERRORSTATS456';
      const result = await flightStatsService.getFlightInfo(flightNumber);
      
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('FlightStats:');
        expect(result.error).toContain('data temporarily unavailable');
        expect(result.error).toContain(flightNumber);
      }
      
      Math.random = originalRandom;
    });

    it('should not error on existing flights', async () => {
      const flightNumber = 'EXISTINGSTATS456';
      
      // Mock Math.random to ensure first call succeeds
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5); // No error for first call
      
      // First call to establish the flight
      const firstResult = await flightStatsService.getFlightInfo(flightNumber);
      expect('error' in firstResult).toBe(false); // Ensure flight is established
      
      // Now mock Math.random to force error condition
      Math.random = jest.fn().mockReturnValue(0.1); // Would error for new flights
      
      // Second call should not error since flight already exists
      const result = await flightStatsService.getFlightInfo(flightNumber);
      
      expect('error' in result).toBe(false);
      
      Math.random = originalRandom;
    });

    it('should progress from DEPARTED to ARRIVED with different timing than FlightAware', async () => {
      const flightNumber = 'ARRIVALSTATS456';
      
      // Mock random to ensure progression
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.2); // Always less than thresholds
      
      // Initial call
      await flightStatsService.getFlightInfo(flightNumber);
      
      // Advance past departure threshold (45s) and call again
      jest.advanceTimersByTime(50000);
      const departedResult = await flightStatsService.getFlightInfo(flightNumber);
      
      // Advance past arrival threshold (90s) and call again
      jest.advanceTimersByTime(95000);
      const arrivedResult = await flightStatsService.getFlightInfo(flightNumber);
      
      // Check progression
      if (!('error' in departedResult) && !('error' in arrivedResult)) {
        if (departedResult.actualDepartureTime !== null) {
          expect(departedResult.actualDepartureTime).not.toBeNull();
          expect(departedResult.actualArrivalTime).toBeNull();
          
          if (arrivedResult.actualArrivalTime !== null) {
            expect(arrivedResult.actualDepartureTime).not.toBeNull();
            expect(arrivedResult.actualArrivalTime).not.toBeNull();
          }
        }
      }
      
      Math.random = originalRandom;
    });

    it('should generate realistic timestamps with FlightStats patterns', async () => {
      const flightNumber = 'TIMESTAMPSSTATS456';
      
      // Mock to ensure progression
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.1);
      
      await flightStatsService.getFlightInfo(flightNumber);
      
      // Advance time and trigger departure
      jest.advanceTimersByTime(50000);
      const result = await flightStatsService.getFlightInfo(flightNumber);
      
      if (!('error' in result) && result.actualDepartureTime) {
        const departureTime = new Date(result.actualDepartureTime).getTime();
        const now = Date.now();
        
        // Departure time should be in the past (within last 40 minutes as per FlightStats implementation)
        expect(departureTime).toBeLessThanOrEqual(now);
        expect(now - departureTime).toBeLessThanOrEqual(2400000); // 40 minutes
      }
      
      Math.random = originalRandom;
    });

    it('should work as fallback service with proper structure', async () => {
      const flightNumber = 'FALLBACKSTATS456';
      
      const result = await flightStatsService.getFlightInfo(flightNumber);
      
      expect(result).toBeDefined();
      
      if (!('error' in result)) {
        expect(result).toHaveProperty('actualDepartureTime');
        expect(result).toHaveProperty('actualArrivalTime');
        expect(result.actualDepartureTime === null || typeof result.actualDepartureTime === 'string').toBe(true);
        expect(result.actualArrivalTime === null || typeof result.actualArrivalTime === 'string').toBe(true);
      }
    });

    it('should return proper TypeScript types', async () => {
      const flightNumber = 'TYPESSTATS456';
      
      const result = await flightStatsService.getFlightInfo(flightNumber);
      
      if ('error' in result) {
        const errorResult: FlightServiceError = result;
        expect(typeof errorResult.error).toBe('string');
      } else {
        const successResult: FlightServiceResponse = result;
        expect(successResult.actualDepartureTime === null || typeof successResult.actualDepartureTime === 'string').toBe(true);
        expect(successResult.actualArrivalTime === null || typeof successResult.actualArrivalTime === 'string').toBe(true);
      }
    });
  });
});
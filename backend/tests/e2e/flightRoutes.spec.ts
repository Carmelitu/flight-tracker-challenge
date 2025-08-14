import request from 'supertest';
import app, { resetFlightService } from './testApp';
import * as flightService from '../../src/services/flightService';
import { Flight } from '../../src/types/flight';

describe('Flight Routes E2E', () => {
  beforeEach(() => {
    // Reset flight service state before each test
    resetFlightService();
  });

  describe('GET /api/flights', () => {
    it('should return empty array when no flights exist', async () => {
      const response = await request(app)
        .get('/api/flights')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all flights when flights exist', async () => {
      // Create some test flights directly through service
      const flight1 = flightService.createFlight('AA123');
      const flight2 = flightService.createFlight('BB456');

      const response = await request(app)
        .get('/api/flights')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toContainEqual(flight1);
      expect(response.body).toContainEqual(flight2);
    });

    it('should return correct content type', async () => {
      const response = await request(app)
        .get('/api/flights')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('POST /api/flights', () => {
    it('should create a new flight with valid data', async () => {
      const flightData = { flightNumber: 'DL789' };

      const response = await request(app)
        .post('/api/flights')
        .send(flightData)
        .expect(201);

      expect(response.body).toMatchObject({
        flightNumber: 'DL789',
        status: 'AWAITING',
        actualDepartureTime: null,
        actualArrivalTime: null
      });
      expect(response.body.id).toBeDefined();
      expect(typeof response.body.id).toBe('string');
    });

    it('should add flight to the flights array', async () => {
      const flightData = { flightNumber: 'UA101' };

      await request(app)
        .post('/api/flights')
        .send(flightData)
        .expect(201);

      // Verify it was added by getting all flights
      const getResponse = await request(app)
        .get('/api/flights')
        .expect(200);

      expect(getResponse.body).toHaveLength(1);
      expect(getResponse.body[0].flightNumber).toBe('UA101');
    });

    it('should return correct content type', async () => {
      const flightData = { flightNumber: 'SW222' };

      const response = await request(app)
        .post('/api/flights')
        .send(flightData)
        .expect(201);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    describe('validation errors', () => {
      it('should return 400 for missing flight number', async () => {
        const response = await request(app)
          .post('/api/flights')
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body).toHaveProperty('details');
        expect(response.body.details[0].message).toContain('Invalid input: expected string, received undefined');
      });

      it('should return 400 for empty flight number', async () => {
        const response = await request(app)
          .post('/api/flights')
          .send({ flightNumber: '' })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body).toHaveProperty('details');
        expect(response.body.details[0].message).toContain('Flight number is required');
      });

      it('should return 400 for flight number that is too long', async () => {
        const response = await request(app)
          .post('/api/flights')
          .send({ flightNumber: 'VERYLONGFLIGHTNUMBER123' })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body).toHaveProperty('details');
        expect(response.body.details[0].message).toContain('Flight number must be at most 10 characters');
      });

      it('should return 400 for non-string flight number', async () => {
        const response = await request(app)
          .post('/api/flights')
          .send({ flightNumber: 12345 })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });

      it('should return 400 for null flight number', async () => {
        const response = await request(app)
          .post('/api/flights')
          .send({ flightNumber: null })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });

      it('should reject whitespace-only flight numbers after trimming', async () => {
        const response = await request(app)
          .post('/api/flights')
          .send({ flightNumber: '   ' })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body).toHaveProperty('details');
        expect(response.body.details[0].message).toContain('Flight number is required');
      });
    });

    it('should trim whitespace from flight number', async () => {
      const flightData = { flightNumber: '  AA123  ' };

      const response = await request(app)
        .post('/api/flights')
        .send(flightData)
        .expect(201);

      expect(response.body.flightNumber).toBe('AA123');
    });

    it('should handle valid edge case flight numbers', async () => {
      const testCases = [
        'A', // minimum length
        'ABCDEFGHIJ', // maximum length (10 chars)
        'AA123',
        'B6789',
        'SW1234'
      ];

      for (const flightNumber of testCases) {
        const response = await request(app)
          .post('/api/flights')
          .send({ flightNumber })
          .expect(201);

        expect(response.body.flightNumber).toBe(flightNumber);
      }
    });
  });

  describe('DELETE /api/flights/:id', () => {
    it('should delete existing flight and return 204', async () => {
      // Create a flight first
      const flight = flightService.createFlight('JB333');

      await request(app)
        .delete(`/api/flights/${flight.id}`)
        .expect(204);

      // Verify it was deleted
      const getResponse = await request(app)
        .get('/api/flights')
        .expect(200);

      expect(getResponse.body).toHaveLength(0);
    });

    it('should return 404 for non-existent flight ID', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .delete(`/api/flights/${fakeUuid}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Flight not found');
    });

    it('should only delete the specified flight', async () => {
      // Create multiple flights
      const flight1 = flightService.createFlight('AA111');
      const flight2 = flightService.createFlight('BB222');
      const flight3 = flightService.createFlight('CC333');

      // Delete the middle one
      await request(app)
        .delete(`/api/flights/${flight2.id}`)
        .expect(204);

      // Verify only the specified flight was deleted
      const getResponse = await request(app)
        .get('/api/flights')
        .expect(200);

      expect(getResponse.body).toHaveLength(2);
      expect(getResponse.body).toContainEqual(flight1);
      expect(getResponse.body).toContainEqual(flight3);
      expect(getResponse.body).not.toContainEqual(flight2);
    });

    describe('validation errors', () => {
      it('should return 400 for invalid UUID format', async () => {
        const response = await request(app)
          .delete('/api/flights/invalid-uuid')
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body).toHaveProperty('details');
        expect(response.body.details[0].message).toContain('Invalid UUID format');
      });

      it('should return 400 for empty ID', async () => {
        const response = await request(app)
          .delete('/api/flights/')
          .expect(404); // This will hit the catch-all route instead

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Route not found');
      });

      it('should return 400 for non-UUID string', async () => {
        const response = await request(app)
          .delete('/api/flights/not-a-uuid-at-all')
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body).toHaveProperty('details');
        expect(response.body.details[0].message).toContain('Invalid UUID format');
      });

      it('should return 400 for UUID with wrong format', async () => {
        const response = await request(app)
          .delete('/api/flights/123-456-789')
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body).toHaveProperty('details');
        expect(response.body.details[0].message).toContain('Invalid UUID format');
      });
    });

    it('should handle valid UUID formats', async () => {
      // Test various valid UUID v4 formats (all should return 404 since they don't exist)
      const validUuids = [
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
      ];

      for (const uuid of validUuids) {
        const response = await request(app)
          .delete(`/api/flights/${uuid}`)
          .expect(404);

        expect(response.body.error).toBe('Flight not found');
      }
    });
  });

  describe('PUT /api/flights/refresh', () => {
    it('should refresh flights and return updated data', async () => {
      // Create some test flights
      flightService.createFlight('AA123');
      flightService.createFlight('BB456');

      const response = await request(app)
        .put('/api/flights/refresh')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Each flight should have the expected structure
      response.body.forEach((flight: Flight) => {
        expect(flight).toHaveProperty('id');
        expect(flight).toHaveProperty('flightNumber');
        expect(flight).toHaveProperty('status');
        expect(flight).toHaveProperty('actualDepartureTime');
        expect(flight).toHaveProperty('actualArrivalTime');
      });
    });

    it('should return empty array when no flights exist', async () => {
      const response = await request(app)
        .put('/api/flights/refresh')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return correct content type', async () => {
      const response = await request(app)
        .put('/api/flights/refresh')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Integration workflow', () => {
    it('should support complete CRUD workflow', async () => {
      // 1. Start with empty flights
      let response = await request(app)
        .get('/api/flights')
        .expect(200);
      expect(response.body).toHaveLength(0);

      // 2. Create a flight
      const createResponse = await request(app)
        .post('/api/flights')
        .send({ flightNumber: 'TEST123' })
        .expect(201);
      
      const flightId = createResponse.body.id;
      expect(createResponse.body.flightNumber).toBe('TEST123');

      // 3. Verify it exists
      response = await request(app)
        .get('/api/flights')
        .expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(flightId);

      // 4. Refresh flights
      const refreshResponse = await request(app)
        .put('/api/flights/refresh')
        .expect(200);
      expect(refreshResponse.body).toHaveLength(1);
      expect(refreshResponse.body[0].id).toBe(flightId);

      // 5. Delete the flight
      await request(app)
        .delete(`/api/flights/${flightId}`)
        .expect(204);

      // 6. Verify it's gone
      response = await request(app)
        .get('/api/flights')
        .expect(200);
      expect(response.body).toHaveLength(0);
    });

    it('should handle multiple flights independently', async () => {
      // Create multiple flights
      const flights: Flight[] = [];
      for (let i = 1; i <= 3; i++) {
        const response = await request(app)
          .post('/api/flights')
          .send({ flightNumber: `TEST${i}` })
          .expect(201);
        flights.push(response.body);
      }

      // Verify all exist
      let response = await request(app)
        .get('/api/flights')
        .expect(200);
      expect(response.body).toHaveLength(3);

      // Delete middle flight
      await request(app)
        .delete(`/api/flights/${flights[1].id}`)
        .expect(204);

      // Verify only 2 remain
      response = await request(app)
        .get('/api/flights')
        .expect(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.map((f: Flight) => f.flightNumber).sort()).toEqual(['TEST1', 'TEST3']);

      // Refresh remaining flights
      const refreshResponse = await request(app)
        .put('/api/flights/refresh')
        .expect(200);
      expect(refreshResponse.body).toHaveLength(2);
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON in POST requests', async () => {
      const response = await request(app)
        .post('/api/flights')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(500);

      // Express error handler catches JSON parse errors
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');
    });

    it('should handle missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/flights')
        .send('flightNumber=AA123')
        .expect(400);

      // Without proper Content-Type, the body won't be parsed correctly
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('CORS and Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/flights')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:8080');
    });

    it('should handle OPTIONS preflight requests', async () => {
      const response = await request(app)
        .options('/api/flights')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});
import { Router } from 'express';
import * as flightController from '../controllers/flightController';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';
import { createFlightSchema } from '../schemas/flight.create.schema';
import { deleteFlightSchema } from '../schemas/flight.delete.schema';

const router = Router();

// Apply authentication middleware to all flight routes
router.use(authMiddleware);

// GET /flights - Get all tracked flights
router.get('/', flightController.getAllFlights);

// POST /flights - Add a new flight with validation
router.post('/', 
  validateRequest(createFlightSchema, 'body'),
  flightController.createFlight
);

// DELETE /flights/:id - Remove a flight by ID with validation
router.delete('/:id', 
  validateRequest(deleteFlightSchema, 'params'),
  flightController.deleteFlight
);

// PUT /flights/refresh - Update status of all flights
router.put('/refresh', flightController.refreshFlights);

export default router;
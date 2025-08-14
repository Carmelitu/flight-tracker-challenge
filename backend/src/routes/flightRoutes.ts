import { Router } from 'express';
import * as flightController from '../controllers/flightController';

const router = Router();

// GET /flights - Get all tracked flights
router.get('/', flightController.getAllFlights);

// POST /flights - Add a new flight
router.post('/', flightController.createFlight);

// DELETE /flights/:id - Remove a flight by ID
router.delete('/:id', flightController.deleteFlight);

// PUT /flights/refresh - Update status of all flights
router.put('/refresh', flightController.refreshFlights);

export default router;
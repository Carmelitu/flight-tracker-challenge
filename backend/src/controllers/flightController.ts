import { Request, Response } from 'express';
import * as flightService from '../services/flightService';
import { CreateFlightRequest } from '../types/flight';
import { ValidatedRequest } from '../middleware/validateRequest';
import { CreateFlightSchemaType } from '../schemas/flight.create.schema';
import { DeleteFlightSchemaType } from '../schemas/flight.delete.schema';

export async function getAllFlights(req: Request, res: Response): Promise<void> {
  try {
    const flights = flightService.getAllFlights();
    res.json(flights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve flights' });
  }
}

export async function createFlight(req: ValidatedRequest, res: Response): Promise<void> {
  try {
    // Data has already been validated by middleware, so we can safely use it
    const { flightNumber }: CreateFlightSchemaType = req.validatedData;

    const flight = flightService.createFlight(flightNumber);
    res.status(201).json(flight);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create flight' });
  }
}

export async function deleteFlight(req: ValidatedRequest, res: Response): Promise<void> {
  try {
    // Data has already been validated by middleware, so we can safely use it
    const { id }: DeleteFlightSchemaType = req.validatedData;

    const deleted = flightService.deleteFlight(id);
    
    if (!deleted) {
      res.status(404).json({ error: 'Flight not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete flight' });
  }
}

export async function refreshFlights(req: Request, res: Response): Promise<void> {
  try {
    const updatedFlights = await flightService.refreshAllFlights();
    res.json(updatedFlights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh flights' });
  }
}
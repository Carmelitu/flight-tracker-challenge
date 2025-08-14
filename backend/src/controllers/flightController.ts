import { Request, Response } from 'express';
import * as flightService from '../services/flightService';
import { CreateFlightRequest } from '../types/flight';

export async function getAllFlights(req: Request, res: Response): Promise<void> {
  try {
    const flights = flightService.getAllFlights();
    res.json(flights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve flights' });
  }
}

export async function createFlight(req: Request<{}, {}, CreateFlightRequest>, res: Response): Promise<void> {
  try {
    const { flightNumber } = req.body;

    if (!flightNumber || typeof flightNumber !== 'string') {
      res.status(400).json({ error: 'Flight number is required and must be a string' });
      return;
    }

    const flight = flightService.createFlight(flightNumber);
    res.status(201).json(flight);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create flight' });
  }
}

export async function deleteFlight(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Flight ID is required' });
      return;
    }

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
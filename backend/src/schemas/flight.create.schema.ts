import { z } from 'zod';

/**
 * Zod schema for validating flight creation requests
 * Validates that flightNumber is a non-empty string with max 10 characters
 */
export const createFlightSchema = z.object({
  flightNumber: z.string()
    .min(1, 'Flight number is required')
    .max(10, 'Flight number must be at most 10 characters')
    .trim()
});

export type CreateFlightSchemaType = z.infer<typeof createFlightSchema>;
import { z } from 'zod';

/**
 * Zod schema for validating flight deletion requests
 * Validates that id is a valid UUID format
 */
export const deleteFlightSchema = z.object({
  id: z.string()
    .uuid('Invalid UUID format for flight ID')
});

export type DeleteFlightSchemaType = z.infer<typeof deleteFlightSchema>;
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Custom request interface that includes validated data
 */
export interface ValidatedRequest extends Request {
  validatedData?: any;
}

/**
 * Middleware factory for validating request data using Zod schemas
 * @param schema - Zod schema to validate against
 * @param property - Request property to validate ('body', 'query', 'params')
 * @returns Express middleware function
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  property: 'body' | 'query' | 'params' = 'body'
) {
  return (req: ValidatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Validate the specified request property against the schema
      const validatedData = schema.parse(req[property]);
      
      // Attach validated data to request object
      req.validatedData = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors for client response
        const formattedErrors = error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          error: 'Validation failed',
          details: formattedErrors
        });
      } else {
        // Handle unexpected errors
        res.status(500).json({
          error: 'Internal server error during validation'
        });
      }
    }
  };
}
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../errors/customErrors';

/**
 * Validation target - where to validate the data from
 */
type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Creates a validation middleware for a given Zod schema
 *
 * This is a higher-order function that returns Express middleware
 * Usage:
 *   router.post('/categories', validate(createCategorySchema), createCategory);
 *
 * @param schema - Zod schema to validate against
 * @param target - Where to get the data from (body, params, or query)
 * @returns Express middleware function
 */
export const validate = (schema: z.ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Get data from the specified target
      const dataToValidate = req[target];

      // Validate the data using the schema
      const validatedData = schema.parse(dataToValidate);

      // Replace the original data with validated/sanitized data
      // This ensures any transformations (like trim()) are applied
      req[target] = validatedData;

      // Proceed to next middleware/controller
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Transform Zod errors into our custom ValidationError
        const formattedErrors = formatZodErrors(error);
        next(new ValidationError('Validation failed', formattedErrors));
      } else {
        // Pass unexpected errors to error handler
        next(error);
      }
    }
  };
};

/**
 * Formats Zod validation errors into a more readable structure
 *
 * Transforms Zod's error format into a simple object mapping field names to error messages
 * Example output: { name: "Name is required", price: "Price must be positive" }
 *
 * @param error - ZodError from schema validation
 * @returns Object mapping field names to error messages
 */
function formatZodErrors(error: ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};

  error.issues.forEach((err: any) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });

  return formattedErrors;
}

/**
 * Validates numeric ID parameters from route params
 *
 * This is a specialized middleware for validating :id route parameters
 * Usage:
 *   router.get('/categories/:id', validateId, getCategory);
 *
 * Ensures the ID is a valid positive integer
 */
export const validateId = (req: Request, res: Response, next: NextFunction): void => {
  const idSchema = z.object({
    id: z.coerce.number().int().positive('ID must be a positive integer'),
  });

  try {
    const validatedParams = idSchema.parse(req.params);
    req.params = validatedParams as any; // Type assertion needed for Express types
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = formatZodErrors(error);
      next(new ValidationError('Invalid ID parameter', formattedErrors));
    } else {
      next(error);
    }
  }
};

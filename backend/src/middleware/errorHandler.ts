import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/customErrors';

/**
 * Standardized error response interface
 * Ensures all error responses have a consistent structure
 */
interface ErrorResponse {
  error: string;
  details?: any;
  statusCode: number;
  timestamp: string;
  path: string;
}

/**
 * Global error handling middleware
 *
 * This middleware should be registered AFTER all routes in server.ts
 * It catches any errors thrown in controllers and formats them appropriately
 *
 * @param err - The error object (can be AppError or generic Error)
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function (required for error middleware signature)
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default to 500 Internal Server Error
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // If it's our custom AppError, use its properties
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

    // Include validation details if available (from ValidationError)
    if ('errors' in err && err.errors) {
      details = err.errors;
    }
  }

  // Log the error for debugging
  // In production, you'd want to use a proper logging service (Winston, Pino, etc.)
  if (statusCode >= 500) {
    // Server errors - log full stack trace
    console.error('❌ Server Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    // Client errors - log minimal info
    console.warn('⚠️  Client Error:', {
      message: err.message,
      statusCode,
      path: req.path,
      method: req.method,
    });
  }

  // Build standardized error response
  const errorResponse: ErrorResponse = {
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Include details for validation errors (helps with debugging)
  if (details) {
    errorResponse.details = details;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Helper function to wrap async route handlers
 * This eliminates the need for try-catch in every controller
 *
 * Usage:
 *   router.get('/categories', asyncHandler(async (req, res) => {
 *     const categories = await getCategories();
 *     res.json(categories);
 *   }));
 *
 * Any errors thrown will be caught and passed to errorHandler middleware
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

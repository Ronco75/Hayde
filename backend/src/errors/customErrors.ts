/**
 * Base class for all custom application errors
 * Extends the native Error class with HTTP status code support
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * ValidationError - Used for input validation failures (400 Bad Request)
 *
 * Example: Missing required fields, invalid data formats, type mismatches
 */
export class ValidationError extends AppError {
  public readonly errors?: any;

  constructor(message: string, errors?: any) {
    super(message, 400);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

/**
 * NotFoundError - Used when a requested resource doesn't exist (404 Not Found)
 *
 * Example: Category ID 123 not found, Guest with ID 456 doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * ConflictError - Used for resource conflicts (409 Conflict)
 *
 * Example: Duplicate entries, foreign key violations, constraint violations
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * DatabaseError - Used for database-level errors (500 Internal Server Error)
 *
 * Example: Connection failures, query errors, transaction failures
 */
export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, false); // Not operational - requires developer attention
    this.name = 'DatabaseError';
  }
}

/**
 * UnprocessableEntityError - Used when request is valid but semantically incorrect (422)
 *
 * Example: Cannot delete category with existing expenses, invalid state transitions
 */
export class UnprocessableEntityError extends AppError {
  constructor(message: string) {
    super(message, 422);
    this.name = 'UnprocessableEntityError';
  }
}

import { Prisma } from '@prisma/client';
import { NotFoundError, ConflictError, DatabaseError } from './customErrors';

/**
 * Prisma Error Handler
 * Maps Prisma Client errors to custom application errors
 *
 * Common Prisma Error Codes:
 * - P2002: Unique constraint violation
 * - P2003: Foreign key constraint violation
 * - P2025: Record not found
 */

export function handlePrismaError(error: unknown, customMessage?: string): never {
  // Check if it's a Prisma error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const target = error.meta?.target as string[] | undefined;
        const field = target?.[0] || 'field';
        throw new ConflictError(`A record with this ${field} already exists`);

      case 'P2003':
        // Foreign key constraint violation
        const fieldName = error.meta?.field_name as string | undefined;
        if (fieldName?.includes('category_id')) {
          throw new ConflictError('Category does not exist');
        } else if (fieldName?.includes('group_id')) {
          throw new ConflictError('Group does not exist');
        }
        throw new ConflictError('Foreign key constraint violation');

      case 'P2025':
        // Record not found
        throw new NotFoundError(customMessage || 'Record not found');

      default:
        // Other Prisma errors
        console.error('Prisma error:', error);
        throw new DatabaseError(customMessage || 'Database operation failed');
    }
  }

  // Check for Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error('Prisma validation error:', error.message);
    throw new DatabaseError('Invalid data provided for database operation');
  }

  // Unknown error - re-throw or wrap in DatabaseError
  if (error instanceof Error) {
    console.error('Database error:', error);
    throw new DatabaseError(customMessage || error.message);
  }

  // Fallback
  throw new DatabaseError(customMessage || 'An unexpected database error occurred');
}

/**
 * Helper function to handle Prisma errors for delete operations
 * Provides better error messages for delete-specific scenarios
 */
export function handlePrismaDeleteError(error: unknown, entityName: string, id: number | string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2025':
        // Record not found
        throw new NotFoundError(`${entityName} with ID ${id} not found`);

      case 'P2003':
        // Foreign key constraint - cannot delete because of dependent records
        throw new ConflictError(
          `Cannot delete ${entityName} with existing related records. Please delete related records first.`
        );

      default:
        handlePrismaError(error, `Failed to delete ${entityName}`);
    }
  }

  handlePrismaError(error, `Failed to delete ${entityName}`);
}

/**
 * Helper function to handle Prisma errors for update operations
 */
export function handlePrismaUpdateError(error: unknown, entityName: string, id: number | string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      throw new NotFoundError(`${entityName} with ID ${id} not found`);
    }
  }

  handlePrismaError(error, `Failed to update ${entityName}`);
}

/**
 * Helper function to handle Prisma errors for create operations
 */
export function handlePrismaCreateError(error: unknown, entityName: string): never {
  handlePrismaError(error, `Failed to create ${entityName}`);
}

import { Request, Response } from 'express';
import pool from '../config/db';
import { Category } from '../types/Category';
import { NotFoundError, ConflictError, DatabaseError } from '../errors/customErrors';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/schemas';

/**
 * Create a new category
 * POST /api/categories
 *
 * Validation is handled by middleware, so we can assume req.body is valid here
 */
export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body as CreateCategoryInput;

  try {
    // Insert into database
    const result = await pool.query<Category>(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );

    const newCategory: Category = result.rows[0];
    res.status(201).json(newCategory);

  } catch (error: any) {
    // Handle database-specific errors
    if (error.code === '23505') {
      // Unique constraint violation (duplicate category name if we add unique constraint)
      throw new ConflictError('Category with this name already exists');
    }

    console.error('Database error creating category:', error);
    throw new DatabaseError('Failed to create category');
  }
};

/**
 * Get all categories
 * GET /api/categories
 */
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await pool.query<Category>('SELECT * FROM categories ORDER BY created_at DESC');
    const categories: Category[] = result.rows;
    res.json(categories);
  } catch (error) {
    console.error('Database error fetching categories:', error);
    throw new DatabaseError('Failed to fetch categories');
  }
};

/**
 * Update category name
 * PUT /api/categories/:id
 *
 * Validation is handled by middleware
 */
export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body as UpdateCategoryInput;

  try {
    // Update in database
    const result = await pool.query<Category>(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }

    const updatedCategory: Category = result.rows[0];
    res.json(updatedCategory);

  } catch (error: any) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    // Handle database-specific errors
    if (error.code === '23505') {
      throw new ConflictError('Category with this name already exists');
    }

    console.error('Database error updating category:', error);
    throw new DatabaseError('Failed to update category');
  }
};

/**
 * Delete a category
 * DELETE /api/categories/:id
 *
 * Note: This will fail if the category has associated expenses (foreign key constraint)
 */
export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }

    res.status(204).send();

  } catch (error: any) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    // Handle foreign key constraint violation
    if (error.code === '23503') {
      throw new ConflictError('Cannot delete category with existing expenses. Delete the expenses first.');
    }

    console.error('Database error deleting category:', error);
    throw new DatabaseError('Failed to delete category');
  }
};
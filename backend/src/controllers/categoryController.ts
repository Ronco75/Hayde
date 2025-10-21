import { Request, Response } from 'express';
import pool from '../config/db';
import { Category } from '../types/Category';

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Insert into database
    const result = await pool.query<Category>(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );

    const newCategory: Category = result.rows[0];
    res.status(201).json(newCategory);

  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await pool.query<Category>('SELECT * FROM categories ORDER BY created_at DESC');
    const categories: Category[] = result.rows;
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update category name
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Update in database
    const result = await pool.query<Category>(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updatedCategory: Category = result.rows[0];
    res.json(updatedCategory);
    
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
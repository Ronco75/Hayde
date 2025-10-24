import { Request, Response } from 'express';
import pool from '../config/db';
import { Expense } from '../types/Expense';
import { NotFoundError, ConflictError, DatabaseError } from '../errors/customErrors';
import { CreateExpenseInput, UpdateExpenseInput } from '../validators/schemas';

/**
 * Create a new expense
 * POST /api/expenses
 *
 * Validation is handled by middleware
 */
export const createExpense = async (req: Request, res: Response) => {
  const { category_id, name, price_per_unit, quantity, amount_paid } = req.body as CreateExpenseInput;

  try {
    const result = await pool.query<Expense>(
      `INSERT INTO expenses (category_id, name, price_per_unit, quantity, amount_paid)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *,
         (price_per_unit * quantity) as total_cost,
         (price_per_unit * quantity - amount_paid) as remaining_amount`,
      [category_id, name, price_per_unit, quantity, amount_paid]
    );

    const newExpense: Expense = result.rows[0];
    res.status(201).json(newExpense);

  } catch (error: any) {
    // Handle foreign key violation (invalid category_id)
    if (error.code === '23503') {
      throw new ConflictError(`Category with ID ${category_id} does not exist`);
    }

    console.error('Database error creating expense:', error);
    throw new DatabaseError('Failed to create expense');
  }
};

/**
 * Get all expenses with calculated fields
 * GET /api/expenses
 */
export const getAllExpenses = async (req: Request, res: Response) => {
  try {
    const result = await pool.query<Expense>(`
      SELECT
        *,
        (price_per_unit * quantity) as total_cost,
        (price_per_unit * quantity - amount_paid) as remaining_amount
      FROM expenses
      ORDER BY created_at DESC
    `);

    const expenses: Expense[] = result.rows;
    res.json(expenses);

  } catch (error) {
    console.error('Database error fetching expenses:', error);
    throw new DatabaseError('Failed to fetch expenses');
  }
};

/**
 * Get all expenses by category
 * GET /api/expenses/category/:id
 */
export const getExpensesByCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query<Expense>(
      `SELECT
        *,
        (price_per_unit * quantity) as total_cost,
        (price_per_unit * quantity - amount_paid) as remaining_amount
      FROM expenses
      WHERE category_id = $1
      ORDER BY created_at DESC`,
      [id]
    );

    const expenses: Expense[] = result.rows;
    res.json(expenses);

  } catch (error) {
    console.error('Database error fetching expenses by category:', error);
    throw new DatabaseError('Failed to fetch expenses by category');
  }
};

/**
 * Update an expense
 * PUT /api/expenses/:id
 *
 * Validation is handled by middleware
 */
export const updateExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { category_id, name, price_per_unit, quantity, amount_paid } = req.body as UpdateExpenseInput;

  try {
    const result = await pool.query<Expense>(
      `UPDATE expenses
       SET category_id = $1, name = $2, price_per_unit = $3, quantity = $4, amount_paid = $5
       WHERE id = $6
       RETURNING *,
         (price_per_unit * quantity) as total_cost,
         (price_per_unit * quantity - amount_paid) as remaining_amount`,
      [category_id, name, price_per_unit, quantity, amount_paid, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Expense with ID ${id} not found`);
    }

    const updatedExpense: Expense = result.rows[0];
    res.json(updatedExpense);

  } catch (error: any) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    // Handle foreign key violation (invalid category_id)
    if (error.code === '23503') {
      throw new ConflictError(`Category with ID ${category_id} does not exist`);
    }

    console.error('Database error updating expense:', error);
    throw new DatabaseError('Failed to update expense');
  }
};

/**
 * Delete an expense
 * DELETE /api/expenses/:id
 */
export const deleteExpense = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      throw new NotFoundError(`Expense with ID ${id} not found`);
    }

    res.status(204).send();

  } catch (error: any) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    console.error('Database error deleting expense:', error);
    throw new DatabaseError('Failed to delete expense');
  }
};

/**
 * Interface for category totals aggregation
 */
interface CategoryTotals {
  category_id: number;
  total_cost: number;
  amount_paid: number;
  remaining_amount: number;
}

/**
 * Get totals grouped by category
 * GET /api/expenses/totals
 *
 * Returns aggregated financial data per category
 */
export const getCategoryTotals = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query<CategoryTotals>(
      `SELECT
         category_id,
         SUM(price_per_unit * quantity) as total_cost,
         SUM(amount_paid) as amount_paid,
         SUM(price_per_unit * quantity - amount_paid) as remaining_amount
       FROM expenses
       GROUP BY category_id`
    );

    const categoryTotals: CategoryTotals[] = result.rows;
    res.json(categoryTotals);

  } catch (error) {
    console.error('Database error fetching category totals:', error);
    throw new DatabaseError('Failed to fetch category totals');
  }
};

import { Request, Response } from 'express';
import pool from '../config/db';
import { Expense } from '../types/Expense';

// Create a new expense
export const createExpense = async (req: Request, res: Response) => {
    const { category_id, name, price_per_unit, quantity =1 , amount_paid = 0 } = req.body;

    // Validate input
    if (!category_id || !name || !price_per_unit) {
        return res.status(400).json({ error: 'All fields are required' });
    }
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
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all expenses
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
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all expenses by category
export const getExpensesByCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query<Expense>(`
            SELECT 
              *,
              (price_per_unit * quantity) as total_cost,
              (price_per_unit * quantity - amount_paid) as remaining_amount
            FROM expenses 
            WHERE category_id = $1 ORDER BY created_at DESC`, [id]);
        const expenses: Expense[] = result.rows;
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses by category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//update an expense
export const updateExpense = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { category_id, name, price_per_unit, quantity, amount_paid } = req.body;
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
            return res.status(404).json({ error: 'Expense not found' });
          }
        const updatedExpense: Expense = result.rows[0];
        res.json(updatedExpense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete an expense
export const deleteExpense = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

interface CategoryTotals {
    category_id: number;
    total_cost: number;
    amount_paid: number;
    remaining_amount: number;
}

// Get totals grouped by category
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
    console.error('Error fetching category totals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
import { Request, Response } from 'express';
import pool from '../config/db';

// Create a new expense
export const createExpense = async (req: Request, res: Response) => {
    const { category_id, name, price_per_unit, quantity =1 , amount_paid = 0 } = req.body;

    // Validate input
    if (!category_id || !name || !price_per_unit) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO expenses (category_id, name, price_per_unit, quantity, amount_paid) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *, 
               (price_per_unit * quantity) as total_cost,
               (price_per_unit * quantity - amount_paid) as remaining_amount`,
            [category_id, name, price_per_unit, quantity, amount_paid]
          );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all expenses
export const getAllExpenses = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
              *,
              (price_per_unit * quantity) as total_cost,
              (price_per_unit * quantity - amount_paid) as remaining_amount
            FROM expenses 
            ORDER BY created_at DESC
          `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all expenses by category
export const getExpensesByCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
              *,
              (price_per_unit * quantity) as total_cost,
              (price_per_unit * quantity - amount_paid) as remaining_amount
            FROM expenses 
            WHERE category_id = $1 ORDER BY created_at DESC`, [id]);
        res.json(result.rows);
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
        const result = await pool.query(
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
        res.json(result.rows[0]);
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

import { Router } from 'express';
import {
    createExpense,
    deleteExpense,
    getAllExpenses,
    getExpensesByCategory,
    updateExpense,
    getCategoryTotals
 } from '../controllers/expensesController';
import { validate, validateId } from '../middleware/validation';
import { createExpenseSchema, updateExpenseSchema } from '../validators/schemas';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/expenses/totals - Totals per category (MUST come before /:id routes)
router.get('/totals', asyncHandler(getCategoryTotals));

// GET /api/expenses/category/:id - Get all expenses by category
router.get('/category/:id', validateId, asyncHandler(getExpensesByCategory));

// POST /api/expenses - Create a new expense
router.post('/', validate(createExpenseSchema), asyncHandler(createExpense));

// GET /api/expenses - Get all expenses
router.get('/', asyncHandler(getAllExpenses));

// PUT /api/expenses/:id - Update an expense
router.put('/:id', validateId, validate(updateExpenseSchema), asyncHandler(updateExpense));

// DELETE /api/expenses/:id - Delete an expense
router.delete('/:id', validateId, asyncHandler(deleteExpense));

export default router;

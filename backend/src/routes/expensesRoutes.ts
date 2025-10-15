import { Router } from 'express';
import { createExpense, deleteExpense, getAllExpenses, getExpensesByCategory, updateExpense } from '../controllers/expensesController';

const router = Router();

//POST /api/expenses - Create a new expense
router.post('/', createExpense);

//GET /api/expenses - Get all expenses
router.get('/', getAllExpenses);

//GET /api/expenses/category/:id - Get all expenses by category
router.get('/category/:id', getExpensesByCategory);

//DELETE /api/expenses/:id - Delete an expense
router.delete('/:id', deleteExpense);

//PUT /api/expenses/:id - Update an expense
router.put('/:id', updateExpense);



export default router;

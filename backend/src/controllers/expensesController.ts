import { Request, Response, Router } from 'express';
import prisma from '../config/db';
import { Decimal } from '@prisma/client/runtime/library';
import { handlePrismaCreateError, handlePrismaUpdateError, handlePrismaDeleteError } from '../errors/prismaErrorHandler';
import { CreateExpenseInput, UpdateExpenseInput } from '../validators/schemas';
import { transformExpense, transformExpenses } from '../utils/transformers';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticate);

/**
 * Create a new expense
 * POST /api/expenses
 *
 * Validation is handled by middleware
 */
export const createExpense = async (req: Request, res: Response) => {
  const { category_id, name, price_per_unit, quantity, amount_paid } = req.body as CreateExpenseInput;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found. Please create a wedding first.' });
      return;
    }

    const newExpense = await prisma.expense.create({
      data: {
        weddingId: wedding.id,
        categoryId: category_id,
        name,
        pricePerUnit: price_per_unit,
        quantity,
        amountPaid: amount_paid,
      },
    });

    res.status(201).json(transformExpense(newExpense));

  } catch (error) {
    handlePrismaCreateError(error, 'Expense');
  }
};

/**
 * Get all expenses with calculated fields
 * GET /api/expenses
 */
export const getAllExpenses = async (req: Request, res: Response) => {
  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.json([]); // Return empty array if no wedding yet
      return;
    }

    const expenses = await prisma.expense.findMany({
      where: { weddingId: wedding.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(transformExpenses(expenses));

  } catch (error) {
    handlePrismaCreateError(error, 'Expenses');
  }
};

/**
 * Get all expenses by category
 * GET /api/expenses/category/:id
 */
export const getExpensesByCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.json([]); // Return empty array if no wedding yet
      return;
    }

    const expenses = await prisma.expense.findMany({
      where: { 
        weddingId: wedding.id,
        categoryId: parseInt(id),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(transformExpenses(expenses));

  } catch (error) {
    handlePrismaCreateError(error, 'Expenses by category');
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
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Update only if the expense belongs to this user's wedding
    const updatedExpense = await prisma.expense.updateMany({
      where: { 
        id: parseInt(id),
        weddingId: wedding.id, // Security check
      },
      data: {
        categoryId: category_id,
        name,
        pricePerUnit: price_per_unit,
        quantity,
        amountPaid: amount_paid,
      },
    });

    if (updatedExpense.count === 0) {
      res.status(404).json({ error: 'Expense not found or you do not have permission to update it' });
      return;
    }

    // Fetch the updated expense to return
    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(id) },
    });

    res.json(transformExpense(expense!));

  } catch (error) {
    handlePrismaUpdateError(error, 'Expense', id);
  }
};

/**
 * Delete an expense
 * DELETE /api/expenses/:id
 */
export const deleteExpense = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Delete only if the expense belongs to this user's wedding
    const deletedExpense = await prisma.expense.deleteMany({
      where: { 
        id: parseInt(id),
        weddingId: wedding.id, // Security check
      },
    });

    if (deletedExpense.count === 0) {
      res.status(404).json({ error: 'Expense not found or you do not have permission to delete it' });
      return;
    }

    res.status(204).send();

  } catch (error) {
    handlePrismaDeleteError(error, 'Expense', id);
  }
};

/**
 * Get category totals for the user's wedding
 * GET /api/expenses/totals
 */
export const getCategoryTotals = async (req: Request, res: Response) => {
  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.json([]); // Return empty array if no wedding yet
      return;
    }

    // Fetch all expenses to calculate totals manually
    // We can't use groupBy with calculated fields (pricePerUnit * quantity)
    const expenses = await prisma.expense.findMany({
      where: { weddingId: wedding.id },
    });

    // Group by category and calculate totals
    const categoryTotals = new Map<number, { total_cost: number; amount_paid: number }>();

    expenses.forEach((expense) => {
      const totalCost = expense.pricePerUnit.toNumber() * expense.quantity;
      const amountPaid = expense.amountPaid.toNumber();

      const existing = categoryTotals.get(expense.categoryId);
      if (existing) {
        existing.total_cost += totalCost;
        existing.amount_paid += amountPaid;
      } else {
        categoryTotals.set(expense.categoryId, {
          total_cost: totalCost,
          amount_paid: amountPaid,
        });
      }
    });

    // Transform to array format
    const result = Array.from(categoryTotals.entries()).map(([categoryId, totals]) => ({
      category_id: categoryId,
      total_cost: totals.total_cost,
      amount_paid: totals.amount_paid,
      remaining: totals.total_cost - totals.amount_paid,
    }));

    res.json(result);

  } catch (error) {
    console.error('Error getting category totals:', error);
    res.status(500).json({ error: 'Failed to get category totals' });
  }
};
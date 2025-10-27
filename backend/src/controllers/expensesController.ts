import { Request, Response } from 'express';
import prisma from '../config/db';
import { Decimal } from '@prisma/client/runtime/library';
import { handlePrismaCreateError, handlePrismaUpdateError, handlePrismaDeleteError } from '../errors/prismaErrorHandler';
import { CreateExpenseInput, UpdateExpenseInput } from '../validators/schemas';
import { transformExpense, transformExpenses } from '../utils/transformers';

/**
 * Create a new expense
 * POST /api/expenses
 *
 * Validation is handled by middleware
 */
export const createExpense = async (req: Request, res: Response) => {
  const { category_id, name, price_per_unit, quantity, amount_paid } = req.body as CreateExpenseInput;

  try {
    const newExpense = await prisma.expense.create({
      data: {
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
    const expenses = await prisma.expense.findMany({
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
    const expenses = await prisma.expense.findMany({
      where: { categoryId: parseInt(id) },
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
    const updatedExpense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        categoryId: category_id,
        name,
        pricePerUnit: price_per_unit,
        quantity,
        amountPaid: amount_paid,
      },
    });

    res.json(transformExpense(updatedExpense));

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
    await prisma.expense.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();

  } catch (error) {
    handlePrismaDeleteError(error, 'Expense', id);
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
    // Use Prisma groupBy with aggregate
    const groupedExpenses = await prisma.expense.groupBy({
      by: ['categoryId'],
      _sum: {
        amountPaid: true,
      },
    });

    // Get all expenses to calculate total_cost manually (since it's a computed field)
    const allExpenses = await prisma.expense.findMany({
      select: {
        categoryId: true,
        pricePerUnit: true,
        quantity: true,
        amountPaid: true,
      },
    });

    // Calculate totals by category
    const totalsMap = new Map<number, CategoryTotals>();

    allExpenses.forEach((expense) => {
      const categoryId = expense.categoryId;
      const pricePerUnit = expense.pricePerUnit instanceof Decimal ? expense.pricePerUnit.toNumber() : Number(expense.pricePerUnit);
      const amountPaid = expense.amountPaid instanceof Decimal ? expense.amountPaid.toNumber() : Number(expense.amountPaid);
      const totalCost = pricePerUnit * expense.quantity;

      if (!totalsMap.has(categoryId)) {
        totalsMap.set(categoryId, {
          category_id: categoryId,
          total_cost: 0,
          amount_paid: 0,
          remaining_amount: 0,
        });
      }

      const totals = totalsMap.get(categoryId)!;
      totals.total_cost += totalCost;
      totals.amount_paid += amountPaid;
      totals.remaining_amount = totals.total_cost - totals.amount_paid;
    });

    const categoryTotals = Array.from(totalsMap.values());
    res.json(categoryTotals);

  } catch (error) {
    handlePrismaCreateError(error, 'Category totals');
  }
};

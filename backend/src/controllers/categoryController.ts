import { Request, Response, Router } from 'express';
import prisma from '../config/db';
import { NotFoundError } from '../errors/customErrors';
import { handlePrismaCreateError, handlePrismaUpdateError, handlePrismaDeleteError } from '../errors/prismaErrorHandler';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/schemas';
import { transformCategory, transformCategories } from '../utils/transformers';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticate);

/**
 * Create a new category
 * POST /api/categories
 *
 * Validation is handled by middleware, so we can assume req.body is valid here
 */
export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body as CreateCategoryInput;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found. Please create a wedding first.' });
      return;
    }

    // Create category associated with the wedding
    const newCategory = await prisma.category.create({
      data: { 
        name,
        weddingId: wedding.id,
      },
    });

    res.status(201).json(transformCategory(newCategory));

  } catch (error) {
    handlePrismaCreateError(error, 'Category');
  }
};

/**
 * Get all categories for the authenticated user's wedding
 * GET /api/categories
 */
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.json([]); // Return empty array if no wedding yet
      return;
    }

    // Get only categories belonging to this wedding
    const categories = await prisma.category.findMany({
      where: { weddingId: wedding.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(transformCategories(categories));

  } catch (error) {
    handlePrismaCreateError(error, 'Categories');
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
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Update only if the category belongs to this user's wedding
    const updatedCategory = await prisma.category.updateMany({
      where: { 
        id: parseInt(id),
        weddingId: wedding.id, // Security: ensure user owns this category
      },
      data: { name },
    });

    if (updatedCategory.count === 0) {
      res.status(404).json({ error: 'Category not found or you do not have permission to update it' });
      return;
    }

    // Fetch the updated category to return
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    res.json(transformCategory(category!));

  } catch (error) {
    handlePrismaUpdateError(error, 'Category', id);
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
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Delete only if the category belongs to this user's wedding
    const deletedCategory = await prisma.category.deleteMany({
      where: { 
        id: parseInt(id),
        weddingId: wedding.id, // Security: ensure user owns this category
      },
    });

    if (deletedCategory.count === 0) {
      res.status(404).json({ error: 'Category not found or you do not have permission to delete it' });
      return;
    }

    res.status(204).send();

  } catch (error) {
    handlePrismaDeleteError(error, 'Category', id);
  }
};
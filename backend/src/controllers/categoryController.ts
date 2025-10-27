import { Request, Response } from 'express';
import prisma from '../config/db';
import { NotFoundError } from '../errors/customErrors';
import { handlePrismaCreateError, handlePrismaUpdateError, handlePrismaDeleteError } from '../errors/prismaErrorHandler';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/schemas';
import { transformCategory, transformCategories } from '../utils/transformers';

/**
 * Create a new category
 * POST /api/categories
 *
 * Validation is handled by middleware, so we can assume req.body is valid here
 */
export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body as CreateCategoryInput;

  try {
    const newCategory = await prisma.category.create({
      data: { name },
    });

    res.status(201).json(transformCategory(newCategory));

  } catch (error) {
    handlePrismaCreateError(error, 'Category');
  }
};

/**
 * Get all categories
 * GET /api/categories
 */
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
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
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    res.json(transformCategory(updatedCategory));

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
    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();

  } catch (error) {
    handlePrismaDeleteError(error, 'Category', id);
  }
};
import { Router } from 'express';
import {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
 } from '../controllers/categoryController';
import { validate, validateId } from '../middleware/validation';
import { createCategorySchema, updateCategorySchema } from '../validators/schemas';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// POST /api/categories - Create a new category
router.post('/', validate(createCategorySchema), asyncHandler(createCategory));

// GET /api/categories - Get all categories
router.get('/', asyncHandler(getAllCategories));

// PUT /api/categories/:id - Update category
router.put('/:id', validateId, validate(updateCategorySchema), asyncHandler(updateCategory));

// DELETE /api/categories/:id - Delete category
router.delete('/:id', validateId, asyncHandler(deleteCategory));

export default router;

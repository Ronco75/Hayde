import { Router } from 'express';
import { createCategory, getAllCategories, updateCategory, deleteCategory } from '../controllers/categoryController';

const router = Router();

//POST /api/categories - Create a new category
router.post('/', createCategory);

//GET /api/categories - Get all categories
router.get('/', getAllCategories);

// PUT /api/categories/:id - Update category
router.put('/:id', updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', deleteCategory);

export default router;

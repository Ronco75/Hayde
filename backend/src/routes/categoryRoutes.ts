import { Router } from 'express';
import { createCategory, getAllCategories } from '../controllers/categoryController';

const router = Router();

//POST /api/categories - Create a new category
router.post('/', createCategory);

//GET /api/categories - Get all categories
router.get('/', getAllCategories);

export default router;

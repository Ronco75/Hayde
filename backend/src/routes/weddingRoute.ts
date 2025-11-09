import { Router } from 'express';
import { createWedding, getWedding, updateWedding, deleteWedding } from '../controllers/weddingController';
import { authenticate } from '../middleware/authMiddleware';
import { validate } from '../middleware/validation';
import { createWeddingSchema, updateWeddingSchema } from '../validators/schemas';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All wedding routes require authentication
router.use(authenticate);

/**
 * POST /api/weddings
 * Create a new wedding for the authenticated user
 * Body: { bride_name, groom_name, wedding_date, venue?, address?, budget? }
 */
router.post('/', validate(createWeddingSchema), asyncHandler(createWedding));

/**
 * GET /api/weddings
 * Get the authenticated user's wedding
 */
router.get('/', asyncHandler(getWedding));

/**
 * PUT /api/weddings
 * Update the authenticated user's wedding
 * Body: { bride_name?, groom_name?, wedding_date?, venue?, address?, budget? }
 */
router.put('/', validate(updateWeddingSchema), asyncHandler(updateWedding));

/**
 * DELETE /api/weddings
 * Delete the authenticated user's wedding
 * WARNING: This will cascade delete all related data
 */
router.delete('/', asyncHandler(deleteWedding));

export default router;
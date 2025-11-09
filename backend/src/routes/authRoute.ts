import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { registerSchema, loginSchema } from '../validators/schemas';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// ============= PUBLIC ROUTES (No authentication required) =============

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { email: string, password: string }
 */
router.post('/register', validate(registerSchema), asyncHandler(register));

/**
 * POST /api/auth/login
 * Login existing user
 * Body: { email: string, password: string }
 * Returns: { token, user }
 */
router.post('/login', validate(loginSchema), asyncHandler(login));

// ============= PROTECTED ROUTES (Authentication required) =============

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Requires: Authorization header with Bearer token
 * Returns: { user: { id, email, createdAt, wedding } }
 */
router.get('/me', authenticate, asyncHandler(getCurrentUser));

export default router;
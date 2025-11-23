import { Router } from 'express';
import { register, login, getCurrentUser, forgotPassword, resetPassword, verifyResetTokenHandler } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/schemas';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { rateLimitForgotPassword } from '../middleware/rateLimiter';

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

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 * Body: { email: string }
 * Returns: Generic success message (security: doesn't reveal if email exists)
 *
 * Security features:
 * - Rate limited: 3 requests per hour per email (via rateLimitForgotPassword middleware)
 * - Generic response to prevent email enumeration
 * - Generates secure random token
 * - Sends email with reset link
 */
router.post(
  '/forgot-password',
  rateLimitForgotPassword, // Rate limiting BEFORE validation
  validate(forgotPasswordSchema),
  asyncHandler(forgotPassword)
);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 * Body: { token: string, newPassword: string }
 * Returns: Success message
 *
 * Security features:
 * - Token verification with timing-safe comparison
 * - Token expiration check (1 hour)
 * - One-time use token (cleared after successful reset)
 * - Sends confirmation email
 */
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(resetPassword)
);

/**
 * GET /api/auth/verify-reset-token/:token
 * Verify if reset token is valid and not expired
 * Params: { token: string }
 * Returns: { valid: boolean, message, expiresAt? }
 *
 * Used by frontend to validate token before showing password reset form
 */
router.get(
  '/verify-reset-token/:token',
  asyncHandler(verifyResetTokenHandler)
);

// ============= PROTECTED ROUTES (Authentication required) =============

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Requires: Authorization header with Bearer token
 * Returns: { user: { id, email, createdAt, wedding } }
 */
router.get('/me', authenticate, asyncHandler(getCurrentUser));

export default router;
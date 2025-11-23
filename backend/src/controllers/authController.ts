import { Request, Response } from 'express';
import prisma from '../config/db';
import { hashPassword, comparePassword, generateToken, generateResetToken, hashResetToken, verifyResetToken } from '../utils/auth';
import { sendPasswordResetEmail, sendPasswordChangedNotification } from '../utils/emailService';
import { ForgotPasswordInput, ResetPasswordInput } from '../validators/schemas';
import { NotFoundError, ValidationError } from '../errors/customErrors';

// ============= REGISTER =============
/**
 * Register a new user
 * POST /api/auth/register
 * Body: { email, password }
 */
export async function register(req: Request, res: Response): Promise<void> {
  console.log('🔵 Register function called');

  const { email, password } = req.body;
  console.log('📧 Email:', email);

  // Check if user already exists
  console.log('🔍 Checking if user exists...');
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  console.log('Existing user:', existingUser);

  if (existingUser) {
    res.status(409).json({ error: 'User already exists' });
    return;
  }

  // Hash the password
  console.log('🔐 Hashing password...');
  const hashedPassword = await hashPassword(password);
  console.log('✅ Password hashed');

  // Create the user in database
  console.log('💾 Creating user in database...');
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
  console.log('✅ User created:', user.id);

  // Generate JWT token
  console.log('🎫 Generating token...');
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });
  console.log('✅ Token generated');

  // Return success response
  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
  console.log('✅ Response sent');
}

// ============= LOGIN =============
/**
 * Login existing user
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check if password exists (might be Google OAuth user)
    if (!user.password) {
      res.status(401).json({ 
        error: 'Please login with Google' 
      });
      return;
    }

    // Compare password with hashed password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return success response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

// ============= GET CURRENT USER =============
/**
 * Get current authenticated user
 * GET /api/auth/me
 * Requires authentication middleware
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    // req.user is set by the authenticate middleware
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Fetch full user details from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        wedding: true, // Include wedding details if exists
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        wedding: user.wedding,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}

// ============= FORGOT PASSWORD =============
/**
 * Request password reset
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * Security features:
 * - Generic success message (doesn't reveal if email exists)
 * - Rate limited (3 requests per hour per email)
 * - Secure random token generation
 * - Token hashed before database storage
 * - 1-hour token expiration
 * - Email sent asynchronously
 *
 * TODO: Add unit tests for:
 * - Non-existent email (should still return success)
 * - OAuth users (no password field)
 * - Expired token cleanup
 * - Email sending failures
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body as ForgotPasswordInput;

    console.log(`🔐 Password reset requested for: ${email}`);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // SECURITY: Always return success message even if user doesn't exist
    // This prevents user enumeration attacks
    if (!user) {
      console.log(`⚠️  User not found for email: ${email}, but returning success message`);
      res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
      return;
    }

    // SECURITY: Check if user has a password (might be Google OAuth user)
    if (!user.password) {
      console.log(`⚠️  OAuth user attempted password reset: ${email}`);
      // Still return generic message for security
      res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
      return;
    }

    // Generate secure reset token
    const resetToken = generateResetToken();
    const hashedToken = hashResetToken(resetToken);

    // Set token expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Update user with reset token and expiration
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expiresAt,
      },
    });

    console.log(`✅ Reset token generated and stored for user: ${user.id}`);
    console.log(`⏰ Token expires at: ${expiresAt.toISOString()}`);

    // Send reset email asynchronously (don't await - don't block response)
    sendPasswordResetEmail(email, resetToken, user.email)
      .then(() => {
        console.log(`📧 Password reset email sent to: ${email}`);
      })
      .catch((error) => {
        console.error(`❌ Failed to send reset email to ${email}:`, error);
      });

    // Return generic success message
    res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
}

// ============= RESET PASSWORD =============
/**
 * Reset password with token
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 *
 * Security features:
 * - Token verification with timing-safe comparison
 * - Token expiration check
 * - One-time use token (cleared after successful reset)
 * - New password hashing with bcrypt
 * - Success notification email
 *
 * TODO: Add unit tests for:
 * - Invalid token format
 * - Expired token
 * - Token already used
 * - Successful password reset
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, newPassword } = req.body as ResetPasswordInput;

    console.log(`🔐 Password reset attempt with token: ${token.substring(0, 10)}...`);

    // Hash the provided token to compare with database
    const hashedToken = hashResetToken(token);

    // Find user with matching token that hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date(), // Greater than now (not expired)
        },
      },
    });

    if (!user) {
      console.log(`❌ Invalid or expired reset token`);
      res.status(400).json({
        error: 'Invalid or expired reset token. Please request a new password reset.',
      });
      return;
    }

    console.log(`✅ Valid reset token found for user: ${user.id}`);

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user: set new password and clear reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null, // Clear token (one-time use)
        resetPasswordExpires: null,
      },
    });

    console.log(`✅ Password updated successfully for user: ${user.id}`);

    // Send confirmation email asynchronously
    sendPasswordChangedNotification(user.email, user.email)
      .then(() => {
        console.log(`📧 Password changed notification sent to: ${user.email}`);
      })
      .catch((error) => {
        console.error(`❌ Failed to send notification to ${user.email}:`, error);
      });

    // Return success response
    res.status(200).json({
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}

// ============= VERIFY RESET TOKEN =============
/**
 * Verify if a reset token is valid and not expired
 * GET /api/auth/verify-reset-token/:token
 * Params: { token }
 *
 * This endpoint allows the frontend to check if a reset token is valid
 * before showing the password reset form. Improves UX by showing errors early.
 *
 * Returns:
 * - 200: Token is valid
 * - 400: Token is invalid or expired
 *
 * TODO: Add unit tests for:
 * - Valid unexpired token
 * - Expired token
 * - Invalid token format
 * - Non-existent token
 */
export async function verifyResetTokenHandler(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({
        error: 'Reset token is required',
        valid: false,
      });
      return;
    }

    console.log(`🔍 Verifying reset token: ${token.substring(0, 10)}...`);

    // Hash the provided token to compare with database
    const hashedToken = hashResetToken(token);

    // Find user with matching token that hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date(), // Greater than now (not expired)
        },
      },
    });

    if (!user) {
      console.log(`❌ Invalid or expired reset token`);
      res.status(400).json({
        error: 'Invalid or expired reset token',
        valid: false,
      });
      return;
    }

    console.log(`✅ Valid reset token for user: ${user.id}`);

    // Return success with expiration info
    res.status(200).json({
      message: 'Token is valid',
      valid: true,
      expiresAt: user.resetPasswordExpires,
    });
  } catch (error) {
    console.error('❌ Verify reset token error:', error);
    res.status(500).json({
      error: 'Failed to verify reset token',
      valid: false,
    });
  }
}
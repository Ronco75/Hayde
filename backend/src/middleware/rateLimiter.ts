/**
 * Rate Limiting Middleware for Password Reset
 *
 * This middleware prevents abuse of the forgot password endpoint by limiting
 * the number of reset requests per email address within a time window.
 *
 * Security benefits:
 * - Prevents email flooding attacks
 * - Mitigates brute force enumeration attempts
 * - Protects against denial of service on email service
 * - Limits spam and abuse
 *
 * Implementation:
 * - In-memory storage (suitable for single-server deployments)
 * - For production with multiple servers, consider Redis
 * - Automatic cleanup of expired entries
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  firstAttempt: Date;
  resetAt: Date;
}

// In-memory store for rate limiting
// Key: email address (lowercase)
// Value: { count, firstAttempt, resetAt }
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_REQUESTS = 3; // Maximum requests per time window
const TIME_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // Cleanup every 15 minutes

/**
 * Cleanup expired rate limit entries
 *
 * This function removes entries that are past their reset time to prevent
 * memory leaks in long-running applications.
 */
function cleanupExpiredEntries(): void {
  const now = new Date();
  let cleanedCount = 0;

  for (const [email, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(email);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired rate limit entries`);
  }
}

// Start periodic cleanup
setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL_MS);

/**
 * Rate limiting middleware for forgot password endpoint
 *
 * Limits password reset requests to MAX_REQUESTS per TIME_WINDOW_MS per email.
 *
 * How it works:
 * 1. Extract email from request body
 * 2. Check if email has existing rate limit entry
 * 3. If entry expired, reset counter
 * 4. If limit reached, return 429 Too Many Requests
 * 5. Otherwise, increment counter and allow request
 *
 * @param req - Express request object (expects req.body.email)
 * @param res - Express response object
 * @param next - Express next function
 *
 * Response codes:
 * - 400: Email not provided in request body
 * - 429: Rate limit exceeded (too many requests)
 * - Continues to next middleware if within limit
 *
 * @example
 * // In route file:
 * router.post('/forgot-password',
 *   rateLimitForgotPassword,
 *   validate(forgotPasswordSchema),
 *   asyncHandler(forgotPassword)
 * );
 */
export const rateLimitForgotPassword = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const email = req.body?.email?.toLowerCase().trim();

  // Email validation (basic check, detailed validation in Zod schema)
  if (!email) {
    res.status(400).json({
      error: 'Email is required',
      statusCode: 400,
    });
    return;
  }

  const now = new Date();
  const entry = rateLimitStore.get(email);

  // Case 1: No existing entry - first request
  if (!entry) {
    rateLimitStore.set(email, {
      count: 1,
      firstAttempt: now,
      resetAt: new Date(now.getTime() + TIME_WINDOW_MS),
    });
    next();
    return;
  }

  // Case 2: Entry exists but time window expired - reset counter
  if (entry.resetAt < now) {
    rateLimitStore.set(email, {
      count: 1,
      firstAttempt: now,
      resetAt: new Date(now.getTime() + TIME_WINDOW_MS),
    });
    next();
    return;
  }

  // Case 3: Entry exists and within time window
  if (entry.count >= MAX_REQUESTS) {
    // Rate limit exceeded
    const retryAfterSeconds = Math.ceil((entry.resetAt.getTime() - now.getTime()) / 1000);
    const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);

    console.warn(`⚠️  Rate limit exceeded for email: ${email} (${entry.count} attempts)`);

    res.status(429).json({
      error: `יותר מדי ניסיונות. אנא נסה שוב בעוד ${retryAfterMinutes} דקות`,
      statusCode: 429,
      retryAfter: retryAfterSeconds,
      details: {
        maxRequests: MAX_REQUESTS,
        timeWindowMinutes: TIME_WINDOW_MS / (60 * 1000),
        remainingTime: `${retryAfterMinutes} minutes`,
      },
    });
    return;
  }

  // Case 4: Within limit - increment counter and allow
  entry.count += 1;
  rateLimitStore.set(email, entry);
  next();
};

/**
 * Get current rate limit status for an email (for debugging/testing)
 *
 * This function is useful for testing and debugging rate limiting behavior.
 * Can be exposed via a protected admin endpoint if needed.
 *
 * @param email - Email address to check
 * @returns Rate limit entry or null if no entry exists
 */
export function getRateLimitStatus(email: string): RateLimitEntry | null {
  const normalizedEmail = email.toLowerCase().trim();
  return rateLimitStore.get(normalizedEmail) || null;
}

/**
 * Reset rate limit for an email (for testing/admin purposes)
 *
 * This function allows manual reset of rate limits, useful for:
 * - Testing scenarios
 * - Admin intervention for legitimate users
 * - Clearing rate limits after resolving issues
 *
 * @param email - Email address to reset
 * @returns true if entry was found and removed, false otherwise
 */
export function resetRateLimit(email: string): boolean {
  const normalizedEmail = email.toLowerCase().trim();
  return rateLimitStore.delete(normalizedEmail);
}

/**
 * Get total number of rate-limited emails (for monitoring)
 *
 * @returns Number of emails currently being rate limited
 */
export function getRateLimitStoreSize(): number {
  return rateLimitStore.size;
}

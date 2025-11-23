import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
    userId: number;
    email: string;
}

// ============= PASSWORD HASHING =============

/**
 * Hash a plain text password using bcrypt
 * @param password - The plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password from user
 * @param hashedPassword - Hashed password from database
 * @returns true if passwords match, false otherwise
 */
export async function comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// ============= JWT TOKEN GENERATION =============
/**
 * Generate a JWT token for a user
 * @param payload - User data to encode in the token
 * @returns JWT token string
 */
export function generateToken(payload: JwtPayload): string {
    return jwt.sign(
      { userId: payload.userId, email: payload.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as StringValue | number }
    );
  }
  
  /**
   * Verify and decode a JWT token
   * @param token - JWT token string
   * @returns Decoded payload if valid, null if invalid
   */
  export function verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

// ============= PASSWORD RESET TOKEN GENERATION =============

/**
 * Generate a secure random reset token
 *
 * This function creates a cryptographically secure random token for password reset.
 * The token is URL-safe and suitable for use in email links.
 *
 * Security notes:
 * - Uses crypto.randomBytes for cryptographic randomness
 * - 32 bytes = 256 bits of entropy (very secure)
 * - Converted to hex format for URL compatibility
 * - Token is 64 characters long (32 bytes * 2 hex chars per byte)
 *
 * @returns A secure random token string (64 characters hex)
 *
 * @example
 * const token = generateResetToken();
 * // Returns: "a3f2c9e1b4d7f6e8c2a5b9d3f1e7c4a8b2d6f9e3c7a1b5d8e2f6c9a4b7d1e5f3"
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a reset token for secure database storage
 *
 * This function hashes the reset token before storing it in the database.
 * The hashed version is stored, while the unhashed version is sent via email.
 *
 * Security rationale:
 * - If database is compromised, tokens cannot be used directly
 * - Similar to password hashing best practice
 * - SHA256 is sufficient for token hashing (doesn't need bcrypt's slow hashing)
 * - One-way hash: original token cannot be recovered from hash
 *
 * @param token - The plain reset token to hash
 * @returns SHA256 hash of the token (64 characters hex)
 *
 * @example
 * const token = generateResetToken();
 * const hashedToken = hashResetToken(token);
 * // Store hashedToken in database, send token via email
 */
export function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a reset token matches the stored hash
 *
 * This function compares a user-provided token with the hashed version stored
 * in the database by hashing the provided token and comparing.
 *
 * Security notes:
 * - Uses constant-time comparison to prevent timing attacks
 * - Both tokens must be same length for crypto.timingSafeEqual
 * - Returns false if lengths don't match (invalid token format)
 *
 * @param token - The plain token from the reset URL
 * @param hashedToken - The hashed token from the database
 * @returns true if tokens match, false otherwise
 *
 * @example
 * // User clicks reset link with token
 * const isValid = verifyResetToken(urlToken, user.resetPasswordToken);
 * if (isValid && user.resetPasswordExpires > new Date()) {
 *   // Token is valid and not expired - allow password reset
 * }
 */
export function verifyResetToken(token: string, hashedToken: string): boolean {
  const hash = hashResetToken(token);

  // Use timing-safe comparison to prevent timing attacks
  // Both buffers must be same length, so check first
  if (hash.length !== hashedToken.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(hashedToken, 'hex')
    );
  } catch (error) {
    // If buffers are invalid, return false
    return false;
  }
}
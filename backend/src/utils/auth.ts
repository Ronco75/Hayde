import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import bcrypt from 'bcryptjs';

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
import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/auth';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT
 * Checks for valid JWT token in Authorization header
 * If valid, adds user info to request object
 * If invalid, returns 401 Unauthorized
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Step 1: Get the token from Authorization header
    // Expected format: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Step 2: Extract the token (remove "Bearer " prefix)
    const token = authHeader.substring(7); // "Bearer ".length = 7

    // Step 3: Verify the token
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Step 4: Add user info to request object
    // Now any controller can access req.user to know who made the request!
    req.user = payload;

    // Step 5: Continue to the next middleware/controller
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}
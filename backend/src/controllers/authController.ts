import { Request, Response } from 'express';
import prisma from '../config/db';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

// ============= REGISTER =============
/**
 * Register a new user
 * POST /api/auth/register
 * Body: { email, password }
 */
export async function register(req: Request, res: Response): Promise<void> {
  console.log('🔵 Register function called');
  console.log('Request body:', req.body);

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
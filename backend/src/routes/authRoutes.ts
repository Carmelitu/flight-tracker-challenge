import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthService } from '../services/authService';
import { authMiddleware } from '../middleware/authMiddleware';
import { LoginRequest, AuthResponse } from '../types/auth';

const router = Router();

// Cookie options for tokens
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // Set to true in production with HTTPS
  sameSite: 'lax' as const,
  path: '/'
};

/**
 * POST /auth/login
 * Authenticate user and set JWT tokens in cookies
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { username, password }: LoginRequest = req.body;

  // Validate input
  if (!username || !password) {
    res.status(400).json({ 
      error: 'Username and password are required' 
    });
    return;
  }

  // Validate credentials
  const user = AuthService.validateUser(username, password);
  
  if (!user) {
    res.status(401).json({ 
      error: 'Invalid username or password' 
    });
    return;
  }

  // Generate tokens
  const accessToken = AuthService.generateAccessToken(user.username);
  const refreshToken = AuthService.generateRefreshToken(user.username);

  // Set tokens in HTTP-only cookies
  res.cookie('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Return success response
  const response: AuthResponse = {
    user: { username: user.username },
    message: 'Login successful'
  };

  res.json(response);
}));

/**
 * POST /auth/logout
 * Clear authentication cookies
 */
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  // Clear both cookies
  res.clearCookie('accessToken', COOKIE_OPTIONS);
  res.clearCookie('refreshToken', COOKIE_OPTIONS);

  res.json({ 
    message: 'Logout successful' 
  });
}));

/**
 * GET /auth/me
 * Get current authenticated user info
 */
router.get('/me', authMiddleware, asyncHandler(async (req: any, res: Response) => {
  // User info is attached by authMiddleware
  const user = req.user;

  res.json({
    user: {
      username: user.username
    }
  });
}));

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ 
      error: 'Refresh token not provided' 
    });
    return;
  }

  // Verify refresh token
  const decoded = AuthService.verifyRefreshToken(refreshToken);

  if (!decoded) {
    res.status(401).json({ 
      error: 'Invalid or expired refresh token' 
    });
    return;
  }

  // Verify user still exists
  const user = AuthService.getUserByUsername(decoded.username);
  
  if (!user) {
    res.status(401).json({ 
      error: 'User not found' 
    });
    return;
  }

  // Generate new access token
  const newAccessToken = AuthService.generateAccessToken(user.username);

  // Set new access token in cookie
  res.cookie('accessToken', newAccessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.json({ 
    message: 'Token refreshed successfully' 
  });
}));

export default router;
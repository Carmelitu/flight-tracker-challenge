import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthService } from '../services/authService';

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
  };
}

/**
 * Middleware to validate access token from cookies
 * Protects routes that require authentication
 */
export const authMiddleware = asyncHandler(async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  // Get access token from cookies
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    res.status(401).json({ 
      error: 'Access denied. No token provided.' 
    });
    return;
  }

  // Verify the access token
  const decoded = AuthService.verifyAccessToken(accessToken);

  if (!decoded) {
    res.status(401).json({ 
      error: 'Access denied. Invalid or expired token.' 
    });
    return;
  }

  // Get user info and attach to request
  const user = AuthService.getUserByUsername(decoded.username);
  
  if (!user) {
    res.status(401).json({ 
      error: 'Access denied. User not found.' 
    });
    return;
  }

  req.user = user;
  next();
});

/**
 * Optional auth middleware - doesn't fail if no token
 * Useful for routes that work with or without auth
 */
export const optionalAuthMiddleware = asyncHandler(async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  const accessToken = req.cookies?.accessToken;

  if (accessToken) {
    const decoded = AuthService.verifyAccessToken(accessToken);
    
    if (decoded) {
      const user = AuthService.getUserByUsername(decoded.username);
      if (user) {
        req.user = user;
      }
    }
  }

  next();
});
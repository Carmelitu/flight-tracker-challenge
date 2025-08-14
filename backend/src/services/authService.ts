import jwt from 'jsonwebtoken';
import { User, TokenPayload } from '../types/auth';

// Hardcoded secret for simplicity (in production, use environment variable)
const JWT_SECRET = 'your-secret-key-change-in-production';

// In-memory user store (single admin user)
const USERS: User[] = [
  {
    username: 'admin',
    password: 'admin'
  }
];

export class AuthService {
  /**
   * Validate user credentials
   */
  static validateUser(username: string, password: string): User | null {
    const user = USERS.find(u => u.username === username && u.password === password);
    return user || null;
  }

  /**
   * Generate access token (15 minutes)
   */
  static generateAccessToken(username: string): string {
    const payload: TokenPayload = {
      username,
      type: 'access'
    };
    
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: '15m',
      issuer: 'flight-tracker-api'
    });
  }

  /**
   * Generate refresh token (7 days)
   */
  static generateRefreshToken(username: string): string {
    const payload: TokenPayload = {
      username,
      type: 'refresh'
    };
    
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: '7d',
      issuer: 'flight-tracker-api'
    });
  }

  /**
   * Verify and decode access token
   */
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      
      // Ensure it's an access token
      if (decoded.type !== 'access') {
        return null;
      }
      
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify and decode refresh token
   */
  static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      
      // Ensure it's a refresh token
      if (decoded.type !== 'refresh') {
        return null;
      }
      
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user by username (excluding password)
   */
  static getUserByUsername(username: string): { username: string } | null {
    const user = USERS.find(u => u.username === username);
    if (!user) {
      return null;
    }
    
    return { username: user.username };
  }
}
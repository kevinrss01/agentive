import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { UserData } from '../types/auth.types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface JWTAuthenticatedRequest extends Request {
  user?: UserData;
}

/**
 * JWT authentication middleware
 * - Requires a valid Bearer JWT token in Authorization header
 * - Returns 401 error if no token or invalid JWT token
 * - Adds user data to request object if authentication succeeds
 * - Use this for routes that require JWT authentication
 */
export const authenticateJWT = (
  req: JWTAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.error('JWT Auth Error: No token provided');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    console.log('JWT Auth Debug: Token length:', token.length);
    console.log('JWT Auth Debug: Token starts with:', token.substring(0, 20) + '...');
    console.log('JWT Auth Debug: JWT Secret exists:', !!config.jwt.secret);

    const decoded = jwt.verify(token, config.jwt.secret) as { user: UserData };

    if (!decoded.user) {
      console.error('JWT Auth Error: Invalid JWT token - no user in payload');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    console.log('JWT Auth Success: User authenticated:', decoded.user.email);

    // Add user info to request
    req.user = decoded.user;

    next();
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT authentication error (JsonWebTokenError):', error.message);
      console.error('Error name:', error.name);
    } else {
      console.error('JWT authentication middleware error:', error);
    }
    res.status(401).json({ error: 'Unauthorized' });
  }
};

/**
 * Strict authentication middleware
 * - Requires a valid Bearer token in Authorization header
 * - Returns 401 error if no token or invalid token
 * - Adds user data to request object if authentication succeeds
 * - Use this for routes that require authentication
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const { data: userData, error } = await supabase.auth.getUser(token);

    if (error || !userData.user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Add user info to request with proper type checking
    const user = userData.user;
    req.user = {
      id: user.id,
      email: user.email || '',
      name: (user.user_metadata as { full_name?: string })?.full_name || '',
    };

    next();
  } catch (error: unknown) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Optional authentication middleware
 * - Accepts requests with or without Bearer token
 * - If valid token provided, adds user data to request object
 * - If no token or invalid token, continues without user data
 * - Use this for routes that work for both authenticated and anonymous users
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { data: userData, error } = await supabase.auth.getUser(token);

      if (!error && userData.user) {
        const user = userData.user;
        req.user = {
          id: user.id,
          email: user.email || '',
          name: (user.user_metadata as { full_name?: string })?.full_name || '',
        };
      }
    }

    next();
  } catch (error: unknown) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

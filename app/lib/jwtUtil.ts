/**
 * JWT Utility Module
 * 
 * This module provides comprehensive JWT (JSON Web Token) functionality for the Carobar application.
 * It handles token creation, verification, and payload management in a centralized way.
 */

import jwt from 'jsonwebtoken';
import { logError, logInfo } from '@/app/lib/logger';

// Environment variables should be loaded at the application level

/**
 * Standard structure for JWT payload in the Carobar application
 * This ensures consistency across all token operations. 
 * roleId should be one of the values defined in the Role enum. roleName is description of the role
 */
export interface JWTPayload {
  userId: string;
  userName: string;
  email: string;
  companyId: string;
  companyName: string;
  roleId: string;
  roleName: string;
  iat?: number; // Issued at timestamp (added by JWT)
  exp?: number; // Expiration timestamp (added by JWT)
}

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1d';

// Ensure the JWT_SECRET is set in the environment
if (!JWT_SECRET) {
  const errorMessage = 'JWT_SECRET environment variable is not set. This is a critical security issue.';
  logError(errorMessage);
  throw new Error(errorMessage);
}

/**
 * Creates a signed JWT token with the provided payload
 * 
 * @param payload - The data to be encoded in the token
 * @param expiresIn - Token expiration time (defaults to environment setting or 1 day)
 * @returns The signed JWT token string
 */
export function createToken(payload: JWTPayload, expiresIn: string | number = TOKEN_EXPIRY): string {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    // Ensure expiresIn is a valid string or number
    const token = jwt.sign(payload, JWT_SECRET as string, { expiresIn: expiresIn as string });
    
    logInfo(`Token created for user: ${payload.userId} (${payload.userName})`);
    return token;
  } catch (error) {
    logError(`Token creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Verifies a JWT token and returns the decoded payload if valid
 * 
 * @param token - The JWT token string to verify
 * @returns The decoded token payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);
    
    // Handle string decoded values (should never happen with our implementation)
    if (typeof decoded === 'string') {
      logError('Token decoded to string instead of object - implementation error');
      return null;
    }    
    // Return the decoded payload
    return decoded as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logInfo('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logError(`JWT verification error: ${error.message}`);
    } else {
      logError(`Unexpected token error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    return null;
  }
}

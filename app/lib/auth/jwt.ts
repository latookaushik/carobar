/**
 * JWT Utilities - Server Side
 *
 * Core JWT operations for authentication on the server side.
 * This module handles token creation, verification, and payload management.
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { logError, logInfo } from '@/app/lib/logging';

// Define a custom type for valid expiration strings (matching jsonwebtoken's expected format)
type ExpiresInString = `${number}${'d' | 'h' | 'm' | 's'}`; // e.g., "1d", "2h", "30m", "60s"

/**
 * Standard structure for JWT payload in the Carobar application
 */
export interface JWTPayload {
  userId: string;
  userName: string;
  email: string;
  companyId: string;
  companyName: string;
  roleId: string;
  roleName: string;
  tokenType?: 'access' | 'refresh'; // Type of token
  iat?: number; // Issued at timestamp (added by JWT)
  exp?: number; // Expiration timestamp (added by JWT)
}

export interface RefreshTokenPayload {
  userId: string;
  companyId: string;
  tokenType: 'refresh';
  iat?: number;
  exp?: number;
}

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY: ExpiresInString = (process.env.TOKEN_EXPIRY || '1h') as ExpiresInString;
const REFRESH_TOKEN_EXPIRY: ExpiresInString = '7d';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only throw error about missing JWT_SECRET on the server
// In browser context, this is expected since env vars aren't available
if (!JWT_SECRET && !isBrowser) {
  const errorMessage =
    'JWT_SECRET environment variable is not set. This is a critical security issue.';
  logError(errorMessage);
  throw new Error(errorMessage);
}

/**
 * Validates if a string is in the correct format for expiresIn (e.g., '1d', '2h', '30m', '60s')
 */
function isValidExpiresInString(value: string): value is ExpiresInString {
  return /^\d+[dhms]$/.test(value); // Matches '1d', '2h', '30m', '60s', etc.
}

/**
 * Creates a signed JWT token with the provided payload
 */
export function createToken(
  payload: JWTPayload,
  expiresIn: number | ExpiresInString = TOKEN_EXPIRY
): string {
  try {
    // In browser, return a dummy token (real auth happens server-side)
    if (isBrowser) {
      logInfo('Running in browser - returning mock token');
      return 'browser-mock-token';
    }

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    let finalExpiresIn: number | ExpiresInString;

    if (typeof expiresIn === 'number') {
      finalExpiresIn = expiresIn; // Use as-is for seconds
    } else if (typeof expiresIn === 'string') {
      if (!isValidExpiresInString(expiresIn)) {
        throw new Error(
          `Invalid expiresIn format: ${expiresIn}. Use format like '1d', '2h', '30m', or '60s'.`
        );
      }
      finalExpiresIn = expiresIn as ExpiresInString;
    } else {
      finalExpiresIn = TOKEN_EXPIRY;
    }

    const options: SignOptions = {
      expiresIn: finalExpiresIn,
    };

    // Add token type if not specified
    const finalPayload = {
      ...payload,
      tokenType: payload.tokenType || 'access',
    };

    const token = jwt.sign(finalPayload, JWT_SECRET as string, options);
    logInfo(`Token created for user: ${finalPayload.userId} (${finalPayload.tokenType} token)`);
    return token;
  } catch (error) {
    logError(`Token creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Creates a refresh token for the specified user
 */
export function createRefreshToken(userId: string, companyId: string): string {
  const refreshPayload: RefreshTokenPayload = {
    userId,
    companyId,
    tokenType: 'refresh',
  };

  return jwt.sign(refreshPayload, JWT_SECRET as string, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Verifies a JWT token and returns the decoded payload if valid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    // In browser, return a mock payload instead of trying to verify
    if (isBrowser) {
      logInfo('Running in browser - returning mock payload for token verification');
      return {
        userId: 'mock-user-id',
        userName: 'Mock User',
        email: 'mock@example.com',
        companyId: 'mock-company-id',
        companyName: 'Mock Company',
        roleId: 'CU',
        roleName: 'Company User',
        tokenType: 'access',
      };
    }

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
      logError(
        `Unexpected token error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
    return null;
  }
}

/**
 * Refreshes an access token using a valid refresh token
 * This is used server-side in the /api/refreshToken endpoint
 */
export async function refreshAccessTokenFromRefreshToken(
  refreshToken: string
): Promise<string | null> {
  try {
    // In browser, return a mock token
    if (isBrowser) {
      logInfo('Running in browser - returning mock token for refreshAccessTokenFromRefreshToken');
      return 'browser-mock-refreshed-token';
    }

    // Verify the refresh token
    const decoded = verifyToken(refreshToken);

    if (!decoded || decoded.tokenType !== 'refresh') {
      logError('Invalid refresh token');
      return null;
    }

    // Create a new access token with the information from the refresh token
    const accessPayload: JWTPayload = {
      userId: decoded.userId,
      userName: decoded.userName || 'User',
      email: decoded.email || '',
      companyId: decoded.companyId,
      companyName: decoded.companyName || 'Company',
      roleId: decoded.roleId || 'CU',
      roleName: decoded.roleName || 'Company User',
      tokenType: 'access',
    };

    // Create a new access token
    return createToken(accessPayload);
  } catch (error) {
    logError(`Error refreshing token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

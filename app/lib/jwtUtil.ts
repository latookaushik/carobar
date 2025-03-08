/**
 * JWT Utility Module
 *
 * This module provides comprehensive JWT (JSON Web Token) functionality for the Carobar application.
 * It handles token creation, verification, and payload management in a centralized way.
 */

import jwt, { SignOptions } from 'jsonwebtoken'; // Import SignOptions for type safety
import { logError, logInfo } from '@/app/lib/logger';

// Define a custom type for valid expiration strings (matching jsonwebtoken's expected format)
type ExpiresInString = `${number}${'d' | 'h' | 'm' | 's'}`; // e.g., "1d", "2h", "30m", "60s"

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
const TOKEN_EXPIRY: ExpiresInString = (process.env.TOKEN_EXPIRY || '1h') as ExpiresInString; // Default to 1 hour for access tokens
const REFRESH_TOKEN_EXPIRY: ExpiresInString = '7d'; // Refresh tokens last 7 days

// Ensure the JWT_SECRET is set in the environment
if (!JWT_SECRET) {
  const errorMessage =
    'JWT_SECRET environment variable is not set. This is a critical security issue.';
  logError(errorMessage);
  throw new Error(errorMessage);
}

/**
 * Validates if a string is in the correct format for expiresIn (e.g., '1d', '2h', '30m', '60s')
 * @param value The string to validate
 * @returns boolean indicating if the format is valid
 */
function isValidExpiresInString(value: string): value is ExpiresInString {
  return /^\d+[dhms]$/.test(value); // Matches '1d', '2h', '30m', '60s', etc.
}

/**
 * Creates a signed JWT token with the provided payload
 *
 * @param payload - The data to be encoded in the token
 * @param expiresIn - Token expiration time (defaults to environment setting or 1 day)
 * @returns The signed JWT token string
 */
export function createToken(
  payload: JWTPayload,
  expiresIn: number | ExpiresInString = TOKEN_EXPIRY
): string {
  try {
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
      finalExpiresIn = expiresIn as ExpiresInString; // Explicit cast to ensure type safety
    } else {
      // Default to TOKEN_EXPIRY if expiresIn is invalid or undefined (already validated as ExpiresInString)
      finalExpiresIn = TOKEN_EXPIRY;
    }

    const options: SignOptions = {
      expiresIn: finalExpiresIn, // Type-safe assignment (number | ExpiresInString matches SignOptions)
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
 * Verifies a JWT token and returns the decoded payload if valid
 *
 * @param token - The JWT token string to verify
 * @returns The decoded token payload or null if invalid
 */
/**
 * Creates a refresh token for the specified user
 *
 * @param userId - The user ID
 * @param companyId - The company ID
 * @returns The signed refresh token string
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
      logError(
        `Unexpected token error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
    return null;
  }
}

/**
 * Refreshes an access token using a valid refresh token
 *
 * @param refreshToken - The refresh token to use
 * @returns A new access token or null if the refresh token is invalid
 */
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    // Verify the refresh token
    const decoded = verifyToken(refreshToken);

    if (!decoded || decoded.tokenType !== 'refresh') {
      logError('Invalid refresh token');
      return null;
    }

    // Get user information from the database using the refresh token payload
    // This is a simplified example - in a real application, you would fetch the user from the database
    // and create a new access token with the full user information

    // For now, we'll just create a minimal access token with the information from the refresh token
    const accessPayload: JWTPayload = {
      userId: decoded.userId,
      userName: decoded.userName || 'User', // Fallback value
      email: decoded.email || '',
      companyId: decoded.companyId,
      companyName: decoded.companyName || 'Company', // Fallback value
      roleId: decoded.roleId || 'CU', // Default to regular user
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

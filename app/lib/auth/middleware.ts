/**
 * Authentication Middleware
 *
 * This module provides middleware functions for handling authentication and authorization
 * in a consistent way across all API routes in the Carobar application.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/app/lib/auth/jwt';
import { createErrorResponse, HttpStatus } from '@/app/lib/errors';

import { logInfo, logError, logDebug } from '@/app/lib/logging';

/**
 * Extend the NextRequest type to include user information
 * This makes TypeScript aware of the user property we attach to requests
 */
declare module 'next/server' {
  interface NextRequest {
    user?: JWTPayload;
  }
}

/**
 * Options for the auth middleware
 */
export interface AuthOptions {
  /** Roles allowed to access the route (empty means any authenticated user) */
  requiredRoles?: string[];

  /** Whether to skip token verification (for public routes) */
  public?: boolean;
}

/**
 * Authentication middleware for Next.js API routes
 *
 * This Higher-Order Function wraps route handlers with authentication logic.
 * It extracts and verifies the JWT token, checks role permissions, and
 * attaches the user information to the request.
 *
 * @param handler - The original route handler function
 * @param options - Authentication options (roles, public access)
 * @returns A new handler function with authentication checks
 */
export function withAuth(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const { requiredRoles = [], public: isPublic = false } = options;
    const requestPath = req.nextUrl.pathname;

    logDebug(`Processing request to ${requestPath} with auth middleware`);

    // Skip authentication for public routes
    if (isPublic) {
      logDebug(`Public route accessed: ${requestPath}`);
      return handler(req);
    }

    // Extract token from cookies
    const token = req.cookies.get('token')?.value;

    if (!token) {
      logError(`Authentication failed: No token provided (${requestPath})`);
      return createErrorResponse('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    logInfo(`Token: ${token}`);
    const user: JWTPayload | null = await verifyToken(token);

    if (!user) {
      logError(`Authentication failed: Invalid token (${requestPath})`);
      return createErrorResponse('Invalid or expired token', HttpStatus.UNAUTHORIZED);
    }

    // Check role permissions if specified
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.roleId)) {
      logError(
        `Authorization failed: User ${user.userName} does not have required role (${requiredRoles.join(
          ', '
        )}) for ${requestPath}`
      );
      return createErrorResponse(
        'You do not have permission to access this resource',
        HttpStatus.FORBIDDEN
      );
    }

    // Attach user information to the request for use in the handler
    (req as NextRequest).user = user;

    logInfo(`User authenticated: ${user.userName} (${user.roleId}) accessing ${requestPath}`);

    // Call the original handler with the modified request
    return handler(req);
  };
}

/**
 * Middleware specifically for routes that require Super Admin access
 *
 * @param handler - The original route handler function
 * @returns A handler function with Super Admin authentication check
 */
export function withSuperAdmin(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withAuth(handler, { requiredRoles: ['SA'] });
}

/**
 * Middleware specifically for routes that require Company Admin access
 *
 * @param handler - The original route handler function
 * @returns A handler function with Company Admin authentication check
 */
export function withCompanyAdmin(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withAuth(handler, { requiredRoles: ['SA', 'CA'] });
}

/**
 * Middleware specifically for routes that require any authenticated user
 *
 * @param handler - The original route handler function
 * @returns A handler function with basic authentication check
 */
export function withUser(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withAuth(handler, {});
}

/**
 * Middleware for public routes (no authentication required)
 *
 * @param handler - The original route handler function
 * @returns A handler function without authentication check
 */
export function withPublic(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withAuth(handler, { public: true });
}

/**
 * Extract user information from a request
 * Helper function to safely get the authenticated user
 *
 * @param req - The Next.js request object
 * @returns The user object or null if not authenticated
 */
export function getAuthUser(req: NextRequest): JWTPayload | null {
  return (req as NextRequest).user || null;
}

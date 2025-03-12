/**
 * Authentication Module
 *
 * This module provides a centralized entry point for all authentication-related
 * functionality in the Carobar application.
 *
 * It re-exports everything from:
 * - jwt.ts: Server-side JWT utilities
 * - client.ts: Client-side authentication utilities
 * - middleware.ts: Authentication middleware for API routes
 */

// Import JWTPayload for type checking
import { JWTPayload } from './jwt';

// Re-export all JWT utilities
export * from './jwt';

// Re-export all client-side auth utilities
export * from './client';

// Re-export all middleware functions
export * from './middleware';

/**
 * A convenience function to check if a user has a specific role
 *
 * @param user The user object from the JWT payload
 * @param role The role to check
 * @returns true if the user has the specified role
 */
export function hasRole(user: JWTPayload | null | undefined, role: string): boolean {
  if (!user || !user.roleId) return false;
  return user.roleId === role;
}

/**
 * A convenience function to check if a user has any of the specified roles
 *
 * @param user The user object from the JWT payload
 * @param roles Array of roles to check
 * @returns true if the user has any of the specified roles
 */
export function hasAnyRole(user: JWTPayload | null | undefined, roles: string[]): boolean {
  if (!user || !user.roleId) return false;
  return roles.includes(user.roleId);
}

/**
 * Role constants to use for role-based access control
 */
export const Roles = {
  SUPER_ADMIN: 'SA',
  COMPANY_ADMIN: 'CA',
  COMPANY_USER: 'CU',
  PUBLIC: 'PUBLIC',
};

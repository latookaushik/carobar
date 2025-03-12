/**
 * Role Permissions
 *
 * This module provides functions for checking user roles and permissions
 * in the Carobar application.
 */

import { AuthUser } from '@/app/contexts/AuthContext';
import { Role, RoleType } from './types';

/**
 * Checks if a user has any of the specified roles
 *
 * @param user - The authenticated user (or null if not authenticated)
 * @param requiredRoles - Array of roles to check against
 * @returns True if the user has any of the required roles, false otherwise
 */
export function hasRole(user: AuthUser | null, requiredRoles: RoleType[]): boolean {
  // If no roles are required, allow access
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // If no user, deny access
  if (!user) {
    return false;
  }

  // Check if the user's role is in the required roles
  return requiredRoles.includes(user.roleId as RoleType);
}

/**
 * Checks if a user is an admin
 *
 * @param user - The authenticated user (or null if not authenticated)
 * @returns True if the user is an admin, false otherwise
 */
export function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.roleId === Role.ADMIN;
}

/**
 * Checks if a user is a company manager
 *
 * @param user - The authenticated user (or null if not authenticated)
 * @returns True if the user is a company manager, false otherwise
 */
export function isCompanyManager(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.roleId === Role.MANAGER;
}

/**
 * Checks if a user belongs to the specified company
 *
 * @param user - The authenticated user (or null if not authenticated)
 * @param companyId - The company ID to check
 * @returns True if the user belongs to the company, false otherwise
 */
export function belongsToCompany(user: AuthUser | null, companyId: string): boolean {
  if (!user) return false;
  return user.companyId === companyId;
}

/**
 * Role Utilities
 *
 * This module provides utilities for role-based access control throughout the application.
 * It centralizes role definitions and permission checking to ensure consistent access control.
 */

import { JWTPayload } from '@/app/lib/jwtUtil';

/** All possible role types in the system */
export type RoleType = 'SA' | 'CA' | 'CU' | 'PUBLIC';

/**
 * Role definitions with their full names and capabilities
 */
export const ROLES = {
  /** Super Admin - highest level access to all system features */
  SA: {
    name: 'ADMIN',
    description: 'Full access to all system features, including admin functions',
    canManageUsers: true,
    canManageCompanies: true,
    canAccessAllCompanyData: true,
  },

  /** Company Admin - manages a specific company and its users */
  CA: {
    name: 'COMPANY MANAGER',
    description: 'Company administrator with elevated privileges within their company',
    canManageCompanyUsers: true,
    canAccessAllCompanyData: true,
  },

  /** Company User - regular user within a company */
  CU: {
    name: 'COMPANY STAFF',
    description: 'Standard company staff with access to common features',
    canAccessCompanyData: true,
  },

  /** Public - unauthenticated user */
  PUBLIC: {
    name: 'PUBLIC',
    description: 'Unauthenticated user with limited access',
  },
};

/**
 * Checks if the user has one of the specified roles
 *
 * @param user - User from JWT payload
 * @param allowedRoles - Array of allowed roles
 * @returns true if user has one of the allowed roles
 */
export function hasRole(user: JWTPayload | null, allowedRoles: RoleType[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.roleId as RoleType);
}

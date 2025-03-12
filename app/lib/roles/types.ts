/**
 * Role Type Definitions
 *
 * This module provides type definitions for roles in the Carobar application.
 * It centralizes all role-related types to ensure consistency across the application.
 */

/**
 * All possible role types in the system
 */
export type RoleType = 'SA' | 'CA' | 'CU' | 'PUBLIC';

/**
 * Enum for role values for use with TypeScript's type system
 */
export enum Role {
  ADMIN = 'SA', // Super Admin (Carobar admins)
  MANAGER = 'CA', // Company Admin (Elevated role for company in charge)
  STAFF = 'CU', // Standard Company User
}

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
 * Role combinations for permissions checking.
 * These are commonly used for UI components and API routes to specify which roles can access a feature.
 */
export const RoleSets = {
  // All authenticated users
  allRoles: [Role.ADMIN, Role.MANAGER, Role.STAFF],

  // Admin users only
  adminOnly: [Role.ADMIN],

  // Admin and company managers
  management: [Role.ADMIN, Role.MANAGER],

  // Company managers and staff
  companyUsers: [Role.MANAGER, Role.STAFF],

  // All users including public
  public: [Role.ADMIN, Role.MANAGER, Role.STAFF, 'PUBLIC' as RoleType],
};

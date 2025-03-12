/**
 * Role Constants
 *
 * This file defines constants related to user roles in the application.
 */

import { RoleType, Role, RoleSets } from './types';

/**
 * CheckRoles contains predefined role groups that can be used for permission checks
 */
export const CheckRoles = {
  /**
   * Allows access to all users regardless of role
   */
  allRoles: [] as RoleType[],

  /**
   * Only allows access to users with admin role
   */
  adminOnly: [Role.ADMIN] as RoleType[],

  /**
   * Only allows access to users with management roles
   */
  managementRoles: [Role.ADMIN, Role.MANAGER] as RoleType[],

  /**
   * Reuses the predefined role sets from types.ts
   */
  management: RoleSets.management,
  companyUsers: RoleSets.companyUsers,
  public: RoleSets.public,
};

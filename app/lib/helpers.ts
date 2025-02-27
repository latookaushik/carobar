/**
 * Common Helper Functions and Utilities
 * 
 * This file contains shared helper functions and utilities used across the application.
 */

import { Role } from '@/app/lib/enums';

/**
 * Role checking utility for page authorization
 */
export const CheckRoles = {
  /**
   * All roles (Admin, Manager, Staff)
   */
  allRoles: [Role.ADMIN, Role.MANAGER, Role.STAFF],

  /**
   * Admin role only
   */
  adminOnly: [Role.ADMIN],
  
  /**
   * Manager role only
   */
  managerOnly: [Role.MANAGER],

  /**
   * Staff role only
   */
  staffOnly: [Role.STAFF],

/**
   * All Company roles (Staff, Manager)
   */
staffAndManager: [Role.STAFF, Role.MANAGER],

};

/**
 * Format date string to localized format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

/**
 * Format date and time string to localized format
 * @param dateString - ISO date string
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString();
}

/**
 * Truncate long text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

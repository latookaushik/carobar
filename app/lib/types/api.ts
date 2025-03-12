/**
 * API Type Definitions
 *
 * This module provides type definitions for API requests and responses
 * used throughout the application.
 */

/**
 * Pagination parameters for requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Pagination metadata returned in responses
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Sort parameters for requests
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Base interface for all paginated API responses
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Base interface for all successful API responses
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Error response shape
 */
export interface ApiErrorResponse {
  error: string;
  details?: Record<string, unknown>;
  status?: number;
}

/**
 * Reference data generic update request
 */
export interface ReferenceDataUpdateRequest<T> {
  oldEntity: Partial<T>;
  newEntity: T;
}

/**
 * Login request
 */
export interface LoginRequest {
  username: string;
  password: string;
  remember?: boolean;
}

/**
 * Login response
 */
export interface LoginResponse {
  success: boolean;
  user?: {
    userId: string;
    userName: string;
    email: string;
    companyId: string;
    companyName: string;
    roleId: string;
    roleName: string;
  };
  message?: string;
}

/**
 * Generic search parameters for reference data
 */
export interface SearchParams {
  search?: string;
  filters?: Record<string, string | number | boolean>;
  pagination?: PaginationParams;
  sort?: SortParams;
}

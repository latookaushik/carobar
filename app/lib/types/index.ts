/**
 * Types Module
 *
 * This module provides a centralized entry point for all type definitions
 * used throughout the application.
 *
 * It re-exports everything from:
 * - entities.ts: Entity type definitions
 * - api.ts: API request and response type definitions
 */

// Re-export all entity types
export * from './entities';

// Re-export all API types
export * from './api';

/**
 * Any utility types that don't belong in a specific file
 * can be defined here.
 */

/**
 * Makes specified properties of T nullable
 */
export type Nullable<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null;
};

/**
 * Makes all properties of T optional
 */
export type Optional<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Makes specified properties of T required
 */
export type Required<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

/**
 * Omits specified properties from T and makes the rest optional
 */
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

/**
 * Dictionary type with string keys and values of type T
 */
export type Dictionary<T> = {
  [key: string]: T;
};

/**
 * Data Access Module
 *
 * This module provides a centralized entry point for all data access
 * functionality in the Carobar application.
 *
 * It re-exports:
 * - Prisma client instance
 * - Cache service
 * - (Future) Reference data services
 */

// Re-export the Prisma client instance
export { default as prisma } from './prisma';

// Re-export cache service
export * from './cache';

// Re-export reference data services
export * from './referenceDataService';

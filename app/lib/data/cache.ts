/**
 * Cache Service
 *
 * Provides a centralized caching mechanism for reference data that changes infrequently.
 * This reduces database trips by storing data in memory and serving it directly.
 */

import { logDebug, logInfo } from '@/app/lib/logging';

// Define generic cache interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Global cache store
const cache: Record<string, CacheItem<unknown>> = {};

// Default TTL: 5 minutes for reference data
const DEFAULT_TTL = 5 * 60 * 1000;

/**
 * Get data from cache
 *
 * @param key The cache key
 * @returns The cached data or null if not found or expired
 */
export function getFromCache<T>(key: string): T | null {
  const cacheItem = cache[key];

  if (!cacheItem) {
    return null;
  }

  // Check if cache has expired
  const now = Date.now();
  if (now - cacheItem.timestamp > cacheItem.ttl) {
    logDebug(`Cache expired for key: ${key}`);
    delete cache[key];
    return null;
  }

  logDebug(`Cache hit for key: ${key}`);
  return cacheItem.data as T;
}

/**
 * Set data in cache
 *
 * @param key The cache key
 * @param data The data to cache
 * @param ttl Optional time to live in milliseconds
 */
export function setInCache<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
    ttl,
  };
  logDebug(`Set cache for key: ${key} with TTL: ${ttl}ms`);
}

/**
 * Clear specific key from cache
 *
 * @param key The cache key to clear
 */
export function clearCacheKey(key: string): void {
  if (cache[key]) {
    delete cache[key];
    logDebug(`Cleared cache for key: ${key}`);
  }
}

/**
 * Helper function to get or fetch data using cache
 *
 * @param key The cache key
 * @param fetchFn Function to fetch data if not in cache
 * @param ttl Optional time to live in milliseconds
 * @returns The data either from cache or fetched
 */
export async function getOrFetchData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl = DEFAULT_TTL
): Promise<T> {
  // Try to get from cache first
  const cachedData = getFromCache<T>(key);
  if (cachedData) {
    return cachedData;
  }

  // Not in cache, fetch fresh data
  logDebug(`Cache miss for key: ${key}, fetching fresh data`);
  const data = await fetchFn();

  // Store in cache for future use
  setInCache(key, data, ttl);
  return data;
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  Object.keys(cache).forEach((key) => delete cache[key]);
  logInfo('Cleared all cache');
}

/**
 * Token Refresh Utility
 *
 * This module provides functionality to refresh the access token when it expires.
 * It's designed to be used on the client side to maintain authentication state.
 */

'use client';

import { logError } from './logger';

/**
 * Refreshes the access token using the refresh token
 *
 * @returns A promise that resolves to true if the token was refreshed successfully, false otherwise
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/refreshToken', {
      method: 'POST',
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to refresh token');
    }

    return true;
  } catch (error) {
    logError(`Token refresh error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Handles API responses that indicate an expired token
 *
 * @param response - The API response to check
 * @param retryFn - The function to retry if the token is refreshed successfully
 * @returns The result of the retry function or null if the token couldn't be refreshed
 */
export async function handleTokenExpiration<T>(
  response: Response,
  retryFn: () => Promise<T>
): Promise<T | null> {
  // If the response is a 401 Unauthorized, try to refresh the token
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // If the token was refreshed successfully, retry the original request
      return retryFn();
    }

    // If the token couldn't be refreshed, return null
    return null;
  }

  // For other response statuses, just return the original response
  return null;
}

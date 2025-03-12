/**
 * Client-side Authentication Utilities
 *
 * This module provides authentication-related utilities for client-side use.
 * It includes token refresh functionality for maintaining authentication state.
 */

'use client';

import { logError } from '@/app/lib/logging';

/**
 * Refreshes the access token using the refresh token
 *
 * Calls the server-side refresh token endpoint to get a new access token
 * when the current one expires. Uses the HttpOnly refresh token cookie.
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
 * When an API call returns a 401 Unauthorized, this function attempts to refresh the token
 * and retry the original API call.
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

  // For other response statuses, just return null
  return null;
}

/**
 * Logs the user out by making a request to the logout endpoint
 *
 * @returns A promise that resolves to true if the logout was successful, false otherwise
 */
export async function logout(): Promise<boolean> {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to logout');
    }

    return true;
  } catch (error) {
    logError(`Logout error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Checks if the current user is authenticated
 *
 * Makes a request to the verifyToken endpoint to check if the current user's token is valid.
 *
 * @returns A promise that resolves to true if the user is authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch('/api/verifyToken', {
      method: 'GET',
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    logError(`Auth check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * HTTP Error Utilities
 *
 * This module provides standardized HTTP error handling for the application.
 * It ensures consistent error responses across all API routes.
 */

import { NextResponse } from 'next/server';
import { logError } from '@/app/lib/logging';

/**
 * Standard HTTP status codes for API responses
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Type for error details that can be included in error responses
 */
export type ErrorDetails = Record<string, unknown>;

/**
 * Create a standardized error response for API endpoints
 *
 * @param message - The error message to be sent to the client
 * @param status - The HTTP status code (defaults to 500)
 * @param details - Optional additional error details for debugging
 * @returns NextResponse with JSON error payload
 */
export function createErrorResponse(
  message: string,
  status: number = HttpStatus.INTERNAL_SERVER_ERROR,
  details?: ErrorDetails
) {
  // Log the error for server-side tracking
  logError(`API Error (${status}): ${message}${details ? ' - ' + JSON.stringify(details) : ''}`);

  // Return the standardized error response
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Create a standardized success response for API endpoints
 *
 * @param data - The data payload to return
 * @param status - The HTTP status code (defaults to 200)
 * @returns NextResponse with JSON success payload
 */
export function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

/**
 * Create a standardized empty response for API endpoints
 *
 * @param status - The HTTP status code (defaults to 204 No Content)
 * @returns NextResponse with no body
 */
export function createEmptyResponse(status: number = HttpStatus.NO_CONTENT) {
  return new NextResponse(null, { status });
}

// app/api/verifyToken/route.ts

import { NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/app/lib/auth';
import { createErrorResponse, HttpStatus } from '@/app/lib/errors';
import { logInfo, logError } from '@/app/lib/logging';
/**
 * Handles the GET request to verify a token from cookies.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a response object.
 *
 * @throws {Error} - Throws an error if there is an issue verifying the token.
 *
 * The function performs the following steps:
 * 1. Extracts the token from the cookies in the request headers.
 * 2. Parses the cookies to retrieve the token.
 * 3. If no token is found, returns a HttpStatus.UNAUTHORIZED response.
 * 4. Verifies the token using the `verifyToken` function.
 * 5. If the token is valid, logs the user information and returns a JSON response with the user data.
 * 6. If the token is invalid or expired, logs an error, clears the invalid token, and returns a 401 Unauthorized response.
 * 7. Catches and logs any errors that occur during the process and returns a 500 Internal Server Error response.
 */
export async function GET(req: Request) {
  try {
    // Extract token from cookies
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return createErrorResponse('No cookies found', HttpStatus.UNAUTHORIZED);
    }

    // Parse cookies
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((cookie) => {
        const [name, ...value] = cookie.split('=');
        return [name, value.join('=')];
      })
    );

    const token = cookies.token;

    if (!token) {
      return createErrorResponse('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    // Verify the token
    const decoded: JWTPayload | null = verifyToken(token);

    if (decoded) {
      logInfo(`Token verified for user: ${decoded.userName}`);
      return NextResponse.json({ user: decoded });
    } else {
      logError('Invalid or expired token');

      // Determine if we should use secure cookies (only if explicitly configured for HTTPS)
      const useSecureCookies = process.env.USE_HTTPS === 'true';

      // Clear the invalid token
      const response = NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: HttpStatus.UNAUTHORIZED }
      );

      response.cookies.set({
        name: 'token',
        value: '',
        httpOnly: true,
        secure: useSecureCookies,
        sameSite: 'strict',
        path: '/',
        maxAge: 0, // Expire immediately
      });

      return response;
    }
  } catch (error) {
    logError(`Error verifying token: ${error instanceof Error ? error.message : error}`);
    return createErrorResponse('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

// Keep POST method for backward compatibility
export async function POST(req: Request) {
  try {
    // Check for token in request body (old method)
    const body = await req.json();
    const { token } = body;

    if (token) {
      // If token is provided in body, verify it
      const decoded: JWTPayload | null = verifyToken(token);

      if (decoded) {
        return NextResponse.json({ user: decoded });
      }
    }

    // If no token in body or invalid token, try from cookies (new method)
    return GET(req);
  } catch (error) {
    logError(`Error verifying token: ${error instanceof Error ? error.message : error}`);
    return createErrorResponse('Internal server error', 500);
  }
}

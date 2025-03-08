// app/api/refreshToken/route.ts
// This API route handles token refresh for the authentication system.

import { NextResponse } from 'next/server';
import { refreshAccessToken } from '@/app/lib/jwtUtil';
import { createErrorResponse, HttpStatus } from '@/app/lib/errorUtil';
import { logInfo, logError } from '@/app/lib/logger';

export async function POST(request: Request) {
  try {
    // Extract refresh token from cookies
    const cookieHeader = request.headers.get('cookie');
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

    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      return createErrorResponse('Refresh token required', HttpStatus.UNAUTHORIZED);
    }

    // Use the refresh token to generate a new access token
    const newAccessToken = await refreshAccessToken(refreshToken);

    if (!newAccessToken) {
      return createErrorResponse('Invalid or expired refresh token', HttpStatus.UNAUTHORIZED);
    }

    // Create response with success message
    const response = NextResponse.json(
      { message: 'Token refreshed successfully' },
      { status: HttpStatus.OK }
    );

    // Set the new access token as a cookie
    response.cookies.set({
      name: 'token',
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1 hour in seconds
    });

    logInfo('Access token refreshed successfully');
    return response;
  } catch (error) {
    logError(`Token refresh error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse(
      'An error occurred while refreshing the token',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

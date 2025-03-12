// app/api/logout/route.ts
// This API route handles user logout by clearing the authentication cookie.

import { NextResponse } from 'next/server';
import { logInfo } from '@/app/lib/logging';
import { HttpStatus } from '@/app/lib/errors';

export async function POST() {
  // Create a response
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: HttpStatus.OK }
  );

  // Clear the access token cookie
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0, // Expire immediately
  });

  // Clear the refresh token cookie
  response.cookies.set({
    name: 'refreshToken',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0, // Expire immediately
  });

  logInfo('User logged out successfully');
  return response;
}

// app/api/verifyToken/route.ts

import { NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/app/lib/jwtUtil'; // Import your server-side function
import { createErrorResponse } from '@/app/lib/errorUtil'; // Import error util
import { logError } from '@/app/lib/logger';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return createErrorResponse('Token is required', 400);
    }

    const decoded: JWTPayload | null = verifyToken(token);

    if (decoded) {
      return NextResponse.json({ user: decoded }); // Return the user data
    } else {
      logError('Invalid or expired token');
      return createErrorResponse('Invalid or expired token', 401);
    }
  } catch (error) {
    logError(`Error verifying token: ${error instanceof Error ? error.message : error}`);
    return createErrorResponse('Internal server error', 500);
  }
}

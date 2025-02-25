//Middleware to check the user's role and token
// It will check if the user is authenticated and if so, 
// it will attach the user information to the request object

// app/lib/authMiddleware.ts
import { NextRequest, NextResponse } from 'next/server'; // Import without 'type'
import { verifyToken } from '@/app/lib/jwtUtil';
import { createErrorResponse } from '@/app/lib/errorUtil';
import { logInfo, logError } from '@/app/lib/logger';
import { Role } from '@/app/lib/enums'; // Import the Role enum


export function withAuth(
  handler: (req: NextRequest) => Promise<NextResponse>,
  requiredRoles: string[] = [],
) {
  return async (req: NextRequest) => {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      logError('No token found');
      return createErrorResponse('Authentication required', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      logError('Invalid or expired token');
      return createErrorResponse('Invalid or expired token', 401);
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.roleId)) {
      logError('Insufficient role permissions');
      return createErrorResponse('Insufficient role permissions', 403);
    }

    // Modify existing request instead of creating new
    (req as any).user = decoded;

    logInfo(`User authenticated: ${decoded.userName}`);
    return handler(req); // Pass the modified request
  };
}

export function isAdmin(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withAuth(handler, [Role.ADMIN]);
}

export function isManager(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withAuth(handler, [Role.MANAGER]);
}

export function isStaff(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withAuth(handler, [Role.STAFF]);
}

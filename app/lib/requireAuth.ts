import { verifyToken } from '@/app/lib/jwtUtil';
import { createErrorResponse } from '@/app/lib/errorUtil';
import { NextRequest, NextResponse } from 'next/server';

// Extend the NextRequest object to add a user property
declare module 'next/server' {
  interface NextRequest {
    user?: {
        userId: string;
        userName: string;
        email: string;
        companyId: string;
        companyName: string;
        roleId: string;
        roleName: string;
    };
  }
}

export function requireAuth(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async (req: NextRequest): Promise<NextResponse> => {
      const token = req.cookies.get('token')?.value;

      if (!token) {
        return createErrorResponse('Authentication required. No authentication token found', 401);
      }
  
      const decoded = verifyToken(token);
      if (!decoded) {
        return createErrorResponse('Invalid or expired token', 401);
      }
  
      // Attach user information to the request object
      (req as any).user = decoded;
  
      return handler(req);
    };
  }

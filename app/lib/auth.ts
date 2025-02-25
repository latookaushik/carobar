import { NextRequest } from 'next/server';
import { verifyToken,JWTPayload } from '@/app/lib/jwtUtil';

export async function getServerSession(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token) as JWTPayload;

  if (decoded) {
    return {
      user: {
        userId: decoded.userId,
        userName: decoded.userName,
        email: decoded.email,
        companyId: decoded.companyId,
        companyName: decoded.companyName,
        roleId: decoded.roleId,
        roleName: decoded.roleName,
      },
    };
  }
  return null;
}

// app/api/login/route.ts
// This API route handles user authentication by verifying the provided company ID, user ID, and password.

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createToken, JWTPayload } from '@/app/lib/jwtUtil';
import { createErrorResponse } from '@/app/lib/errorUtil';
import { logInfo, logError, logWarning } from '@/app/lib/logger';
import prisma from '@/app/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // Import only the specific error type

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, user_id, password } = body;

    // Validate required fields
    if (!company_id || !user_id || !password) {
      return createErrorResponse('All fields are required', 400);
    }

    // Find user in database with joined company and role info
    const user = await prisma.ref_users.findUnique({
      where: {
        user_id_company_id: {
          user_id,
          company_id,
        },
      },
      include: {
        ref_companies: {
          select: {
            company_name: true,
            is_active: true,
          },
        },
        ref_roles: {
          select: {
            description: true,
          },
        },
      },
    });

    if (!user) {
      logWarning(`User ${user_id} not found`);
      return createErrorResponse('User not found', 404);
    }

    // Transform the result to match the desired output
    const transformedUser: JWTPayload = {
      userId: user.user_id ?? '',
      userName: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
      email: user.email ?? '',
      companyId: user.company_id ?? '',
      companyName: user.ref_companies?.company_name ?? '',
      roleId: user.role_name ?? '',
      roleName: user.ref_roles?.description ?? '',
    };

    // Verify password matches
    if (!(await bcrypt.compare(password, user.password_hash))) {
      logError('Incorrect password');
      return createErrorResponse('Invalid credentials', 401);
    }

    // Check if both user and company accounts are active
    if (!user.is_active || !user.ref_companies.is_active) {
      logError('User or company inactive');
      return createErrorResponse('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = createToken(transformedUser);
    logInfo(`User ${user.user_id} logged in successfully`);
    return NextResponse.json(
      {
        token,
        user: transformedUser,
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (error) {
    //check if the error is coming from prisma
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return createErrorResponse('Record not found', 404);
      }
      logError(`Prisma error: ${error.message}`);
      return createErrorResponse('A database error occurred', 500);
    }

    logError(`Login error: ${error instanceof Error ? error.message : error}`);
    return createErrorResponse('An unexpected error occurred. Please try again later.', 500);
  }
}

/**
 * Login API Route
 *
 * This API route handles user authentication by verifying the provided
 * company ID, user ID, and password.
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createToken, createRefreshToken, JWTPayload } from '@/app/lib/auth';
import { createErrorResponse, HttpStatus } from '@/app/lib/errors';
import { logInfo, logError, logWarning } from '@/app/lib/logging';
import { prisma } from '@/app/lib/data';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // Import only the specific error type

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, user_id, password } = body;

    // Validate required fields
    if (!company_id || !user_id || !password) {
      return createErrorResponse('All fields are required', HttpStatus.BAD_REQUEST);
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
      return createErrorResponse('User not found', HttpStatus.NOT_FOUND);
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
      return createErrorResponse('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Check if both user and company accounts are active
    if (!user.is_active || !user.ref_companies.is_active) {
      logError('User or company inactive');
      return createErrorResponse('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Generate access token (short-lived)
    const accessToken = createToken({
      ...transformedUser,
      tokenType: 'access',
    });

    // Generate refresh token (long-lived)
    const refreshToken = createRefreshToken(transformedUser.userId, transformedUser.companyId);

    // Create response with user data
    const response = NextResponse.json(
      {
        user: transformedUser,
        message: 'Login successful',
      },
      { status: 200 }
    );

    // Set access token as httpOnly cookie
    response.cookies.set({
      name: 'token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1 hour in seconds
    });

    // Set refresh token as httpOnly cookie
    response.cookies.set({
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    logInfo(`User ${user.user_id} logged in successfully`);
    return response;
  } catch (error) {
    //check if the error is coming from prisma
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return createErrorResponse('Record not found', HttpStatus.NOT_FOUND);
      }
      logError(`Prisma error: ${error.message}`);
      return createErrorResponse('A database error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    logError(`Login error: ${error instanceof Error ? error.message : error}`);
    return createErrorResponse(
      'An unexpected error occurred. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

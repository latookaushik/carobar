/**
 * Users API Route Handler
 *
 * Provides operations to retrieve user information from the database.
 * All operations are secured and company-specific, ensuring proper data isolation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/data';
import { withUser, getAuthUser } from '@/app/lib/auth';
import { createErrorResponse, HttpStatus } from '@/app/lib/errors';
import { logError, logDebug } from '@/app/lib/logging';

/**
 * Helper function to create success responses
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

/**
 * GET /api/users
 * Fetches all users for the authenticated user's company
 */
export const GET = withUser(async (request: NextRequest) => {
  logDebug('GET /api/users - Fetching users');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const companyId = user!.companyId;

    logDebug(`Fetching users for company: ${companyId}`);

    // Query the database for users
    const users = await prisma.ref_users.findMany({
      where: { company_id: companyId },
      select: {
        user_id: true,
        first_name: true,
        last_name: true,
        email: true,
        role_name: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        last_login_date: true,
      },
      orderBy: { user_id: 'asc' },
    });

    logDebug(`Found ${users.length} users for company ${companyId}`);

    // Return the users
    return createSuccessResponse({ users });
  } catch (error) {
    logError(`Error fetching users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse('Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

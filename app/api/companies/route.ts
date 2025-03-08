/**
 * Company API Routes
 *
 * Handles fetching company data for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { withUser, getAuthUser } from '@/app/lib/authMiddleware';
import { createErrorResponse, HttpStatus } from '@/app/lib/errorUtil';
import { logInfo, logError, logDebug } from '@/app/lib/logger';

/**
 * Helper function to create success responses
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

// GET /api/companies - Get the authenticated user's company data
export const GET = withUser(async (request: NextRequest) => {
  logInfo('GET /api/companies - fetching company data');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const companyId = user!.companyId;

    logDebug(`Fetching company data for company ID: ${companyId}`);

    // Query company data using Prisma
    const company = await prisma.ref_companies.findUnique({
      where: {
        company_id: companyId,
      },
      select: {
        company_id: true,
        company_name: true,
        address1: true,
        address2: true,
        address3: true,
        country: true,
        phone: true,
        mobile: true,
        email: true,
        is_active: true,
        base_currency: true,
        lastopeningday: true,
        lastinvoiceno: true,
        lastlocalinvoice: true,
        taxpercent: true,
        report_prefix: true,
        last_login_date: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!company) {
      logError(`Company with ID ${companyId} not found`);
      return createErrorResponse('Company not found', HttpStatus.NOT_FOUND);
    }

    logInfo(`Successfully fetched company data for company ID: ${companyId}`);

    // Return the company data
    return createSuccessResponse({ company });
  } catch (error) {
    logError(
      `Error fetching company data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to fetch company data', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

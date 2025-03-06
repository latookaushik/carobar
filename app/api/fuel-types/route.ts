/**
 * Fuel Type API Routes  : Read Only
 *
 * Handles CRUD operations for Fuel Type management in Carobar.
 * Fuel Type are company-specific and used in various vehicle-related forms.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { withUser, getAuthUser } from '@/app/lib/authMiddleware';
import { createErrorResponse } from '@/app/lib/errorUtil';
import { logInfo, logError, logDebug } from '@/app/lib/logger';
import { HttpStatus } from '@/app/lib/enums';

/**
 * Helper function to create success responses
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

// GET /api/fuel-types - Get all Fuel Types for the authenticated user's company
export const GET = withUser(async (request: NextRequest) => {
  logInfo('GET /api/fuel-types - fetching fuel-types');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const companyId = user!.companyId;

    logDebug(`Fetching Fuel Types for ${companyId}`);

    // Query Fuel Types using Prisma
    const FuelType = await prisma.ref_fueltype.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    logInfo(`Found ${FuelType.length} FuelTypes`);

    // Return the Fuel Types
    return createSuccessResponse({ fuelTypes: FuelType });
  } catch (error) {
    logError(
      `Error fetching FuelTypes: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to fetch FuelTypes', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

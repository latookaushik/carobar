/**
 * Combined Purchase Reference Data API Route Handler
 *
 * Provides all necessary reference data for the purchase module in a single request.
 * This reduces the number of database trips and HTTP requests needed when loading the purchase page.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withUser, getAuthUser } from '@/app/lib/authMiddleware';
import { createErrorResponse, HttpStatus } from '@/app/lib/errorUtil';
import { logInfo, logError } from '@/app/lib/logger';
import { getAllPurchaseReferenceData } from '@/app/lib/referenceDataService';

/**
 * Helper function to create success responses
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

/**
 * GET /api/reference-data/purchase
 * Fetches all reference data needed for the purchase module in a single request
 */
export const GET = withUser(async (request: NextRequest) => {
  logInfo('GET /api/reference-data/purchase - Fetching all purchase reference data');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    if (!user) {
      return createErrorResponse('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const { companyId } = user;

    // Get all reference data in a single operation
    const referenceData = await getAllPurchaseReferenceData(companyId);

    return createSuccessResponse({
      success: true,
      referenceData,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`Failed to fetch purchase reference data: ${errorMessage}`);
    return createErrorResponse('Failed to fetch reference data', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

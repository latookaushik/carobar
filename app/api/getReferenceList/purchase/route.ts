/**
 * Combined Purchase Reference Data API Route Handler
 *
 * Provides all necessary reference data for the purchase module in a single request.
 * This reduces the number of database trips and HTTP requests needed when loading the purchase page.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withUser, getAuthUser } from '@/app/lib/auth';
import { createErrorResponse, HttpStatus } from '@/app/lib/errors';
import { logInfo, logError } from '@/app/lib/logging';
import {
  getCountries,
  getCounterparties,
  getFuelTypes,
  getVehicleMakers,
  getColors,
  getLocations,
  getVehicleTypes,
} from '@/app/lib/data';

/**
 * Helper function to create success responses
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

/**
 * Get all reference data in a single batch for a purchase form  This reduces the number of HTTP requests made from the client
 */
async function getAllPurchaseReferenceData(companyId: string) {
  try {
    // Execute all promises in parallel
    const [countries, counterparties, fuelTypes, makers, colors, locations, vehicleTypes] =
      await Promise.all([
        getCountries(companyId),
        getCounterparties(companyId),
        getFuelTypes(),
        getVehicleMakers(companyId),
        getColors(companyId),
        getLocations(companyId),
        getVehicleTypes(companyId),
      ]);

    return {
      countries,
      counterparties: counterparties.filter((c) => c.is_supplier),
      fuelTypes,
      makers,
      colors,
      locations,
      vehicleTypes,
    };
  } catch (error) {
    logError(
      `Error fetching reference data: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
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

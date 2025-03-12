/**
 * Purchases API Route Handler
 *
 * Provides operations for vehicle purchases in the Carobar application.
 * All operations are secured and company-specific, ensuring proper data isolation.
 *
 * Endpoints:
 * - POST: Creates a new purchase record with associated vehicle data
 * - GET: Retrieves purchase records with filtering and pagination
 *
 * Authentication: All endpoints require a valid JWT token with company context
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/data';
import { withUser, getAuthUser } from '@/app/lib/auth';
import { createErrorResponse, HttpStatus } from '@/app/lib/errors';
import { logInfo, logError, logDebug } from '@/app/lib/logging';

/**
 * Helper function to create success responses
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

/**
 * Error handler for API routes
 */
function handleApiError(error: unknown, message: string) {
  logError(`${message}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  return createErrorResponse(message, HttpStatus.INTERNAL_SERVER_ERROR);
}

/**
 * POST /api/transactions/purchases
 * Creates a new purchase record
 */
/**
 * PUT /api/transactions/purchases
 * Updates an existing purchase record
 */
export const PUT = withUser(async (request: NextRequest) => {
  logInfo('PUT /api/transactions/purchases - Updating purchase record');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    if (!user) {
      return createErrorResponse('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const { companyId, userId } = user;
    logDebug(`Processing purchase update for company: ${companyId}`);

    // Parse request body
    const data = await request.json();

    // Validate required fields
    if (!data.purchase_date || !data.supplier_code || !data.chassis_no) {
      return createErrorResponse('Missing required fields', HttpStatus.BAD_REQUEST);
    }

    // Check if purchase exists
    const existingPurchase = await prisma.vehicle_purchase.findFirst({
      where: {
        company_id: companyId,
        chassis_no: data.chassis_no,
      },
    });

    if (!existingPurchase) {
      return createErrorResponse('Purchase record not found', HttpStatus.NOT_FOUND);
    }

    // Prepare vehicle data
    const vehicleData = {
      company_id: companyId,
      chassis_no: data.chassis_no,
      vehicle_name: data.vehicle_name || '',
      maker: data.maker || '',
      grade: data.grade || '',
      color: data.color || '',
      seats: data.seats || 0,
      doors: data.doors || 0,
      manufacture_yyyymm: data.model || '', // Map model to manufacture_yyyymm
      engine_no: data.engine_no || '',
      mileage: data.mileage || 0,
      cc: data.cc || 0,
      fuel_type: data.fuel_type || '',
      vehicle_type: data.vehicle_type || '',
      is_auto: data.is_auto || false,
      is_ac: data.is_ac || false,
      is_power_steering: data.is_power_steering || false,
      is_power_windows: data.is_power_windows || false,
      is_power_lock: data.is_power_lock || false,
      is_power_mirror: data.is_power_mirror || false,
      is_sun_roof: data.is_sun_roof || false,
      is_high_roof: data.is_high_roof || false,
      is_4wd: data.is_4wd || false,
      is_alloy_wheel: data.is_alloy_wheel || false,
      is_full_option: data.is_full_option || false,
      is_active: data.is_active !== undefined ? data.is_active : true,
      gear_type: data.gear_type || '',
      auction_ref_no: data.auction_ref_no || '',
      inspection_rank: data.rank || 0,
      target_country: data.target_country || '',
      vehicle_location: data.stock_location || '',
      updated_by: userId,
      updated_at: new Date(),
    };

    // Update the vehicle data
    await prisma.vehicle.update({
      where: {
        company_id_chassis_no: {
          company_id: companyId,
          chassis_no: data.chassis_no,
        },
      },
      data: vehicleData,
    });

    logInfo(`Vehicle record updated for chassis: ${data.chassis_no}`);

    // Update purchase record
    const updatedPurchase = await prisma.vehicle_purchase.updateMany({
      where: {
        company_id: companyId,
        chassis_no: data.chassis_no,
      },
      data: {
        purchase_date: data.purchase_date,
        supplier_code: data.supplier_code,
        supplier_name: data.supplier_name || '',
        currency: data.currency || 'JPY',
        purchase_cost: data.purchase_cost || 0,
        tax: data.tax || 0,
        commission: data.commission || 0,
        recycle_fee: data.recycle_fee || 0,
        auction_fee: data.auction_fee || 0,
        road_tax: data.road_tax || 0,
        total_vehicle_fee: data.total_vehicle_fee || 0,
        payment_date: data.payment_date,
        purchase_remarks: data.purchase_remarks || '',
        updated_by: userId,
        updated_at: new Date(),
      },
    });

    logInfo(`Purchase record updated for chassis: ${data.chassis_no}`);

    return createSuccessResponse({
      message: 'Purchase updated successfully',
      purchase: updatedPurchase,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to update purchase');
  }
});

export const POST = withUser(async (request: NextRequest) => {
  logInfo('POST /api/transactions/purchases - Creating purchase record');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    if (!user) {
      return createErrorResponse('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const { companyId, userId } = user;
    logDebug(`Processing purchase for company: ${companyId}`);

    // Parse request body
    const data = await request.json();

    // Validate required fields
    if (!data.purchase_date || !data.supplier_code || !data.chassis_no) {
      return createErrorResponse('Missing required fields', HttpStatus.BAD_REQUEST);
    }

    // Prepare vehicle data
    const vehicleData = {
      company_id: companyId,
      chassis_no: data.chassis_no,
      vehicle_name: data.vehicle_name || '',
      maker: data.maker || '',
      grade: data.grade || '',
      color: data.color || '',
      seats: data.seats || 0,
      doors: data.doors || 0,
      manufacture_yyyymm: data.manufacture_yyyymm || '',
      engine_no: data.engine_no || '',
      mileage: data.mileage || 0,
      cc: data.cc || 0,
      fuel_type: data.fuel_type || '',
      vehicle_type: data.vehicle_type || '',
      is_auto: data.is_auto || false,
      is_ac: data.is_ac || false,
      is_power_steering: data.is_power_steering || false,
      is_power_windows: data.is_power_windows || false,
      is_power_lock: data.is_power_lock || false,
      is_power_mirror: data.is_power_mirror || false,
      is_sun_roof: data.is_sun_roof || false,
      is_high_roof: data.is_high_roof || false,
      is_4wd: data.is_4wd || false,
      is_alloy_wheel: data.is_alloy_wheel || false,
      is_full_option: data.is_full_option || false,
      is_active: data.is_active || false,
      gear_type: data.gear_type || '',
      auction_ref_no: data.auction_no || '',
      inspection_rank: data.rank || 0,
      target_country: data.target_country || '',
      vehicle_location: data.stock_location || '',
      created_by: userId,
      created_at: new Date(),
      updated_by: userId,
      updated_at: new Date(),
    };

    // Use upsert to create or update the vehicle
    await prisma.vehicle.upsert({
      where: {
        company_id_chassis_no: {
          company_id: companyId,
          chassis_no: data.chassis_no,
        },
      },
      update: {
        ...vehicleData,
        updated_at: new Date(),
        updated_by: userId,
      },
      create: vehicleData,
    });

    logInfo(`Vehicle record created/updated for chassis: ${data.chassis_no}`);

    // Create purchase record after ensuring vehicle exists
    const purchaseRecord = await prisma.vehicle_purchase.create({
      data: {
        company_id: companyId,
        chassis_no: data.chassis_no,
        purchase_date: data.purchase_date,
        supplier_code: data.supplier_code,
        supplier_name: data.supplier_name || '',
        currency: data.currency || 'JPY',
        purchase_cost: data.purchase_cost || 0,
        tax: data.tax || 0,
        commission: data.commission || 0,
        recycle_fee: data.recycle_fee || 0,
        auction_fee: data.auction_fee || 0,
        road_tax: data.road_tax || 0,
        total_vehicle_fee: data.total_vehicle_fee || 0,
        payment_date: data.payment_date,
        purchase_remarks: data.purchase_remarks || '',
        created_by: userId,
        created_at: new Date(),
      },
    });

    logInfo(`Purchase record created for chassis: ${data.chassis_no}`);

    return createSuccessResponse(
      {
        message: 'Purchase created successfully',
        purchase: purchaseRecord,
      },
      HttpStatus.CREATED
    );
  } catch (error) {
    return handleApiError(error, 'Failed to create purchase');
  }
});

/**
 * GET /api/transactions/purchases
 * Fetches vehicle purchase records
 */
export const GET = withUser(async (request: NextRequest) => {
  logInfo('GET /api/transactions/purchases - Fetching purchases');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    if (!user) {
      return createErrorResponse('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const { companyId } = user;

    // Parse any filter parameters from the URL
    const { searchParams } = new URL(request.url);
    const chassisNo = searchParams.get('chassis');
    const supplierCode = searchParams.get('supplier');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    logDebug(
      `Fetching purchases for company: ${companyId} with filters: chassis=${chassisNo}, supplier=${supplierCode}`
    );

    // Build where clause based on filters
    const whereCondition: Record<string, unknown> = { company_id: companyId };

    if (chassisNo) {
      whereCondition.chassis_no = chassisNo;
    }

    if (supplierCode) {
      whereCondition.supplier_code = supplierCode;
    }

    // Get purchases with vehicle info
    const purchases = await prisma.vehicle_purchase.findMany({
      where: whereCondition,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        vehicle: true, // Include all vehicle fields when fetching by chassis number
      },
      skip,
      take: pageSize,
    });

    // Get total count for pagination
    const total = await prisma.vehicle_purchase.count({ where: whereCondition });
    const totalPages = Math.ceil(total / pageSize);

    logInfo(`Found ${purchases.length} purchases for company ${companyId}`);

    return createSuccessResponse({
      purchases,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch purchases');
  }
});

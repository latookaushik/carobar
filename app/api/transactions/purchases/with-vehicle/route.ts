/**
 * Purchases with Vehicle API Route Handler
 *
 * Provides combined purchase and vehicle data for the Carobar application.
 * This endpoint supports filtering by date range, supplier, and target country.
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

/**
 * Error handler for API routes
 */
function handleApiError(error: unknown, message: string) {
  logError(`${message}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  return createErrorResponse(message, HttpStatus.INTERNAL_SERVER_ERROR);
}

/**
 * GET /api/transactions/purchases/with-vehicle
 * Fetches purchase records with related vehicle information
 * Supports filtering by date range, supplier, and target country
 */
export const GET = withUser(async (request: NextRequest) => {
  logInfo('GET /api/transactions/purchases/with-vehicle - Fetching purchase data with vehicle info');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    if (!user) {
      return createErrorResponse('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const { companyId } = user;
    
    // Parse filter parameters from the URL
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate') ? parseInt(searchParams.get('fromDate') as string) : null;
    const toDate = searchParams.get('toDate') ? parseInt(searchParams.get('toDate') as string) : null;
    const supplier = searchParams.get('supplier');
    const targetCountry = searchParams.get('targetCountry');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '100');
    const skip = (page - 1) * pageSize;

    logDebug(
      `Fetching purchases with vehicle data for company: ${companyId} with filters: fromDate=${fromDate}, toDate=${toDate}, supplier=${supplier}, targetCountry=${targetCountry}`
    );

// Define types for query parameters
interface PurchaseWhereCondition {
  company_id: string;
  purchase_date?: {
    gte?: number;
    lte?: number;
  };
  supplier_code?: string;
}

// Build where condition for purchases
const whereCondition: PurchaseWhereCondition = { 
  company_id: companyId 
};

    if (fromDate) {
      whereCondition.purchase_date = whereCondition.purchase_date || {};
      whereCondition.purchase_date.gte = fromDate;
    }

    if (toDate) {
      whereCondition.purchase_date = whereCondition.purchase_date || {};
      whereCondition.purchase_date.lte = toDate;
    }

    if (supplier) {
      whereCondition.supplier_code = supplier;
    }

// Vehicle where condition for target country filter
interface VehicleWhereCondition {
  company_id: string;
  is_active: boolean;
  target_country?: string;
}

const vehicleWhereCondition: VehicleWhereCondition = {
  company_id: companyId,
  is_active: true
};

    if (targetCountry) {
      vehicleWhereCondition.target_country = targetCountry;
    }

    // Define the type for purchase data from raw query
    interface PurchaseWithVehicleData {
      chassis_no: string;
      purchase_date: number;
      supplier_name: string;
      vehicle_name: string;
      grade: string;
      model: string;
      color: string;
      maker: string;
      vehicle_location: string;
      target_country: string;
      purchase_cost: number;
      expenses: number;
      total_vehicle_fee: number;
      currency: string;
      payment_date: number;
      purchase_remarks: string;
    }

    // Build query conditions for WHERE clause
    let whereConditions = `WHERE p.company_id = '${companyId}'`;
    if (fromDate) whereConditions += ` AND p.purchase_date >= ${fromDate}`;
    if (toDate) whereConditions += ` AND p.purchase_date <= ${toDate}`;
    if (supplier) whereConditions += ` AND p.supplier_code = '${supplier}'`;
    if (targetCountry) whereConditions += ` AND v.target_country = '${targetCountry}'`;

    // Use a raw query to fetch the combined data as specified in requirements
    const rawPurchases = await prisma.$queryRawUnsafe<PurchaseWithVehicleData[]>(`
      SELECT 
        p.chassis_no, 
        p.purchase_date, 
        p.supplier_name, 
        v.vehicle_name, 
        v.grade, 
        v.manufacture_yyyymm as model,
        v.color,
        v.maker,
        v.vehicle_location,
        v.target_country,
        COALESCE(p.purchase_cost, 0) as purchase_cost, 
        (COALESCE(p.tax, 0) + COALESCE(p.commission, 0) + COALESCE(p.recycle_fee, 0) + COALESCE(p.auction_fee, 0) + COALESCE(p.road_tax, 0)) as expenses, 
        COALESCE(p.total_vehicle_fee, 0) as total_vehicle_fee, 
        p.currency,
        p.payment_date, 
        p.purchase_remarks
      FROM vehicle_purchase p 
      INNER JOIN vehicle v ON p.company_id = v.company_id AND p.chassis_no = v.chassis_no AND v.is_active = true
      ${whereConditions}
      ORDER BY p.purchase_date DESC
      LIMIT ${pageSize} OFFSET ${skip}
    `);

    // Define the type for count result
    interface CountResult {
      count: number | bigint;
    }

    // Get total count for pagination
    const countResult = await prisma.$queryRawUnsafe<CountResult[]>(`
      SELECT COUNT(*) as count
      FROM vehicle_purchase p 
      INNER JOIN vehicle v ON p.company_id = v.company_id AND p.chassis_no = v.chassis_no AND v.is_active = true
      ${whereConditions}
    `);

    // Convert bigint to number if necessary and calculate total pages
    const count = countResult[0]?.count || 0;
    const total = typeof count === 'bigint' ? Number(count) : count as number;
    const totalPages = Math.ceil(total / pageSize);

    logInfo(`Found ${rawPurchases.length} purchase records with vehicle info for company ${companyId}`);

    return createSuccessResponse({
      purchases: rawPurchases,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch purchase data with vehicle info');
  }
});

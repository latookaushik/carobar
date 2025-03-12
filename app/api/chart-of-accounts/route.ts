/**
 * Chart of Accounts API Route Handler
 *
 * Provides CRUD operations for chart of accounts in the Carobar application.
 * All operations are secured and company-specific, ensuring proper data isolation.
 *
 * This file uses the generic reference data controller pattern
 * for standard operations, with a custom GET handler to support pagination and search.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createReferenceDataController } from '@/app/lib/apiUtils/referenceDataController';
import { withUser, getAuthUser } from '@/app/lib/auth';
import { createErrorResponse, HttpStatus } from '@/app/lib/errors';
import { logInfo, logError, logDebug } from '@/app/lib/logging';
import { Role } from '@/app/lib/roles';
import { prisma, getOrFetchData } from '@/app/lib/data';

// Define validation schema for Chart of Account data
const coaSchema = z.object({
  account_code: z.string().min(1).max(50),
  account_name: z.string().min(1).max(100),
  account_type: z.string().min(1).max(50),
  description: z.string().max(250).nullable().optional(),
  is_active: z.boolean().nullable().optional().default(true),
});

// Create the route handlers using the generic controller for POST, PUT, DELETE
const chartOfAccountsController = createReferenceDataController({
  modelName: 'ref_coa',
  entityName: 'Account',
  responsePropName: 'coa',
  validationSchema: coaSchema,
  primaryKey: {
    field: 'account_code',
    compositeName: 'company_id_account_code',
    urlParamName: 'code', // URL uses '?code=X' rather than '?account_code=X'
  },
  orderByField: 'account_code',
  orderDirection: 'asc',
  allowedRoles: {
    read: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    create: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    update: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    delete: [Role.ADMIN, Role.MANAGER, Role.STAFF],
  },
});

interface ChartOfAccount {
  account_code: string;
  account_name: string;
  account_type: string;
  description?: string | null;
  is_active: boolean | null;
}

// Cache TTL constants
const REFERENCE_DATA_TTL = 30 * 60 * 1000; // 30 minutes for reference data

/**
 * Get chart of accounts for a company
 */
async function getChartOfAccounts(companyId: string, search?: string): Promise<ChartOfAccount[]> {
  // If search is specified, don't use cache to ensure fresh results
  if (search) {
    const accounts = await prisma.ref_coa.findMany({
      where: {
        company_id: companyId,
        OR: [
          { account_code: { contains: search, mode: 'insensitive' as const } },
          { account_name: { contains: search, mode: 'insensitive' as const } },
          { account_type: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      },
      orderBy: [{ is_active: 'desc' }, { account_code: 'asc' }],
      select: {
        account_code: true,
        account_name: true,
        account_type: true,
        description: true,
        is_active: true,
      },
    });
    return accounts;
  }

  // If no search, use cache
  const cacheKey = `chart-of-accounts:${companyId}`;
  return getOrFetchData(
    cacheKey,
    async () => {
      const accounts = await prisma.ref_coa.findMany({
        where: { company_id: companyId },
        orderBy: [{ is_active: 'desc' }, { account_code: 'asc' }],
        select: {
          account_code: true,
          account_name: true,
          account_type: true,
          description: true,
          is_active: true,
        },
      });
      return accounts;
    },
    REFERENCE_DATA_TTL
  );
}

/**
 * Custom GET handler to support pagination and search functionality
 * while still using caching from referenceDataService
 */
export const GET = withUser(async (request: NextRequest) => {
  logInfo('GET /api/chart-of-accounts - Fetching accounts');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, roleId } = user!;

    // Check role permissions
    if (![Role.ADMIN, Role.MANAGER, Role.STAFF].includes(roleId as Role)) {
      return createErrorResponse('Permission denied', HttpStatus.FORBIDDEN);
    }

    // Get query parameters for pagination and search
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    logDebug(
      `Fetching COA for company: ${companyId} with search: ${search}, page: ${page}, pageSize: ${pageSize}`
    );

    // Use the reference data service which includes caching
    const accounts = await getChartOfAccounts(companyId, search);

    // If pageSize is 0, return all records without pagination
    const paginatedAccounts = pageSize === 0 ? accounts : accounts.slice(skip, skip + pageSize);

    // Get total count for pagination
    const total = accounts.length;
    const totalPages = pageSize === 0 ? 1 : Math.ceil(total / pageSize);

    logInfo(`Found ${accounts.length} accounts for company ${companyId}`);

    // Return paginated results
    return NextResponse.json(
      {
        coa: paginatedAccounts,
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
        },
      },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    logError(
      `Error fetching chart of accounts: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse(
      'Failed to fetch chart of accounts',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});

import { clearCacheKey } from '@/app/lib/data/cache';

// Custom PUT handler that clears cache after update
export const PUT = withUser(async (request: NextRequest) => {
  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId } = user!;

    // Use the standard controller for the update
    const result = await chartOfAccountsController.PUT(request);

    // After successful update, invalidate the cache
    const cacheKey = `chart-of-accounts:${companyId}`;
    logInfo(`Invalidating cache for key: ${cacheKey}`);
    clearCacheKey(cacheKey);

    return result;
  } catch (error) {
    logError(
      `Error in custom PUT handler: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to update account', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

// Custom POST handler that clears cache after creating a new account
export const POST = withUser(async (request: NextRequest) => {
  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId } = user!;

    // Use the standard controller for the create operation
    const result = await chartOfAccountsController.POST(request);

    // After successful creation, invalidate the cache
    const cacheKey = `chart-of-accounts:${companyId}`;
    logInfo(`Invalidating cache for key: ${cacheKey}`);
    clearCacheKey(cacheKey);

    return result;
  } catch (error) {
    logError(
      `Error in custom POST handler: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to create account', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

// Custom DELETE handler that clears cache after deleting an account
export const DELETE = withUser(async (request: NextRequest) => {
  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId } = user!;

    // Use the standard controller for the delete operation
    const result = await chartOfAccountsController.DELETE(request);

    // After successful deletion, invalidate the cache
    const cacheKey = `chart-of-accounts:${companyId}`;
    logInfo(`Invalidating cache for key: ${cacheKey}`);
    clearCacheKey(cacheKey);

    return result;
  } catch (error) {
    logError(
      `Error in custom DELETE handler: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to delete account', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

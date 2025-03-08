/**
 * Chart of Accounts API Route Handler
 *
 * Provides CRUD operations for chart of accounts in the Carobar application.
 * All operations are secured and company-specific, ensuring proper data isolation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/app/lib/prisma';
import { withUser, getAuthUser } from '@/app/lib/authMiddleware';
import { createErrorResponse, HttpStatus } from '@/app/lib/errorUtil';
import { logInfo, logError, logDebug } from '@/app/lib/logger';

// Define validation schema for Chart of Account data
const coaSchema = z.object({
  account_code: z.string().min(1).max(50),
  account_name: z.string().min(1).max(100),
  account_type: z.string().min(1).max(50),
  description: z.string().max(250).nullable().optional(),
  is_active: z.boolean().nullable().optional(),
});

type ChartOfAccountInput = z.infer<typeof coaSchema>;

/**
 * Helper function to create success responses
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

/**
 * GET /api/chart-of-accounts
 * Fetches chart of accounts with pagination and search
 */
export const GET = withUser(async (request: NextRequest) => {
  logInfo('GET /api/chart-of-accounts - Fetching accounts');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const companyId = user!.companyId;

    // Get query parameters for pagination and search
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    logDebug(
      `Fetching COA for company: ${companyId} with search: ${search}, page: ${page}, pageSize: ${pageSize}`
    );

    // Build search condition
    const whereCondition = search
      ? {
          company_id: companyId,
          OR: [
            { account_code: { contains: search, mode: 'insensitive' as const } },
            { account_name: { contains: search, mode: 'insensitive' as const } },
            { account_type: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : { company_id: companyId };

    // If pageSize is 0, return all records without pagination
    const accounts =
      pageSize === 0
        ? await prisma.ref_coa.findMany({
            where: whereCondition,
            orderBy: [{ is_active: 'desc' }, { account_code: 'asc' }],
          })
        : await prisma.ref_coa.findMany({
            where: whereCondition,
            orderBy: [{ is_active: 'desc' }, { account_code: 'asc' }],
            skip,
            take: pageSize,
          });

    // Get total count for pagination
    const total = await prisma.ref_coa.count({ where: whereCondition });
    const totalPages = pageSize === 0 ? 1 : Math.ceil(total / pageSize);

    logInfo(`Found ${accounts.length} accounts for company ${companyId}`);

    // Return paginated results
    return createSuccessResponse({
      coa: accounts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    });
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

/**
 * POST /api/chart-of-accounts
 * Creates a new chart of account entry
 */
export const POST = withUser(async (request: NextRequest) => {
  logInfo('POST /api/chart-of-accounts - Creating new account');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, userId } = user!;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = coaSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST);
    }

    const {
      account_code,
      account_name,
      account_type,
      description,
      is_active,
    }: ChartOfAccountInput = validationResult.data;

    // Check if account code already exists
    const existingAccount = await prisma.ref_coa.findUnique({
      where: {
        company_id_account_code: {
          company_id: companyId,
          account_code: account_code,
        },
      },
    });

    if (existingAccount) {
      return createErrorResponse('Account code already exists', HttpStatus.CONFLICT);
    }

    // Create new chart of account entry
    const newAccount = await prisma.ref_coa.create({
      data: {
        company_id: companyId,
        account_code,
        account_name,
        account_type,
        description,
        is_active: is_active ?? true,
        created_by: userId,
        updated_by: userId,
      },
    });

    logInfo(`Chart of account added: ${account_code} for company ${companyId}`);

    return createSuccessResponse({ coa: newAccount }, HttpStatus.CREATED);
  } catch (error) {
    logError(
      `Error creating chart of account: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse(
      'Failed to create chart of account',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * PUT /api/chart-of-accounts
 * Updates an existing chart of account entry
 */
export const PUT = withUser(async (request: NextRequest) => {
  logInfo('PUT /api/chart-of-accounts - Updating account');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, userId } = user!;

    // Parse request body
    const body = await request.json();
    const { oldCode, ...accountData } = body;

    if (!oldCode) {
      return createErrorResponse('Original account code is required', HttpStatus.BAD_REQUEST);
    }

    // Validate account data
    const validationResult = coaSchema.safeParse(accountData);
    if (!validationResult.success) {
      return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST);
    }

    const { account_code, account_name, account_type, description, is_active } =
      validationResult.data;

    // Check if the account exists
    const existingAccount = await prisma.ref_coa.findUnique({
      where: {
        company_id_account_code: {
          company_id: companyId,
          account_code: oldCode,
        },
      },
    });

    if (!existingAccount) {
      return createErrorResponse('Account not found', HttpStatus.NOT_FOUND);
    }

    // Check if updating to an existing account code
    if (oldCode !== account_code) {
      const duplicateAccount = await prisma.ref_coa.findUnique({
        where: {
          company_id_account_code: {
            company_id: companyId,
            account_code: account_code,
          },
        },
      });

      if (duplicateAccount) {
        return createErrorResponse('Account code already exists', HttpStatus.CONFLICT);
      }
    }

    // Handle the update or create based on whether code is changing
    let updatedAccount;

    if (oldCode === account_code) {
      // Simple update
      updatedAccount = await prisma.ref_coa.update({
        where: {
          company_id_account_code: {
            company_id: companyId,
            account_code: oldCode,
          },
        },
        data: {
          account_name,
          account_type,
          description,
          is_active,
          updated_by: userId,
          updated_at: new Date(),
        },
      });
    } else {
      // Code is changing, delete old and create new
      await prisma.ref_coa.delete({
        where: {
          company_id_account_code: {
            company_id: companyId,
            account_code: oldCode,
          },
        },
      });

      updatedAccount = await prisma.ref_coa.create({
        data: {
          company_id: companyId,
          account_code,
          account_name,
          account_type,
          description,
          is_active,
          created_by: userId,
          updated_by: userId,
        },
      });
    }

    logInfo(`Chart of account updated: ${oldCode} -> ${account_code} for company ${companyId}`);

    return createSuccessResponse({ coa: updatedAccount });
  } catch (error) {
    logError(
      `Error updating chart of account: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse(
      'Failed to update chart of account',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * DELETE /api/chart-of-accounts
 * Deletes a chart of account entry
 */
export const DELETE = withUser(async (request: NextRequest) => {
  logInfo('DELETE /api/chart-of-accounts - Deleting account');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId } = user!;

    // Get account code from URL params
    const { searchParams } = new URL(request.url);
    const account_code = searchParams.get('code');

    if (!account_code) {
      return createErrorResponse('Account code is required', HttpStatus.BAD_REQUEST);
    }

    // Check if the account exists
    const existingAccount = await prisma.ref_coa.findUnique({
      where: {
        company_id_account_code: {
          company_id: companyId,
          account_code,
        },
      },
    });

    if (!existingAccount) {
      return createErrorResponse('Account not found', HttpStatus.NOT_FOUND);
    }

    // Delete the account
    await prisma.ref_coa.delete({
      where: {
        company_id_account_code: {
          company_id: companyId,
          account_code,
        },
      },
    });

    logInfo(`Chart of account deleted: ${account_code} for company ${companyId}`);

    return createSuccessResponse({
      message: 'Chart of account deleted successfully',
    });
  } catch (error) {
    logError(
      `Error deleting chart of account: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse(
      'Failed to delete chart of account',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});

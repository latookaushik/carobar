/**
 * Banks API Route Handler
 *
 * Provides CRUD operations for bank accounts in the Carobar application.
 * All operations are secured and company-specific, ensuring proper data isolation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/app/lib/prisma';
import { withUser, getAuthUser } from '@/app/lib/authMiddleware';
import { createErrorResponse } from '@/app/lib/errorUtil';
import { logInfo, logError, logDebug } from '@/app/lib/logger';
import { HttpStatus } from '@/app/lib/enums';
import { Bank } from '@/app/lib/types';

// Define validation schema for bank data
const bankSchema = z.object({
  account_number: z.string().min(1).max(30),
  bank_name: z.string().min(1).max(100),
  bank_branch: z.string().max(100).nullable().optional(),
  currency: z.string().max(3).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  is_default: z.boolean().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
});

type BankInput = z.infer<typeof bankSchema>;

/**
 * Helper function to create success responses
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

/**
 * GET /api/banks
 * Fetches all banks for the authenticated user's company
 */
export const GET = withUser(async (request: NextRequest) => {
  logInfo('GET /api/banks - Fetching banks');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const companyId = user!.companyId;

    logDebug(`Fetching banks for company: ${companyId}`);

    // Query the database for banks
    const banks: Bank[] = await prisma.ref_bank.findMany({
      where: { company_id: companyId },
      orderBy: [
        { is_active: 'desc' }, // Sort by is_active in descending order
        { is_default: 'desc' }, // Sort by is_default in descending order
        { account_number: 'asc' }, // Sort by account_number in ascending order
      ],
    });

    logInfo(`Found ${banks.length} banks for company ${companyId}`);

    // Return the banks
    return createSuccessResponse({ banks });
  } catch (error) {
    logError(`Error fetching banks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse('Failed to fetch banks', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/**
 * POST /api/banks
 * Creates a new bank for the authenticated user's company
 */
export const POST = withUser(async (request: NextRequest) => {
  logInfo('POST /api/banks - Creating new bank');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, userId } = user!;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = bankSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST);
    }

    const {
      account_number,
      bank_name,
      bank_branch,
      currency,
      description,
      is_default,
      is_active,
    }: BankInput = validationResult.data;

    // Check if bank already exists
    const existingBank = await prisma.ref_bank.findUnique({
      where: {
        company_id_account_number: {
          company_id: companyId,
          account_number: account_number,
        },
      },
    });

    if (existingBank) {
      return createErrorResponse(
        'Bank account number already exists for this company',
        HttpStatus.CONFLICT
      );
    }

    // If this bank is set as default, unset any existing default banks
    if (is_default) {
      await prisma.ref_bank.updateMany({
        where: {
          company_id: companyId,
          is_default: true,
        },
        data: {
          is_default: false,
          updated_at: new Date(),
          updated_by: userId,
        },
      });
    }

    // Create the new bank
    const newBank: Bank = await prisma.ref_bank.create({
      data: {
        company_id: companyId,
        account_number,
        bank_name,
        bank_branch,
        currency,
        description,
        is_default: is_default ?? false,
        is_active: is_active ?? true,
        created_at: new Date(),
        created_by: userId,
        updated_at: new Date(),
        updated_by: userId,
      },
    });

    logInfo(`Bank created: ${account_number} for company ${companyId}`);

    return createSuccessResponse({ bank: newBank }, HttpStatus.CREATED);
  } catch (error) {
    logError(`Error creating bank: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse('Failed to create bank', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/**
 * PUT /api/banks
 * Updates an existing bank for the authenticated user's company
 */
export const PUT = withUser(async (request: NextRequest) => {
  logInfo('PUT /api/banks - Updating bank');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, userId } = user!;

    // Parse request body
    const body = await request.json();
    const {
      account_number,
      bank_name,
      bank_branch,
      currency,
      description,
      is_default,
      is_active,
    }: BankInput = body;

    // Validate the bank data
    const validationResult = bankSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST);
    }

    // Check if the bank exists
    const existingBank = await prisma.ref_bank.findUnique({
      where: {
        company_id_account_number: {
          company_id: companyId,
          account_number: account_number,
        },
      },
    });

    if (!existingBank) {
      return createErrorResponse('Bank not found', HttpStatus.NOT_FOUND);
    }

    // If this bank is set as default, unset any existing default banks
    if (is_default) {
      await prisma.ref_bank.updateMany({
        where: {
          company_id: companyId,
          is_default: true,
          account_number: { not: account_number },
        },
        data: {
          is_default: false,
          updated_at: new Date(),
          updated_by: userId,
        },
      });
    }

    // Update the bank
    const updatedBank: Bank = await prisma.ref_bank.update({
      where: {
        company_id_account_number: {
          company_id: companyId,
          account_number: account_number,
        },
      },
      data: {
        bank_name,
        bank_branch,
        currency,
        description,
        is_default: is_default ?? false,
        is_active: is_active ?? true,
        updated_at: new Date(),
        updated_by: userId,
      },
    });

    logInfo(`Bank updated: ${account_number} for company ${companyId}`);

    return createSuccessResponse({ bank: updatedBank });
  } catch (error) {
    logError(`Error updating bank: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse('Failed to update bank', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/**
 * DELETE /api/banks
 * Deletes a bank from the authenticated user's company
 */
export const DELETE = withUser(async (request: NextRequest) => {
  logInfo('DELETE /api/banks - Deleting bank');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId } = user!;

    // Get account number from URL params
    const { searchParams } = new URL(request.url);
    const account_number = searchParams.get('account_number');

    if (!account_number) {
      return createErrorResponse('Account number is required', HttpStatus.BAD_REQUEST);
    }

    // Check if the bank exists
    const existingBank = await prisma.ref_bank.findUnique({
      where: {
        company_id_account_number: {
          company_id: companyId,
          account_number,
        },
      },
    });

    if (!existingBank) {
      return createErrorResponse('Bank not found', HttpStatus.NOT_FOUND);
    }

    // Delete the bank
    await prisma.ref_bank.delete({
      where: {
        company_id_account_number: {
          company_id: companyId,
          account_number,
        },
      },
    });

    logInfo(`Bank deleted: ${account_number} for company ${companyId}`);

    return createSuccessResponse({
      message: 'Bank deleted successfully',
    });
  } catch (error) {
    logError(`Error deleting bank: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse('Failed to delete bank', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/**
 * Counterparties API Route Handler
 *
 * Provides CRUD operations for counterparties (contacts) in the Carobar application.
 * All operations are secured and company-specific, ensuring proper data isolation.
 *
 * This file uses the generic reference data controller for standard operations
 * with a custom DELETE handler for relationship checks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/data';
import { createReferenceDataController } from '@/app/lib/apiUtils/referenceDataController';
import { withUser, getAuthUser } from '@/app/lib/auth';
import { createErrorResponse, HttpStatus } from '@/app/lib/errors';
import { logInfo, logError } from '@/app/lib/logging';
import { Role } from '@/app/lib/roles';

// Define validation schema for counterparty data
const counterpartySchema = z.object({
  code: z.string().min(1).max(25),
  name: z.string().max(100).nullable().optional(),
  address1: z.string().max(255).nullable().optional(),
  address2: z.string().max(255).nullable().optional(),
  address3: z.string().max(255).nullable().optional(),
  phone: z.string().max(25).nullable().optional(),
  mobile: z.string().max(25).nullable().optional(),
  fax: z.string().max(25).nullable().optional(),
  email: z.string().max(50).nullable().optional(),
  is_active: z.boolean().nullable().optional().default(true),
  comment: z.string().max(255).nullable().optional(),
  is_supplier: z.boolean().nullable().optional().default(false),
  is_buyer: z.boolean().nullable().optional().default(false),
  is_repair: z.boolean().nullable().optional().default(false),
  is_localtransport: z.boolean().nullable().optional().default(false),
  is_shipper: z.boolean().nullable().optional().default(false),
  is_journal: z.boolean().nullable().optional().default(false),
});

// Create the route handlers using the generic controller for standard operations
const counterpartyController = createReferenceDataController({
  modelName: 'ref_contact',
  entityName: 'Counterparty',
  responsePropName: 'counterparties',
  validationSchema: counterpartySchema,
  primaryKey: {
    field: 'code',
    compositeName: 'company_id_code',
    urlParamName: 'code',
  },
  orderByField: 'name',
  orderDirection: 'asc',
  allowedRoles: {
    read: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    create: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    update: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    delete: [Role.ADMIN, Role.MANAGER, Role.STAFF],
  },
  formatValue: (value) => value, // Keep original value (no uppercase conversion)
});

// Use the standard GET, POST, and PUT handlers from the controller
export const GET = counterpartyController.GET;
export const POST = counterpartyController.POST;
export const PUT = counterpartyController.PUT;

/**
 * Custom DELETE handler to check for relationships before deletion
 * This prevents deleting counterparties that are referenced in transactions
 */
export const DELETE = withUser(async (request: NextRequest) => {
  logInfo('DELETE /api/counterparties - Deleting counterparty');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, roleId } = user!;

    // Check role permissions
    if (![Role.ADMIN, Role.MANAGER, Role.STAFF].includes(roleId as Role)) {
      return createErrorResponse('Permission denied', HttpStatus.FORBIDDEN);
    }

    // Get code from URL params
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return createErrorResponse('Counterparty code is required', HttpStatus.BAD_REQUEST);
    }

    // Check if the counterparty exists
    const existingCounterparty = await prisma.ref_contact.findUnique({
      where: {
        company_id_code: { company_id: companyId, code },
      },
    });

    if (!existingCounterparty) {
      return createErrorResponse('Counterparty not found', HttpStatus.NOT_FOUND);
    }

    // Check if this counterparty is referenced in other tables
    const [vehiclePurchaseCount, vehicleSalesCount] = await Promise.all([
      prisma.vehicle_purchase.count({
        where: { company_id: companyId, supplier_code: code },
      }),
      prisma.vehicle_sales.count({
        where: { company_id: companyId, buyer_code: code },
      }),
    ]);

    if (vehiclePurchaseCount > 0 || vehicleSalesCount > 0) {
      return createErrorResponse(
        'This counterparty is used in transactions and cannot be deleted',
        HttpStatus.CONFLICT
      );
    }

    // Delete the counterparty
    await prisma.ref_contact.delete({
      where: {
        company_id_code: { company_id: companyId, code },
      },
    });

    logInfo(`Counterparty deleted: ${code} for company ${companyId}`);

    return NextResponse.json(
      { message: 'Counterparty deleted successfully' },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    logError(
      `Error deleting counterparty: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to delete counterparty', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

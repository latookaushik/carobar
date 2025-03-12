/**
 * Banks API Route Handler
 *
 * Provides CRUD operations for bank accounts in the Carobar application.
 * All operations are secured and company-specific, ensuring proper data isolation.
 *
 * This file uses the generic reference data controller pattern
 * for standard operations.
 */

import { z } from 'zod';
import { createReferenceDataController } from '@/app/lib/apiUtils/referenceDataController';
import { Role } from '@/app/lib/roles';

// Define validation schema for bank data
const bankSchema = z.object({
  account_number: z.string().min(1).max(30),
  bank_name: z.string().min(1).max(100),
  bank_branch: z.string().max(100).nullable().optional(),
  currency: z.string().min(1).max(3).nullable().optional().default('JPY'),
  description: z.string().max(500).nullable().optional(),
  is_default: z.boolean().nullable().optional().default(false),
  is_active: z.boolean().nullable().optional().default(true),
});

// Create the route handlers using the generic controller
const bankController = createReferenceDataController({
  modelName: 'ref_bank',
  entityName: 'Bank',
  responsePropName: 'banks',
  validationSchema: bankSchema,
  primaryKey: {
    field: 'account_number',
    compositeName: 'company_id_account_number',
  },
  allowedRoles: {
    read: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    create: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    update: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    delete: [Role.ADMIN, Role.MANAGER, Role.STAFF],
  },
});

// Export the route handlers
export const GET = bankController.GET;
export const POST = bankController.POST;
export const PUT = bankController.PUT;
export const DELETE = bankController.DELETE;

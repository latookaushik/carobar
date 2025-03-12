/**
 * Vehicle Maker Management API Routes
 *
 * Handles CRUD operations for vehicle maker management in Carobar.
 * Makers are company-specific and used in various vehicle-related forms.
 *
 * This file implements the API using the generic reference data controller
 * for standardized and consistent handling of reference data entities.
 */

import { z } from 'zod';
import { createReferenceDataController } from '@/app/lib/apiUtils/referenceDataController';
import { Role } from '@/app/lib/roles';

// Define validation schema for maker data
const makerSchema = z.object({
  name: z.string().min(1).max(100),
});

// Create the route handlers using the generic controller
const makerController = createReferenceDataController({
  // Model name in Prisma
  modelName: 'ref_maker',

  // Entity display name
  entityName: 'Maker',

  // Property name that contains records in the response
  responsePropName: 'makers',

  // Validation schema for this entity
  validationSchema: makerSchema,

  // Primary key field(s) configuration
  primaryKey: {
    // Field that combines with company_id for the composite key
    field: 'name',
    // Name of the composite key in Prisma
    compositeName: 'company_id_name',
  },

  // Roles allowed for different operations
  allowedRoles: {
    read: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    create: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    update: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    delete: [Role.ADMIN, Role.MANAGER, Role.STAFF],
  },

  // Optional: Function to format values (e.g., convert to uppercase)
  formatValue: (value: string) => value.trim().toUpperCase(),
});

// Export the route handlers
export const GET = makerController.GET;
export const POST = makerController.POST;
export const PUT = makerController.PUT;
export const DELETE = makerController.DELETE;

/**
 * Color Management API Routes
 *
 * Handles CRUD operations for color management in Carobar.
 * Colors are company-specific and used in various vehicle-related forms.
 *
 * This file implements the API using the generic reference data controller
 * for standardized and consistent handling of reference data entities.
 */

import { z } from 'zod';
import { createReferenceDataController } from '@/app/lib/apiUtils/referenceDataController';
import { Role } from '@/app/lib/roles';

// Define validation schema for color data
const colorSchema = z.object({
  color: z.string().min(1).max(50),
});

// Create the route handlers using the generic controller
const colorController = createReferenceDataController({
  // Model name in Prisma
  modelName: 'ref_color',

  // Entity display name
  entityName: 'Color',

  // Property name that contains records in the response
  responsePropName: 'colors',

  // Validation schema for this entity
  validationSchema: colorSchema,

  // Primary key field(s) configuration
  primaryKey: {
    // Field that combines with company_id for the composite key
    field: 'color',
    // Name of the composite key in Prisma
    compositeName: 'company_id_color',
  },

  // Roles allowed for different operations
  allowedRoles: {
    read: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    create: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    update: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    delete: [Role.ADMIN, Role.MANAGER, Role.STAFF],
  },
});

// Export the route handlers
export const GET = colorController.GET;
export const POST = colorController.POST;
export const PUT = colorController.PUT;
export const DELETE = colorController.DELETE;

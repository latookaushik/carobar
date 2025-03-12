/**
 * Country Management API Routes
 *
 * Handles CRUD operations for country management in Carobar.
 * Countries are company-specific and used in geographic reference.
 *
 * This file implements the API using the generic reference data controller
 * for standardized and consistent handling of reference data entities.
 */

import { z } from 'zod';
import { createReferenceDataController } from '@/app/lib/apiUtils/referenceDataController';
import { Role } from '@/app/lib/roles';

// Define validation schema for country data
const countrySchema = z.object({
  code: z.string().min(2).max(3),
  name: z.string().min(1).max(100),
  is_targetcountry: z.boolean().optional().default(false),
});

// Create the route handlers using the generic controller
const countryController = createReferenceDataController({
  // Model name in Prisma
  modelName: 'ref_country',

  // Entity display name
  entityName: 'Country',

  // Property name that contains records in the response
  responsePropName: 'countries',

  // Validation schema for this entity
  validationSchema: countrySchema,

  // Primary key field(s) configuration
  primaryKey: {
    // Field that combines with company_id for the composite key
    field: 'code',
    // Name of the composite key in Prisma
    compositeName: 'company_id_code',
  },

  // Field to order results by
  orderByField: 'name',

  // Order direction
  orderDirection: 'asc',

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
export const GET = countryController.GET;
export const POST = countryController.POST;
export const PUT = countryController.PUT;
export const DELETE = countryController.DELETE;

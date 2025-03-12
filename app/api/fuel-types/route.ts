/**
 * Fuel Type API Routes
 *
 * Handles operations for Fuel Type management in Carobar.
 * Currently read-only, but structured for potential future expansion.
 *
 * Note: This file includes commented code showing how to use the referenceDataController
 * pattern if CRUD operations are needed in the future.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/data';
import { withUser } from '@/app/lib/auth';
import { createErrorResponse, HttpStatus } from '@/app/lib/errors';
import { logInfo, logError, logDebug } from '@/app/lib/logging';

/**
 * Custom GET handler for fuel types, as they are not company-specific
 * unlike most other reference data
 */
export const GET = withUser(async () => {
  logInfo('GET /api/fuel-types - Fetching fuel types');

  try {
    // Authentication is still handled by withUser middleware
    // We don't need to access any request or user data for this endpoint

    logDebug('Fetching all fuel types (global)');

    // Query fuel types using Prisma
    const fuelTypes = await prisma.ref_fueltype.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    logInfo(`Found ${fuelTypes.length} fuel types`);

    // Return the fuel types
    return NextResponse.json({ fuelTypes });
  } catch (error) {
    logError(
      `Error fetching fuel types: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to fetch fuel types', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/* 
  FUTURE IMPLEMENTATION NOTE:
  
  If full CRUD functionality is needed in the future, implement using the 
  referenceDataController pattern like other reference data entities:

  1. Import these at the top:
     import { z } from 'zod';
     import { createReferenceDataController } from '@/app/lib/apiUtils/referenceDataController';
     import { Role } from '@/app/lib/enums';

  2. Create a validation schema:
     const fuelTypeSchema = z.object({
       name: z.string().min(1).max(50),
       description: z.string().max(250).nullable().optional(),
     });

  3. Create a controller instance:
     const fuelTypeController = createReferenceDataController({
       modelName: 'ref_fueltype',
       entityName: 'FuelType',
       responsePropName: 'fuelTypes',
       validationSchema: fuelTypeSchema,
       primaryKey: {
         field: 'name',
         compositeName: 'name', // Adjust if it becomes company-specific
       },
       allowedRoles: {
         read: [Role.ADMIN, Role.MANAGER, Role.STAFF],
         create: [Role.ADMIN, Role.MANAGER],
         update: [Role.ADMIN, Role.MANAGER],
         delete: [Role.ADMIN],
       },
     });

  4. Export the handlers:
     export const POST = fuelTypeController.POST;
     export const PUT = fuelTypeController.PUT;
     export const DELETE = fuelTypeController.DELETE;
*/

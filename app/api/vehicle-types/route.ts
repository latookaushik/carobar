/**
 * Vehicle Type Management API Routes
 *
 * Handles CRUD operations for vehicle type management in Carobar.
 * Vehicle types are company-specific and used in vehicle classification.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { z } from 'zod';
import { withUser, getAuthUser } from '@/app/lib/authMiddleware';
import { createErrorResponse,HttpStatus } from '@/app/lib/errorUtil';
import { logInfo, logError, logDebug } from '@/app/lib/logger';
import { Role } from '@/app/lib/enums';

// Define validation schema for vehicle type data
const vehicleTypeSchema = z.object({
  vehicle_type: z.string().min(1).max(100),
});

/**
 * Helper function to create success responses
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

// GET /api/vehicle-types - Get all vehicle types for the authenticated user's company
export const GET = withUser(async (request: NextRequest) => {
  logInfo('GET /api/vehicle-types - Fetching vehicle types');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const companyId = user!.companyId;

    logDebug(`Fetching vehicle types for company: ${companyId}`);

    // Query vehicle types for this company using Prisma
    const vehicleTypes = await prisma.ref_vehicle_type.findMany({
      where: {
        company_id: companyId,
      },
      orderBy: {
        vehicle_type: 'asc',
      },
    });

    logInfo(`Found ${vehicleTypes.length} vehicle types for company ${companyId}`);

    // Return the vehicle types
    return createSuccessResponse({ vehicleTypes });
  } catch (error) {
    logError(
      `Error fetching vehicle types: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to fetch vehicle types', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

// POST /api/vehicle-types - Create a new vehicle type
export const POST = withUser(async (request: NextRequest) => {
  logInfo('POST /api/vehicle-types - Creating new vehicle type');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, userId, roleId } = user!;

    // Check role permissions
    const allowedRoles = [Role.ADMIN, Role.MANAGER, Role.STAFF];
    if (!allowedRoles.includes(roleId as Role)) {
      return createErrorResponse('Permission denied', HttpStatus.FORBIDDEN);
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = vehicleTypeSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST);
    }

    const vType = validationResult.data.vehicle_type.trim().toUpperCase();

    // Check if vehicle type already exists for this company
    const existingType = await prisma.ref_vehicle_type.findUnique({
      where: {
        company_id_vehicle_type: {
          company_id: companyId,
          vehicle_type: vType,
        },
      },
    });

    if (existingType) {
      return createErrorResponse(
        'Vehicle type already exists for this company',
        HttpStatus.CONFLICT
      );
    }

    // Insert new vehicle type using Prisma
    const newType = await prisma.ref_vehicle_type.create({
      data: {
        company_id: companyId,
        vehicle_type: vType,
        created_by: userId,
        updated_by: userId,
      },
    });

    logInfo(`Vehicle type created: ${vType} for company ${companyId}`);

    return createSuccessResponse(
      { message: 'Vehicle type created successfully', vehicleType: newType },
      HttpStatus.CREATED
    );
  } catch (error) {
    logError(
      `Error creating vehicle type: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to create vehicle type', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

// PUT /api/vehicle-types - Update an existing vehicle type
export const PUT = withUser(async (request: NextRequest) => {
  logInfo('PUT /api/vehicle-types - Updating vehicle type');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, userId, roleId } = user!;

    // Check role permissions
    const allowedRoles = [Role.ADMIN, Role.MANAGER, Role.STAFF];
    if (!allowedRoles.includes(roleId as Role)) {
      return createErrorResponse('Permission denied', HttpStatus.FORBIDDEN);
    }

    // Parse and validate request body
    const body: { oldType: string; newType: string } = await request.json();
    const { oldType, newType } = body;

    if (!oldType || !newType) {
      return createErrorResponse('Both oldType and newType are required', HttpStatus.BAD_REQUEST);
    }

    // Validate new vehicle type
    const validationResult = vehicleTypeSchema.safeParse({ vehicle_type: newType });
    if (!validationResult.success) {
      return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST);
    }

    const formattedOldType = oldType.trim();
    const formattedNewType = newType.trim().toUpperCase();

    // Check if old vehicle type exists
    const existingType = await prisma.ref_vehicle_type.findUnique({
      where: {
        company_id_vehicle_type: {
          company_id: companyId,
          vehicle_type: formattedOldType,
        },
      },
    });

    if (!existingType) {
      return createErrorResponse('Vehicle type does not exist', HttpStatus.NOT_FOUND);
    }

    // Check if new vehicle type already exists (if different from old type)
    if (formattedOldType !== formattedNewType) {
      const newTypeExists = await prisma.ref_vehicle_type.findUnique({
        where: {
          company_id_vehicle_type: {
            company_id: companyId,
            vehicle_type: formattedNewType,
          },
        },
      });

      if (newTypeExists) {
        return createErrorResponse(
          'New vehicle type already exists for this company',
          HttpStatus.CONFLICT
        );
      }
    }

    // For composite key primary tables in Prisma, we need to delete and create
    // since we can't update the primary key directly
    await prisma.$transaction([
      // Delete the old vehicle type record
      prisma.ref_vehicle_type.delete({
        where: {
          company_id_vehicle_type: {
            company_id: companyId,
            vehicle_type: formattedOldType,
          },
        },
      }),
      // Create a new vehicle type record with the updated type
      prisma.ref_vehicle_type.create({
        data: {
          company_id: companyId,
          vehicle_type: formattedNewType,
          created_by: existingType.created_by,
          created_at: existingType.created_at,
          updated_by: userId,
          updated_at: new Date(),
        },
      }),
    ]);

    logInfo(
      `Vehicle type updated: ${formattedOldType} -> ${formattedNewType} for company ${companyId}`
    );

    return createSuccessResponse({
      message: 'Vehicle type updated successfully',
      type: formattedNewType,
    });
  } catch (error) {
    logError(
      `Error updating vehicle type: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to update vehicle type', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

// DELETE /api/vehicle-types - Delete a vehicle type
export const DELETE = withUser(async (request: NextRequest) => {
  logInfo('DELETE /api/vehicle-types - Deleting vehicle type');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, roleId } = user!;

    // Check role permissions
    const allowedRoles = [Role.ADMIN, Role.MANAGER];
    if (!allowedRoles.includes(roleId as Role)) {
      return createErrorResponse('Permission denied', HttpStatus.FORBIDDEN);
    }

    // Get vehicle type from URL parameters
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    if (!type) {
      return createErrorResponse('Vehicle type parameter is required', HttpStatus.BAD_REQUEST);
    }

    // Check if vehicle type exists
    const existingType = await prisma.ref_vehicle_type.findUnique({
      where: {
        company_id_vehicle_type: {
          company_id: companyId,
          vehicle_type: type,
        },
      },
    });

    if (!existingType) {
      return createErrorResponse('Vehicle type does not exist', HttpStatus.NOT_FOUND);
    }

    // Delete vehicle type using Prisma
    await prisma.ref_vehicle_type.delete({
      where: {
        company_id_vehicle_type: {
          company_id: companyId,
          vehicle_type: type,
        },
      },
    });

    logInfo(`Vehicle type deleted: ${type} for company ${companyId}`);

    return createSuccessResponse({ message: 'Vehicle type deleted successfully' });
  } catch (error) {
    logError(
      `Error deleting vehicle type: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to delete vehicle type', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

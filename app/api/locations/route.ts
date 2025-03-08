/**
 * Location Management API Routes
 *
 * Handles CRUD operations for vehicle location management in Carobar.
 * Locations are company-specific and used in various vehicle-related forms.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { z } from 'zod';
import { withUser, getAuthUser } from '@/app/lib/authMiddleware';
import { createErrorResponse,HttpStatus } from '@/app/lib/errorUtil';
import { logInfo, logError, logDebug } from '@/app/lib/logger';
import {  Role } from '@/app/lib/enums';

// Define validation schema for location data
const locationSchema = z.object({
  name: z.string().min(1).max(100),
});

/**
 * Helper function to create success responses
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

// GET /api/locations - Get all locations for the authenticated user's company
export const GET = withUser(async (request: NextRequest) => {
  logInfo('GET /api/locations - Fetching locations');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const companyId = user!.companyId;

    logDebug(`Fetching locations for company: ${companyId}`);

    // Query locations for this company using Prisma
    const locations = await prisma.ref_location.findMany({
      where: {
        company_id: companyId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    logInfo(`Found ${locations.length} locations for company ${companyId}`);

    // Return the locations
    return createSuccessResponse({ locations });
  } catch (error) {
    logError(
      `Error fetching locations: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to fetch locations', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

// POST /api/locations - Create a new location
export const POST = withUser(async (request: NextRequest) => {
  logInfo('POST /api/locations - Creating new location');

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
    const validationResult = locationSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST);
    }

    const locationName = validationResult.data.name.trim().toUpperCase();

    // Check if location already exists for this company
    const existingLocation = await prisma.ref_location.findUnique({
      where: {
        company_id_name: {
          company_id: companyId,
          name: locationName,
        },
      },
    });

    if (existingLocation) {
      return createErrorResponse('Location already exists for this company', HttpStatus.CONFLICT);
    }

    // Insert new location using Prisma
    const newLocation = await prisma.ref_location.create({
      data: {
        company_id: companyId,
        name: locationName,
        created_by: userId,
        updated_by: userId,
      },
    });

    logInfo(`Location created: ${locationName} for company ${companyId}`);

    return createSuccessResponse(
      { message: 'Location created successfully', location: newLocation },
      HttpStatus.CREATED
    );
  } catch (error) {
    logError(
      `Error creating location: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to create location', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

// PUT /api/locations - Update an existing location
export const PUT = withUser(async (request: NextRequest) => {
  logInfo('PUT /api/locations - Updating location');

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
    const body: { oldName: string; newName: string } = await request.json();
    const { oldName, newName } = body;

    if (!oldName || !newName) {
      return createErrorResponse('Both oldName and newName are required', HttpStatus.BAD_REQUEST);
    }

    // Validate new location name
    const validationResult = locationSchema.safeParse({ name: newName });
    if (!validationResult.success) {
      return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST);
    }

    const formattedOldName = oldName.trim();
    const formattedNewName = newName.trim().toUpperCase();

    // Check if old location exists
    const existingLocation = await prisma.ref_location.findUnique({
      where: {
        company_id_name: {
          company_id: companyId,
          name: formattedOldName,
        },
      },
    });

    if (!existingLocation) {
      return createErrorResponse('Location does not exist', HttpStatus.NOT_FOUND);
    }

    // Check if new location name already exists (if different from old name)
    if (formattedOldName !== formattedNewName) {
      const newNameExists = await prisma.ref_location.findUnique({
        where: {
          company_id_name: {
            company_id: companyId,
            name: formattedNewName,
          },
        },
      });

      if (newNameExists) {
        return createErrorResponse(
          'New location name already exists for this company',
          HttpStatus.CONFLICT
        );
      }
    }

    // For composite key primary tables in Prisma, we need to delete and create
    // since we can't update the primary key directly
    await prisma.$transaction([
      // Delete the old location record
      prisma.ref_location.delete({
        where: {
          company_id_name: {
            company_id: companyId,
            name: formattedOldName,
          },
        },
      }),
      // Create a new location record with the updated name
      prisma.ref_location.create({
        data: {
          company_id: companyId,
          name: formattedNewName,
          created_by: existingLocation.created_by,
          created_at: existingLocation.created_at,
          updated_by: userId,
          updated_at: new Date(),
        },
      }),
    ]);

    logInfo(
      `Location updated: ${formattedOldName} -> ${formattedNewName} for company ${companyId}`
    );

    return createSuccessResponse({
      message: 'Location updated successfully',
      name: formattedNewName,
    });
  } catch (error) {
    logError(
      `Error updating location: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to update location', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

// DELETE /api/locations - Delete a location
export const DELETE = withUser(async (request: NextRequest) => {
  logInfo('DELETE /api/locations - Deleting location');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, roleId } = user!;

    // Check role permissions
    const allowedRoles = [Role.ADMIN, Role.MANAGER];
    if (!allowedRoles.includes(roleId as Role)) {
      return createErrorResponse('Permission denied', HttpStatus.FORBIDDEN);
    }

    // Get location name from URL parameters
    const url = new URL(request.url);
    const name = url.searchParams.get('name');

    if (!name) {
      return createErrorResponse('Location name parameter is required', HttpStatus.BAD_REQUEST);
    }

    // Check if location exists
    const existingLocation = await prisma.ref_location.findUnique({
      where: {
        company_id_name: {
          company_id: companyId,
          name: name,
        },
      },
    });

    if (!existingLocation) {
      return createErrorResponse('Location does not exist', HttpStatus.NOT_FOUND);
    }

    // Delete location using Prisma
    await prisma.ref_location.delete({
      where: {
        company_id_name: {
          company_id: companyId,
          name: name,
        },
      },
    });

    logInfo(`Location deleted: ${name} for company ${companyId}`);

    return createSuccessResponse({ message: 'Location deleted successfully' });
  } catch (error) {
    logError(
      `Error deleting location: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to delete location', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

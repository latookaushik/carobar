/**
 * Vehicle Maker Management API Routes
 *
 * Handles CRUD operations for vehicle maker management in Carobar.
 * Makers are company-specific and used in various vehicle-related forms.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { z } from 'zod';
import { withUser, getAuthUser } from '@/app/lib/authMiddleware';
import { createErrorResponse, HttpStatus } from '@/app/lib/errorUtil';
import { logInfo, logError, logDebug } from '@/app/lib/logger';
import { Role } from '@/app/lib/enums';

// Define validation schema for maker data
const makerSchema = z.object({
  name: z.string().min(1).max(100),
});

/**
 * Helper function to create success responses
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

// GET /api/makers - Get all vehicle makers for the authenticated user's company
export const GET = withUser(async (request: NextRequest) => {
  logInfo('GET /api/makers - Fetching makers');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const companyId = user!.companyId;

    logDebug(`Fetching makers for company: ${companyId}`);

    // Query makers for this company using Prisma
    const makers = await prisma.ref_maker.findMany({
      where: {
        company_id: companyId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    logInfo(`Found ${makers.length} makers for company ${companyId}`);

    // Return the makers
    return createSuccessResponse({ makers });
  } catch (error) {
    logError(`Error fetching makers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse('Failed to fetch makers', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

// POST /api/makers - Create a new vehicle maker
export const POST = withUser(async (request: NextRequest) => {
  logInfo('POST /api/makers - Creating new maker');

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
    const validationResult = makerSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST);
    }

    const makerName = validationResult.data.name.trim().toUpperCase();

    // Check if maker already exists for this company
    const existingMaker = await prisma.ref_maker.findUnique({
      where: {
        company_id_name: {
          company_id: companyId,
          name: makerName,
        },
      },
    });

    if (existingMaker) {
      return createErrorResponse('Maker already exists for this company', HttpStatus.CONFLICT);
    }

    // Insert new maker using Prisma
    const newMaker = await prisma.ref_maker.create({
      data: {
        company_id: companyId,
        name: makerName,
        created_by: userId,
        updated_by: userId,
      },
    });

    logInfo(`Maker created: ${makerName} for company ${companyId}`);

    return createSuccessResponse(
      { message: 'Maker created successfully', maker: newMaker },
      HttpStatus.CREATED
    );
  } catch (error) {
    logError(`Error creating maker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse('Failed to create maker', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

// PUT /api/makers - Update an existing vehicle maker
export const PUT = withUser(async (request: NextRequest) => {
  logInfo('PUT /api/makers - Updating maker');

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

    // Validate new maker name
    const validationResult = makerSchema.safeParse({ name: newName });
    if (!validationResult.success) {
      return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST);
    }

    const formattedOldName = oldName.trim();
    const formattedNewName = newName.trim().toUpperCase();

    // Check if old maker exists
    const existingMaker = await prisma.ref_maker.findUnique({
      where: {
        company_id_name: {
          company_id: companyId,
          name: formattedOldName,
        },
      },
    });

    if (!existingMaker) {
      return createErrorResponse('Maker does not exist', HttpStatus.NOT_FOUND);
    }

    // Check if new maker name already exists (if different from old name)
    if (formattedOldName !== formattedNewName) {
      const newNameExists = await prisma.ref_maker.findUnique({
        where: {
          company_id_name: {
            company_id: companyId,
            name: formattedNewName,
          },
        },
      });

      if (newNameExists) {
        return createErrorResponse(
          'New maker name already exists for this company',
          HttpStatus.CONFLICT
        );
      }
    }

    // For composite key primary tables in Prisma, we need to delete and create
    // since we can't update the primary key directly
    await prisma.$transaction([
      // Delete the old maker record
      prisma.ref_maker.delete({
        where: {
          company_id_name: {
            company_id: companyId,
            name: formattedOldName,
          },
        },
      }),
      // Create a new maker record with the updated name
      prisma.ref_maker.create({
        data: {
          company_id: companyId,
          name: formattedNewName,
          created_by: existingMaker.created_by,
          created_at: existingMaker.created_at,
          updated_by: userId,
          updated_at: new Date(),
        },
      }),
    ]);

    logInfo(`Maker updated: ${formattedOldName} -> ${formattedNewName} for company ${companyId}`);

    return createSuccessResponse({
      message: 'Maker updated successfully',
      name: formattedNewName,
    });
  } catch (error) {
    logError(`Error updating maker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse('Failed to update maker', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

// DELETE /api/makers - Delete a vehicle maker
export const DELETE = withUser(async (request: NextRequest) => {
  logInfo('DELETE /api/makers - Deleting maker');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, roleId } = user!;

    // Check role permissions
    const allowedRoles = [Role.ADMIN, Role.MANAGER];
    if (!allowedRoles.includes(roleId as Role)) {
      return createErrorResponse('Permission denied', HttpStatus.FORBIDDEN);
    }

    // Get maker name from URL parameters
    const url = new URL(request.url);
    const name = url.searchParams.get('name');

    if (!name) {
      return createErrorResponse('Maker name parameter is required', HttpStatus.BAD_REQUEST);
    }

    // Check if maker exists
    const existingMaker = await prisma.ref_maker.findUnique({
      where: {
        company_id_name: {
          company_id: companyId,
          name: name,
        },
      },
    });

    if (!existingMaker) {
      return createErrorResponse('Maker does not exist', HttpStatus.NOT_FOUND);
    }

    // Delete maker using Prisma
    await prisma.ref_maker.delete({
      where: {
        company_id_name: {
          company_id: companyId,
          name: name,
        },
      },
    });

    logInfo(`Maker deleted: ${name} for company ${companyId}`);

    return createSuccessResponse({ message: 'Maker deleted successfully' });
  } catch (error) {
    logError(`Error deleting maker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse('Failed to delete maker', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

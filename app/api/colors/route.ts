/**
 * Color Management API Routes
 * 
 * Handles CRUD operations for color management in Carobar.
 * Colors are company-specific and used in various vehicle-related forms.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { z } from 'zod';
import { withUser, getAuthUser } from '@/app/lib/authMiddleware';
import { createErrorResponse } from '@/app/lib/errorUtil';
import { logInfo, logError, logDebug } from '@/app/lib/logger';
import { HttpStatus } from '@/app/lib/enums';

// Define validation schema for color data
const colorSchema = z.object({
  color: z.string().min(1).max(50)
});

/**
 * Helper function to create success responses
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

// GET /api/colors - Get all colors for the authenticated user's company
export const GET = withUser(async (request: NextRequest) => {
  logInfo('GET /api/colors - Fetching colors');
  
  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const companyId = user!.companyId;
    
    logDebug(`Fetching colors for company: ${companyId}`);

    // Query colors for this company using Prisma
    const colors = await prisma.ref_color.findMany({
      where: {
        company_id: companyId,
      },
      orderBy: {
        color: 'asc',
      },
    });
    
    logInfo(`Found ${colors.length} colors for company ${companyId}`);
    
    // Return the colors
    return createSuccessResponse({ colors });
  } catch (error) {
    logError(`Error fetching colors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse(
      'Failed to fetch colors',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});

// POST /api/colors - Create a new color
export const POST = withUser(async (request: NextRequest) => {
  logInfo('POST /api/colors - Creating new color');
  
  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, userId } = user!;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = colorSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        'Validation failed',
        HttpStatus.BAD_REQUEST
      );
    }

    const { color } = validationResult.data;

    // Check if color already exists for this company
    const existingColor = await prisma.ref_color.findUnique({
      where: {
        company_id_color: {
          company_id: companyId,
          color: color,
        },
      },
    });

    if (existingColor) {
      return createErrorResponse(
        'Color already exists for this company',
        HttpStatus.CONFLICT
      );
    }

    // Insert new color using Prisma
    await prisma.ref_color.create({
      data: {
        company_id: companyId,
        color: color,
        created_by: userId,
        updated_by: userId,
      },
    });
    
    logInfo(`Color created: ${color} for company ${companyId}`);

    return createSuccessResponse(
      { message: 'Color created successfully', color },
      HttpStatus.CREATED
    );
  } catch (error) {
    logError(`Error creating color: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse(
      'Failed to create color',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});

// PUT /api/colors - Update an existing color
export const PUT = withUser(async (request: NextRequest) => {
  logInfo('PUT /api/colors - Updating color');
  
  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, userId } = user!;

    // Parse and validate request body
    const body: { oldColor: string; newColor: string } = await request.json();
    const { oldColor, newColor } = body;

    if (!oldColor || !newColor) {
      return createErrorResponse(
        'Both oldColor and newColor are required',
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate new color
    const validationResult = colorSchema.safeParse({ color: newColor });
    if (!validationResult.success) {
      return createErrorResponse(
        'Validation failed',
        HttpStatus.BAD_REQUEST
      );
    }

    // Check if old color exists
    const existingColor = await prisma.ref_color.findUnique({
      where: {
        company_id_color: {
          company_id: companyId,
          color: oldColor,
        },
      },
    });

    if (!existingColor) {
      return createErrorResponse(
        'Color does not exist',
        HttpStatus.NOT_FOUND
      );
    }

    // Check if new color already exists (if different from old color)
    if (oldColor !== newColor) {
      const newColorExists = await prisma.ref_color.findUnique({
        where: {
          company_id_color: {
            company_id: companyId,
            color: newColor,
          },
        },
      });

      if (newColorExists) {
        return createErrorResponse(
          'New color already exists for this company',
          HttpStatus.CONFLICT
        );
      }
    }

    // For composite key primary tables in Prisma, we need to delete and create
    // since we can't update the primary key directly
    await prisma.$transaction([
      // Delete the old color record
      prisma.ref_color.delete({
        where: {
          company_id_color: {
            company_id: companyId,
            color: oldColor,
          },
        },
      }),
      // Create a new color record with the updated name
      prisma.ref_color.create({
        data: {
          company_id: companyId,
          color: newColor,
          created_by: existingColor.created_by,
          created_at: existingColor.created_at,
          updated_by: userId,
          updated_at: new Date(),
        },
      }),
    ]);
    
    logInfo(`Color updated: ${oldColor} -> ${newColor} for company ${companyId}`);

    return createSuccessResponse({ message: 'Color updated successfully', color: newColor });
  } catch (error) {
    logError(`Error updating color: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse(
      'Failed to update color',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});

// DELETE /api/colors - Delete a color
export const DELETE = withUser(async (request: NextRequest) => {
  logInfo('DELETE /api/colors - Deleting color');
  
  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId } = user!;

    // Get color from URL parameters
    const url = new URL(request.url);
    const color = url.searchParams.get('color');

    if (!color) {
      return createErrorResponse(
        'Color parameter is required',
        HttpStatus.BAD_REQUEST
      );
    }

    // Check if color exists
    const existingColor = await prisma.ref_color.findUnique({
      where: {
        company_id_color: {
          company_id: companyId,
          color: color,
        },
      },
    });

    if (!existingColor) {
      return createErrorResponse(
        'Color does not exist',
        HttpStatus.NOT_FOUND
      );
    }

    // Delete color using Prisma
    await prisma.ref_color.delete({
      where: {
        company_id_color: {
          company_id: companyId,
          color: color,
        },
      },
    });
    
    logInfo(`Color deleted: ${color} for company ${companyId}`);

    return createSuccessResponse({ message: 'Color deleted successfully' });
  } catch (error) {
    logError(`Error deleting color: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse(
      'Failed to delete color',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * Country Management API Routes
 *
 * Handles CRUD operations for country management in Carobar.
 * Countries are company-specific and used in geographic reference.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { z } from 'zod';
import { withUser, getAuthUser } from '@/app/lib/authMiddleware';
import { createErrorResponse,HttpStatus } from '@/app/lib/errorUtil';
import { logInfo, logError, logDebug } from '@/app/lib/logger';
import {  Role } from '@/app/lib/enums';

// Define validation schema for country data
const countrySchema = z.object({
  code: z.string().min(2).max(3),
  name: z.string().min(1).max(100),
  is_targetcountry: z.boolean().optional().default(false),
});

/**
 * Helper function to create success responses
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

// GET /api/countries - Get all countries for the authenticated user's company
export const GET = withUser(async (request: NextRequest) => {
  logInfo('GET /api/countries - Fetching countries');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const companyId = user!.companyId;

    logDebug(`Fetching countries for company: ${companyId}`);

    // Query countries for this company using Prisma
    const countries = await prisma.ref_country.findMany({
      where: {
        company_id: companyId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    logInfo(`Found ${countries.length} countries for company ${companyId}`);

    // Return the countries
    return createSuccessResponse({ countries });
  } catch (error) {
    logError(
      `Error fetching countries: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to fetch countries', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

// POST /api/countries - Create a new country
export const POST = withUser(async (request: NextRequest) => {
  logInfo('POST /api/countries - Creating new country');

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
    const validationResult = countrySchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST);
    }

    const { code, name, is_targetcountry } = validationResult.data;
    const formattedCode = code.trim().toUpperCase();
    const formattedName = name.trim().toUpperCase();

    // Check if country already exists for this company
    const existingCountry = await prisma.ref_country.findUnique({
      where: {
        company_id_code: {
          company_id: companyId,
          code: formattedCode,
        },
      },
    });

    if (existingCountry) {
      return createErrorResponse(
        'Country code already exists for this company',
        HttpStatus.CONFLICT
      );
    }

    // Insert new country using Prisma
    const newCountry = await prisma.ref_country.create({
      data: {
        company_id: companyId,
        code: formattedCode,
        name: formattedName,
        is_targetcountry: is_targetcountry || false,
        created_by: userId,
        updated_by: userId,
      },
    });

    logInfo(`Country created: ${formattedCode} for company ${companyId}`);

    return createSuccessResponse(
      { message: 'Country created successfully', country: newCountry },
      HttpStatus.CREATED
    );
  } catch (error) {
    logError(`Error creating country: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse('Failed to create country', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

// PUT /api/countries - Update an existing country
export const PUT = withUser(async (request: NextRequest) => {
  logInfo('PUT /api/countries - Updating country');

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
    const body: {
      code: string;
      name: string;
      is_targetcountry?: boolean;
    } = await request.json();

    const { code, name, is_targetcountry } = body;

    if (!code || !name) {
      return createErrorResponse('Both code and name are required', HttpStatus.BAD_REQUEST);
    }

    // Validate country data
    const validationResult = countrySchema.safeParse({
      code,
      name,
      is_targetcountry: is_targetcountry !== undefined ? is_targetcountry : false,
    });

    if (!validationResult.success) {
      return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST);
    }

    const formattedCode = code.trim().toUpperCase();
    const formattedName = name.trim().toUpperCase();

    // Check if country exists
    const existingCountry = await prisma.ref_country.findUnique({
      where: {
        company_id_code: {
          company_id: companyId,
          code: formattedCode,
        },
      },
    });

    if (!existingCountry) {
      return createErrorResponse('Country does not exist', HttpStatus.NOT_FOUND);
    }

    // Update country using Prisma
    const updatedCountry = await prisma.ref_country.update({
      where: {
        company_id_code: {
          company_id: companyId,
          code: formattedCode,
        },
      },
      data: {
        name: formattedName,
        is_targetcountry:
          is_targetcountry !== undefined ? is_targetcountry : existingCountry.is_targetcountry,
        updated_by: userId,
        updated_at: new Date(),
      },
    });

    logInfo(`Country updated: ${formattedCode} for company ${companyId}`);

    return createSuccessResponse({
      message: 'Country updated successfully',
      country: updatedCountry,
    });
  } catch (error) {
    logError(`Error updating country: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse('Failed to update country', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

// DELETE /api/countries - Delete a country
export const DELETE = withUser(async (request: NextRequest) => {
  logInfo('DELETE /api/countries - Deleting country');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, roleId } = user!;

    // Check role permissions
    const allowedRoles = [Role.ADMIN, Role.MANAGER];
    if (!allowedRoles.includes(roleId as Role)) {
      return createErrorResponse('Permission denied', HttpStatus.FORBIDDEN);
    }

    // Get country code from URL parameters
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return createErrorResponse('Country code parameter is required', HttpStatus.BAD_REQUEST);
    }

    const formattedCode = code.trim().toUpperCase();

    // Check if country exists
    const existingCountry = await prisma.ref_country.findUnique({
      where: {
        company_id_code: {
          company_id: companyId,
          code: formattedCode,
        },
      },
    });

    if (!existingCountry) {
      return createErrorResponse('Country does not exist', HttpStatus.NOT_FOUND);
    }

    // Delete country using Prisma
    await prisma.ref_country.delete({
      where: {
        company_id_code: {
          company_id: companyId,
          code: formattedCode,
        },
      },
    });

    logInfo(`Country deleted: ${formattedCode} for company ${companyId}`);

    return createSuccessResponse({ message: 'Country deleted successfully' });
  } catch (error) {
    logError(`Error deleting country: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return createErrorResponse('Failed to delete country', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

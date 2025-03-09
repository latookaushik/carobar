/**
 * Counterparties API Route Handler
 *
 * Provides CRUD operations for counterparties (contacts) in the Carobar application.
 * All operations are secured and company-specific, ensuring proper data isolation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { z } from 'zod';
import prisma from '@/app/lib/prisma';
import { withUser, getAuthUser } from '@/app/lib/authMiddleware';
import { createErrorResponse, HttpStatus } from '@/app/lib/errorUtil';
import { logInfo, logError, logDebug } from '@/app/lib/logger';

// Define validation schema for counterparty data
const counterpartySchema = z.object({
  code: z.string().min(1).max(25),
  name: z.string().max(100).nullable().optional(),
  address1: z.string().max(255).nullable().optional(),
  address2: z.string().max(255).nullable().optional(),
  address3: z.string().max(255).nullable().optional(),
  phone: z.string().max(25).nullable().optional(),
  mobile: z.string().max(25).nullable().optional(),
  fax: z.string().max(25).nullable().optional(),
  email: z.string().max(50).nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  comment: z.string().max(255).nullable().optional(),
  is_supplier: z.boolean().nullable().optional(),
  is_buyer: z.boolean().nullable().optional(),
  is_repair: z.boolean().nullable().optional(),
  is_localtransport: z.boolean().nullable().optional(),
  is_shipper: z.boolean().nullable().optional(),
  is_journal: z.boolean().nullable().optional(),
});

// For update operations
const updateCounterpartySchema = z.object({
  oldCode: z.string().min(1),
  newCode: z.string().min(1).max(25),
  name: z.string().max(100).nullable().optional(),
  address1: z.string().max(255).nullable().optional(),
  address2: z.string().max(255).nullable().optional(),
  address3: z.string().max(255).nullable().optional(),
  phone: z.string().max(25).nullable().optional(),
  mobile: z.string().max(25).nullable().optional(),
  fax: z.string().max(25).nullable().optional(),
  email: z.string().max(50).nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  comment: z.string().max(255).nullable().optional(),
  is_supplier: z.boolean().nullable().optional(),
  is_buyer: z.boolean().nullable().optional(),
  is_repair: z.boolean().nullable().optional(),
  is_localtransport: z.boolean().nullable().optional(),
  is_shipper: z.boolean().nullable().optional(),
  is_journal: z.boolean().nullable().optional(),
});

type CounterpartyInput = z.infer<typeof counterpartySchema>;
type UpdateCounterpartyInput = z.infer<typeof updateCounterpartySchema>;

/**
 * Helper function to create success responses with caching
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  const response = NextResponse.json(data, {
    status,
    headers: {
      // Add cache control headers to reduce database connections
      'Cache-Control': 'private, max-age=10', // Cache for 10 seconds on client side
      'Surrogate-Control': 'max-age=30', // Cache for 30 seconds on the CDN/Edge
    },
  });
  return response;
}

/**
 * Cached function to fetch counterparties
 * This reduces database connections by caching the result
 */
const getCounterpartiesForCompany = unstable_cache(
  async (companyId: string) => {
    logDebug(`Fetching counterparties for company: ${companyId} (with caching)`);

    return prisma.ref_contact.findMany({
      where: { company_id: companyId },
      orderBy: [
        { is_active: 'desc' }, // Active counterparties first
        { name: 'asc' }, // Then sort by name
      ],
    });
  },
  // Cache key generator - ensures unique cache per user/company
  ['counterparties-list'],
  // Cache options
  { tags: ['counterparties'], revalidate: 30 } // Cache for 30 seconds server-side
);

/**
 * GET /api/counterparties
 * Fetches all counterparties for the authenticated user's company
 * Uses caching to minimize database connections
 */
export const GET = withUser(async (request: NextRequest) => {
  logInfo('GET /api/counterparties - Fetching counterparties');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const companyId = user!.companyId;

    // Check request cache headers - if client has fresh data, return 304 Not Modified
    const ifNoneMatch = request.headers.get('if-none-match');
    const etag = `W/"counterparties-${companyId}"`;

    if (ifNoneMatch === etag) {
      // Use NextResponse instead of Response for type compatibility
      return NextResponse.json(null, {
        status: 304,
        headers: {
          ETag: etag,
          'Cache-Control': 'private, max-age=10',
        },
      });
    }

    // Use the cached function to fetch counterparties
    const counterparties = await getCounterpartiesForCompany(companyId);

    logInfo(`Found ${counterparties.length} counterparties for company ${companyId}`);

    // Create response with appropriate cache headers
    const response = createSuccessResponse({ counterparties });
    response.headers.set('ETag', etag);

    return response;
  } catch (error) {
    logError(
      `Error fetching counterparties: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to fetch counterparties', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/**
 * POST /api/counterparties
 * Creates a new counterparty for the authenticated user's company
 * Invalidates cache when new data is added
 */
export const POST = withUser(async (request: NextRequest) => {
  logInfo('POST /api/counterparties - Creating new counterparty');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, userId } = user!;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = counterpartySchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST);
    }

    const {
      code,
      name,
      address1,
      address2,
      address3,
      phone,
      mobile,
      fax,
      email,
      is_active,
      comment,
      is_supplier,
      is_buyer,
      is_repair,
      is_localtransport,
      is_shipper,
      is_journal,
    }: CounterpartyInput = validationResult.data;

    // Check if counterparty already exists
    const existingCounterparty = await prisma.ref_contact.findUnique({
      where: {
        company_id_code: {
          company_id: companyId,
          code: code,
        },
      },
    });

    if (existingCounterparty) {
      return createErrorResponse(
        'Counterparty code already exists for this company',
        HttpStatus.CONFLICT
      );
    }

    // Create the new counterparty
    const newCounterparty = await prisma.ref_contact.create({
      data: {
        company_id: companyId,
        code,
        name,
        address1,
        address2,
        address3,
        phone,
        mobile,
        fax,
        email,
        is_active: is_active ?? true,
        comment,
        is_supplier: is_supplier ?? false,
        is_buyer: is_buyer ?? false,
        is_repair: is_repair ?? false,
        is_localtransport: is_localtransport ?? false,
        is_shipper: is_shipper ?? false,
        is_journal: is_journal ?? false,
        created_at: new Date(),
        created_by: userId,
        updated_at: new Date(),
        updated_by: userId,
      },
    });

    logInfo(`Counterparty created: ${code} for company ${companyId}`);

    // Cache tags are not yet working perfectly in App Router, but this sets us up for future improvements
    // When fully supported, this will invalidate the cache for counterparties
    await unstable_cache(
      async () => {
        return true;
      }, // Return a Promise to satisfy TypeScript
      ['counterparties-list'],
      { tags: ['counterparties'] }
    )();

    return createSuccessResponse({ counterparty: newCounterparty }, HttpStatus.CREATED);
  } catch (error) {
    logError(
      `Error creating counterparty: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to create counterparty', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/**
 * PUT /api/counterparties
 * Updates an existing counterparty for the authenticated user's company
 * Invalidates cache when data is updated
 */
export const PUT = withUser(async (request: NextRequest) => {
  logInfo('PUT /api/counterparties - Updating counterparty');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId, userId } = user!;

    // Parse request body
    const body = await request.json();

    // Validate the counterparty data
    const validationResult = updateCounterpartySchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST);
    }

    const {
      oldCode,
      newCode,
      name,
      address1,
      address2,
      address3,
      phone,
      mobile,
      fax,
      email,
      is_active,
      comment,
      is_supplier,
      is_buyer,
      is_repair,
      is_localtransport,
      is_shipper,
      is_journal,
    }: UpdateCounterpartyInput = validationResult.data;

    // Check if the counterparty exists
    const existingCounterparty = await prisma.ref_contact.findUnique({
      where: {
        company_id_code: {
          company_id: companyId,
          code: oldCode,
        },
      },
    });

    if (!existingCounterparty) {
      return createErrorResponse('Counterparty not found', HttpStatus.NOT_FOUND);
    }

    // If code is being changed, check if new code already exists
    if (oldCode !== newCode) {
      const codeExists = await prisma.ref_contact.findUnique({
        where: {
          company_id_code: {
            company_id: companyId,
            code: newCode,
          },
        },
      });

      if (codeExists) {
        return createErrorResponse('New counterparty code already exists', HttpStatus.CONFLICT);
      }
    }

    // Update the counterparty
    // If code is changed, we need to delete and recreate
    if (oldCode !== newCode) {
      // Start a transaction
      const updatedCounterparty = await prisma.$transaction(async (tx) => {
        // Delete old record
        await tx.ref_contact.delete({
          where: {
            company_id_code: {
              company_id: companyId,
              code: oldCode,
            },
          },
        });

        // Create new record with updated data
        return tx.ref_contact.create({
          data: {
            company_id: companyId,
            code: newCode,
            name,
            address1,
            address2,
            address3,
            phone,
            mobile,
            fax,
            email,
            is_active: is_active ?? true,
            comment,
            is_supplier: is_supplier ?? false,
            is_buyer: is_buyer ?? false,
            is_repair: is_repair ?? false,
            is_localtransport: is_localtransport ?? false,
            is_shipper: is_shipper ?? false,
            is_journal: is_journal ?? false,
            created_at: existingCounterparty.created_at,
            created_by: existingCounterparty.created_by,
            updated_at: new Date(),
            updated_by: userId,
          },
        });
      });

      logInfo(
        `Counterparty updated with code change: ${oldCode} -> ${newCode} for company ${companyId}`
      );

      // Invalidate cache
      await unstable_cache(
        async () => {
          return true;
        }, // Return a Promise to satisfy TypeScript
        ['counterparties-list'],
        { tags: ['counterparties'] }
      )();

      return createSuccessResponse({ counterparty: updatedCounterparty });
    } else {
      // Simple update without code change
      const updatedCounterparty = await prisma.ref_contact.update({
        where: {
          company_id_code: {
            company_id: companyId,
            code: oldCode,
          },
        },
        data: {
          name,
          address1,
          address2,
          address3,
          phone,
          mobile,
          fax,
          email,
          is_active: is_active ?? true,
          comment,
          is_supplier: is_supplier ?? false,
          is_buyer: is_buyer ?? false,
          is_repair: is_repair ?? false,
          is_localtransport: is_localtransport ?? false,
          is_shipper: is_shipper ?? false,
          is_journal: is_journal ?? false,
          updated_at: new Date(),
          updated_by: userId,
        },
      });

      logInfo(`Counterparty updated: ${oldCode} for company ${companyId}`);

      // Invalidate cache
      await unstable_cache(
        async () => {
          return true;
        }, // Return a Promise to satisfy TypeScript
        ['counterparties-list'],
        { tags: ['counterparties'] }
      )();

      return createSuccessResponse({ counterparty: updatedCounterparty });
    }
  } catch (error) {
    logError(
      `Error updating counterparty: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to update counterparty', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/**
 * DELETE /api/counterparties
 * Deletes a counterparty from the authenticated user's company
 * Invalidates cache when data is deleted
 */
export const DELETE = withUser(async (request: NextRequest) => {
  logInfo('DELETE /api/counterparties - Deleting counterparty');

  try {
    // Get the authenticated user from the request
    const user = getAuthUser(request);
    const { companyId } = user!;

    // Get code from URL params
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return createErrorResponse('Counterparty code is required', HttpStatus.BAD_REQUEST);
    }

    // Check if the counterparty exists
    const existingCounterparty = await prisma.ref_contact.findUnique({
      where: {
        company_id_code: {
          company_id: companyId,
          code,
        },
      },
    });

    if (!existingCounterparty) {
      return createErrorResponse('Counterparty not found', HttpStatus.NOT_FOUND);
    }

    // Check if this counterparty is referenced in other tables
    // This is a simplified check - in a real application, you might need to check more tables
    const vehiclePurchaseCount = await prisma.vehicle_purchase.count({
      where: {
        company_id: companyId,
        supplier_code: code,
      },
    });

    const vehicleSalesCount = await prisma.vehicle_sales.count({
      where: {
        company_id: companyId,
        buyer_code: code,
      },
    });

    if (vehiclePurchaseCount > 0 || vehicleSalesCount > 0) {
      return createErrorResponse(
        'This counterparty is used in transactions and cannot be deleted',
        HttpStatus.CONFLICT
      );
    }

    // Delete the counterparty
    await prisma.ref_contact.delete({
      where: {
        company_id_code: {
          company_id: companyId,
          code,
        },
      },
    });

    logInfo(`Counterparty deleted: ${code} for company ${companyId}`);

    // Invalidate cache
    await unstable_cache(
      async () => {
        return true;
      }, // Return a Promise to satisfy TypeScript
      ['counterparties-list'],
      { tags: ['counterparties'] }
    )();

    return createSuccessResponse({
      message: 'Counterparty deleted successfully',
    });
  } catch (error) {
    logError(
      `Error deleting counterparty: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return createErrorResponse('Failed to delete counterparty', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/**
 * Reference Data Controller Factory
 *
 * A utility for creating standardized CRUD endpoints for reference data entities.
 * This factory generates route handlers that follow consistent patterns for:
 * - Authentication and authorization
 * - Validation
 * - Error handling
 * - Logging
 * - Data retrieval and manipulation
 *
 * This reduces code duplication across reference data API routes and ensures
 * consistent behavior and error handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/data';
import { z } from 'zod';
import { withUser, getAuthUser } from '@/app/lib/auth';
import { createErrorResponse, HttpStatus } from '@/app/lib/errors';
import { logInfo, logError, logDebug } from '@/app/lib/logging';
import { Role } from '@/app/lib/roles';

/**
 * Configuration for a reference data entity
 */
export interface ReferenceDataConfig<T> {
  // Model name in Prisma (e.g., 'ref_maker')
  modelName: string;

  // Entity display name (e.g., 'Maker')
  entityName: string;

  // Property name that contains records in the response (e.g., 'makers')
  responsePropName: string;

  // Validation schema for this entity
  validationSchema: z.ZodType<T>;

  // Primary key field(s) configuration
  primaryKey: {
    // Field that combines with company_id for the composite key (e.g., 'name')
    field: string;

    // Name of the composite key in Prisma (e.g., 'company_id_name')
    compositeName: string;

    // Optional: URL query parameter name for DELETE operations (defaults to the primary key field)
    // For example, if field is 'vehicle_type' but URLs use '?type=X', set urlParamName to 'type'
    urlParamName?: string;
  };

  // Field to order results by (defaults to primary key field)
  orderByField?: string;

  // Order direction (asc or desc)
  orderDirection?: 'asc' | 'desc';

  // Roles allowed for different operations
  allowedRoles: {
    read: Role[];
    create: Role[];
    update: Role[];
    delete: Role[];
  };

  // Function to format values (e.g., convert to uppercase)
  formatValue?: (value: string) => string;
}

/**
 * Helper function to create success responses
 */
function createSuccessResponse<T>(data: T, status: number = HttpStatus.OK) {
  return NextResponse.json(data, { status });
}

/**
 * Creates a set of route handlers for a reference data entity
 *
 * @param config Configuration for the reference data entity
 * @returns Object containing handlers for GET, POST, PUT, and DELETE requests
 */
/**
 * Represents a record type with string-indexed properties of various types
 */
export type ReferenceDataRecord = Record<
  string,
  string | number | boolean | Date | null | undefined
>;

/**
 * Creates a set of route handlers for a reference data entity
 *
 * @param config Configuration for the reference data entity
 * @returns Object containing handlers for GET, POST, PUT, and DELETE requests
 */
export function createReferenceDataController<T extends ReferenceDataRecord>(
  config: ReferenceDataConfig<T>
) {
  const {
    modelName,
    entityName,
    responsePropName,
    validationSchema,
    primaryKey,
    allowedRoles,
    orderByField = primaryKey.field,
    orderDirection = 'asc',
    formatValue = (value: string) => value.trim().toUpperCase(),
  } = config;

  // Get prisma model dynamically
  const getModel = () => {
    const model = prisma[modelName as keyof typeof prisma];
    if (!model) {
      throw new Error(`Model '${modelName}' does not exist in Prisma client`);
    }
    return model as unknown as PrismaModelType;
  };

  // Types for Prisma operations with better type safety
  interface WhereClause {
    company_id?: string;
    [key: string]: string | number | boolean | Date | object | undefined;
  }

  interface OrderByClause {
    [key: string]: 'asc' | 'desc';
  }

  interface FindManyArgs {
    where?: WhereClause;
    orderBy?: OrderByClause;
  }

  interface FindUniqueArgs {
    where: {
      [key: string]: {
        company_id: string;
        [key: string]: string;
      };
    };
  }

  interface CreateArgs {
    data: {
      company_id: string;
      created_by?: string;
      updated_by?: string;
      created_at?: Date;
      updated_at?: Date;
      [key: string]: string | number | boolean | Date | undefined;
    };
  }

  interface DeleteArgs {
    where: {
      [key: string]: {
        company_id: string;
        [key: string]: string;
      };
    };
  }

  // Type for Prisma model with common operations
  type PrismaModelType = {
    findMany: (args: FindManyArgs) => Promise<T[]>;
    findUnique: (args: FindUniqueArgs) => Promise<T | null>;
    create: (args: CreateArgs) => Promise<T>;
    delete: (args: DeleteArgs) => Promise<T>;
  };

  // Create a where clause for the composite primary key
  const createCompositeKeyFilter = (companyId: string, value: string) => ({
    [primaryKey.compositeName]: {
      company_id: companyId,
      [primaryKey.field]: value,
    },
  });

  // GET handler - List all records
  const GET = withUser(async (request: NextRequest) => {
    logInfo(`GET /api/${responsePropName} - Fetching ${responsePropName}`);

    try {
      // Get the authenticated user from the request
      const user = getAuthUser(request);
      const { companyId, roleId } = user!;

      // Check role permissions
      if (!allowedRoles.read.includes(roleId as Role)) {
        return createErrorResponse('Permission denied', HttpStatus.FORBIDDEN);
      }

      logDebug(`Fetching ${responsePropName} for company: ${companyId}`);

      // Query records for this company using Prisma
      const model = getModel();
      const records = await model.findMany({
        where: {
          company_id: companyId,
        },
        orderBy: {
          [orderByField]: orderDirection,
        },
      });

      logInfo(`Found ${records.length} ${responsePropName} for company ${companyId}`);

      // Return the records
      return createSuccessResponse({ [responsePropName]: records });
    } catch (error) {
      logError(
        `Error fetching ${responsePropName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return createErrorResponse(
        `Failed to fetch ${responsePropName}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  });

  // POST handler - Create a new record
  const POST = withUser(async (request: NextRequest) => {
    logInfo(`POST /api/${responsePropName} - Creating new ${entityName.toLowerCase()}`);

    try {
      // Get the authenticated user from the request
      const user = getAuthUser(request);
      const { companyId, userId, roleId } = user!;

      // Check role permissions
      if (!allowedRoles.create.includes(roleId as Role)) {
        return createErrorResponse('Permission denied', HttpStatus.FORBIDDEN);
      }

      // Parse and validate request body
      const body = await request.json();
      const validationResult = validationSchema.safeParse(body);

      if (!validationResult.success) {
        return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST, {
          errors: validationResult.error.format(),
        });
      }

      // Get the primary key value and format it
      const primaryKeyValue = validationResult.data[primaryKey.field];
      // Ensure the value is a string before formatting
      const stringValue = String(primaryKeyValue);
      const formattedValue = formatValue(stringValue);

      // Check if record already exists for this company
      const model = getModel();
      const existingRecord = await model.findUnique({
        where: createCompositeKeyFilter(companyId, formattedValue),
      });

      if (existingRecord) {
        return createErrorResponse(
          `${entityName} already exists for this company`,
          HttpStatus.CONFLICT
        );
      }

      // Insert new record using Prisma
      const data = {
        company_id: companyId,
        ...validationResult.data,
        [primaryKey.field]: formattedValue,
        created_by: userId,
        updated_by: userId,
      };

      const newRecord = await model.create({ data });

      logInfo(`${entityName} created: ${formattedValue} for company ${companyId}`);

      return createSuccessResponse(
        {
          message: `${entityName} created successfully`,
          [responsePropName.slice(0, -1)]: newRecord,
        },
        HttpStatus.CREATED
      );
    } catch (error) {
      logError(
        `Error creating ${entityName.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return createErrorResponse(
        `Failed to create ${entityName.toLowerCase()}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  });

  // PUT handler - Update an existing record
  const PUT = withUser(async (request: NextRequest) => {
    logInfo(`PUT /api/${responsePropName} - Updating ${entityName.toLowerCase()}`);

    try {
      // Get the authenticated user from the request
      const user = getAuthUser(request);
      const { companyId, userId, roleId } = user!;

      // Check role permissions
      if (!allowedRoles.update.includes(roleId as Role)) {
        return createErrorResponse('Permission denied', HttpStatus.FORBIDDEN);
      }

      // Parse request body for update
      const body = await request.json();
      const oldRecord = body[`old${entityName}`];
      const newRecord = body[`new${entityName}`];

      if (!oldRecord || !newRecord) {
        return createErrorResponse(
          `Both old${entityName} and new${entityName} required`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate the new record data
      const validationResult = validationSchema.safeParse(newRecord);
      if (!validationResult.success) {
        return createErrorResponse('Validation failed', HttpStatus.BAD_REQUEST, {
          errors: validationResult.error.format(),
        });
      }

      // Get primary key values
      const oldPrimaryKeyValue = oldRecord[primaryKey.field];
      const newPrimaryKeyValue = newRecord[primaryKey.field];

      if (!oldPrimaryKeyValue || !newPrimaryKeyValue) {
        return createErrorResponse(
          `${primaryKey.field} is required in both old and new records`,
          HttpStatus.BAD_REQUEST
        );
      }

      const formattedOldValue = formatValue(String(oldPrimaryKeyValue));
      const formattedNewValue = formatValue(String(newPrimaryKeyValue));

      // Check if old record exists
      const model = getModel();
      const existingRecord = await model.findUnique({
        where: createCompositeKeyFilter(companyId, formattedOldValue),
      });

      if (!existingRecord) {
        return createErrorResponse(`${entityName} does not exist`, HttpStatus.NOT_FOUND);
      }

      // Check if new value already exists (if primary key is changing)
      if (formattedOldValue !== formattedNewValue) {
        const newValueExists = await model.findUnique({
          where: createCompositeKeyFilter(companyId, formattedNewValue),
        });

        if (newValueExists) {
          return createErrorResponse(
            `New ${entityName.toLowerCase()} already exists for this company`,
            HttpStatus.CONFLICT
          );
        }
      }

      // For composite key primary tables in Prisma, we need to delete and create
      // since we can't update the primary key directly
      await prisma.$transaction(async (tx) => {
        // Use transaction client to perform operations
        const txModel = tx[modelName as keyof typeof tx] as unknown as PrismaModelType;

        // Delete the old record
        await txModel.delete({
          where: createCompositeKeyFilter(companyId, formattedOldValue),
        });

        // Create a new record with all the updated fields
        const validatedData = validationResult.data;

        // Prepare data for the new record, merging validated data with required fields
        const newData = {
          company_id: companyId,
          ...validatedData,
          [primaryKey.field]: formattedNewValue,
          created_by: existingRecord.created_by as string | undefined,
          created_at: existingRecord.created_at as Date | undefined,
          updated_by: userId,
          updated_at: new Date(),
        };

        await txModel.create({
          data: newData,
        });

        // Return the result of the transaction
        return { success: true };
      });

      logInfo(
        `${entityName} updated: ${formattedOldValue} -> ${formattedNewValue} for company ${companyId}`
      );

      return createSuccessResponse({
        message: `${entityName} updated successfully`,
        [responsePropName.slice(0, -1)]: {
          ...validationResult.data,
          [primaryKey.field]: formattedNewValue,
          company_id: companyId,
          updated_by: userId,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      logError(
        `Error updating ${entityName.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return createErrorResponse(
        `Failed to update ${entityName.toLowerCase()}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  });

  // DELETE handler - Delete a record
  const DELETE = withUser(async (request: NextRequest) => {
    logInfo(`DELETE /api/${responsePropName} - Deleting ${entityName.toLowerCase()}`);

    try {
      // Get the authenticated user from the request
      const user = getAuthUser(request);
      const { companyId, roleId } = user!;

      // Check role permissions
      if (!allowedRoles.delete.includes(roleId as Role)) {
        return createErrorResponse('Permission denied', HttpStatus.FORBIDDEN);
      }

      // Get value from URL parameters
      const url = new URL(request.url);
      // Use the configured URL parameter name or fall back to the primary key field name
      const paramName = primaryKey.urlParamName || primaryKey.field;
      const value = url.searchParams.get(paramName);

      if (!value) {
        return createErrorResponse(`${paramName} parameter is required`, HttpStatus.BAD_REQUEST);
      }

      // Check if record exists
      const model = getModel();
      const existingRecord = await model.findUnique({
        where: createCompositeKeyFilter(companyId, value),
      });

      if (!existingRecord) {
        return createErrorResponse(`${entityName} does not exist`, HttpStatus.NOT_FOUND);
      }

      // Delete record using Prisma
      await model.delete({
        where: createCompositeKeyFilter(companyId, value),
      });

      logInfo(`${entityName} deleted: ${value} for company ${companyId}`);

      return createSuccessResponse({ message: `${entityName} deleted successfully` });
    } catch (error) {
      logError(
        `Error deleting ${entityName.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return createErrorResponse(
        `Failed to delete ${entityName.toLowerCase()}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  });

  return {
    GET,
    POST,
    PUT,
    DELETE,
  };
}

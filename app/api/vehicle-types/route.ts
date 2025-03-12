/**
 * Vehicle Type Management API Routes
 *
 * Handles CRUD operations for vehicle type management in Carobar.
 * Vehicle types are company-specific and used in vehicle classification.
 *
 * This file implements the API using the generic reference data controller
 * for standardized and consistent handling of reference data entities.
 */

import { z } from 'zod';
import { createReferenceDataController } from '@/app/lib/apiUtils/referenceDataController';
import { Role } from '@/app/lib/roles';
import { logDebug } from '@/app/lib/logging';

// Define validation schema for vehicle type data
const vehicleTypeSchema = z.object({
  vehicle_type: z.string().min(1).max(100),
});

// Create the route handlers using the generic controller
const vehicleTypeController = createReferenceDataController({
  // Model name in Prisma
  modelName: 'ref_vehicle_type',

  // Entity display name
  entityName: 'Type',

  // Property name that contains records in the response
  responsePropName: 'vehicleTypes',

  // Validation schema for this entity
  validationSchema: vehicleTypeSchema,

  // Primary key field(s) configuration
  primaryKey: {
    // Field that combines with company_id for the composite key
    field: 'vehicle_type',
    // Name of the composite key in Prisma
    compositeName: 'company_id_vehicle_type',
  },

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

import { NextRequest } from 'next/server';

// Custom PUT handler to handle both property naming formats
export const PUT = async (request: NextRequest) => {
  try {
    // Parse request body
    const body = await request.json();

    // Check if we need to adapt the property names
    const adapted = { ...body };

    // If the request has oldVehicleType/newVehicleType but not oldType/newType,
    // create those properties for compatibility
    if (body.oldVehicleType && !body.oldType) {
      adapted.oldType = body.oldVehicleType;
    }

    if (body.newVehicleType && !body.newType) {
      adapted.newType = body.newVehicleType;
    }

    // Log to debug what we're receiving and sending
    logDebug(`Original vehicle type update request body: ${JSON.stringify(body)}`);
    logDebug(`Adapted vehicle type update request body: ${JSON.stringify(adapted)}`);

    // Call the controller directly with the current request and adapted body
    // Create a modified request with our adapted body
    const modifiedRequest = new NextRequest(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(adapted),
    });

    // Use the original controller with the modified request
    return vehicleTypeController.PUT(modifiedRequest);
  } catch (error) {
    console.error('Error in custom PUT handler:', error);
    return new Response(JSON.stringify({ error: 'Failed to process vehicle type update' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Export the other route handlers directly
export const GET = vehicleTypeController.GET;
export const POST = vehicleTypeController.POST;
export const DELETE = vehicleTypeController.DELETE;

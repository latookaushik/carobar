# API Route Standardization

This document outlines the standardized approach for implementing API routes in the Carobar application, with a specific focus on reference data endpoints. It provides guidance for developers on how to utilize the generic controller pattern to ensure consistency and reduce code duplication.

## 1. Introduction

Previously, our API routes contained significant amounts of duplicate logic, especially for reference data entities (makers, vehicle types, colors, etc.). Each route implemented similar CRUD operations with only entity-specific differences, leading to:

- Code duplication
- Inconsistent error handling
- Maintenance challenges
- Difficulty onboarding new developers

To address these issues, we've implemented a generic reference data controller factory that standardizes the implementation of these routes.

## 2. Generic Reference Data Controller

The generic controller is implemented in:

```
/app/lib/apiUtils/referenceDataController.ts
```

This utility provides a factory function that generates standardized CRUD endpoints for reference data entities, handling:

- Authentication and authorization
- Input validation
- Error handling
- Logging
- Database operations

### 2.1 Key Benefits

- **Reduced Code Duplication**: Route files reduced from ~100 lines to ~40 lines
- **Consistency**: Uniform validation, error handling, and response formats
- **Type Safety**: Improved TypeScript types throughout
- **Maintainability**: Easier to understand and extend
- **Developer Experience**: Simple pattern to follow for new reference data endpoints

## 3. Controller Configuration

The controller factory accepts a configuration object that defines the entity-specific details:

```typescript
interface ReferenceDataConfig<T> {
  // Model name in Prisma (e.g., 'ref_maker')
  modelName: string;

  // Entity display name (e.g., 'Maker')
  entityName: string;

  // Property name for response objects (e.g., 'makers')
  responsePropName: string;

  // Validation schema for this entity
  validationSchema: z.ZodType<T>;

  // Primary key field(s) configuration
  primaryKey: {
    // Field that combines with company_id for the composite key
    field: string;

    // Name of the composite key in Prisma
    compositeName: string;

    // Optional: URL query parameter name for DELETE operations
    // For example, if field is 'vehicle_type' but URLs use '?type=X', set urlParamName to 'type'
    urlParamName?: string;
  };

  // Optional field to order results by (defaults to primary key field)
  orderByField?: string;

  // Optional order direction (asc or desc)
  orderDirection?: 'asc' | 'desc';

  // Roles allowed for different operations
  allowedRoles: {
    read: Role[];
    create: Role[];
    update: Role[];
    delete: Role[];
  };

  // Optional function to format values (e.g., convert to uppercase)
  formatValue?: (value: string) => string;
}
```

## 4. Implementing a Reference Data Route

To implement a reference data route using the generic controller:

### 4.1 Basic Implementation Steps

1. Create a validation schema using Zod
2. Configure the controller with appropriate model information
3. Export the generated route handlers

### 4.2 Example Implementation

```typescript
/**
 * Vehicle Maker API Routes
 *
 * This file implements the API using the generic reference data controller
 * for standardized handling of reference data entities.
 */

import { z } from 'zod';
import { createReferenceDataController } from '@/app/lib/apiUtils/referenceDataController';
import { Role } from '@/app/lib/enums';

// 1. Define validation schema
const makerSchema = z.object({
  name: z.string().min(1).max(100),
});

// 2. Create the route handlers using the generic controller
const makerController = createReferenceDataController({
  modelName: 'ref_maker',
  entityName: 'Maker',
  responsePropName: 'makers',
  validationSchema: makerSchema,
  primaryKey: {
    field: 'name',
    compositeName: 'company_id_name',
  },
  allowedRoles: {
    read: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    create: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    update: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    delete: [Role.ADMIN, Role.MANAGER],
  },
  formatValue: (value: string) => value.trim().toUpperCase(),
});

// 3. Export the route handlers
export const GET = makerController.GET;
export const POST = makerController.POST;
export const PUT = makerController.PUT;
export const DELETE = makerController.DELETE;
```

### 4.3 Example with Custom URL Parameter

For cases where the URL query parameter needs to be different from the field name:

```typescript
const vehicleTypeController = createReferenceDataController({
  modelName: 'ref_vehicle_type',
  entityName: 'Type',
  responsePropName: 'vehicleTypes',
  validationSchema: vehicleTypeSchema,
  primaryKey: {
    field: 'vehicle_type',
    compositeName: 'company_id_vehicle_type',
    urlParamName: 'type', // For DELETE requests like /api/vehicle-types?type=VALUE
  },
  // ... other configuration
});
```

## 5. API Endpoint Behavior

The generated endpoints follow these conventions:

### 5.1 GET - List all records

- URL: `/api/{entity}`
- Authorization: Checks against `allowedRoles.read`
- Filters by current user's company
- Orders by configured field
- Returns: `{ [responsePropName]: records }`

### 5.2 POST - Create a new record

- URL: `/api/{entity}`
- Authorization: Checks against `allowedRoles.create`
- Body: Validates against the provided schema
- Checks for duplicates before creation
- Returns: `{ message: "Entity created successfully", [entityName]: newRecord }`

### 5.3 PUT - Update a record

- URL: `/api/{entity}`
- Authorization: Checks against `allowedRoles.update`
- Body: Requires `oldEntityName` and `newEntityName`
- Uses transaction to handle composite key update
- Returns: `{ message: "Entity updated successfully", [primaryKey.field]: formattedNewValue }`

### 5.4 DELETE - Delete a record

- URL: `/api/{entity}?{paramName}={value}` where `paramName` is either:
  - `primaryKey.urlParamName` if specified, or
  - `primaryKey.field` by default
- Authorization: Checks against `allowedRoles.delete`
- Uses URL query parameter to specify record
- Returns: `{ message: "Entity deleted successfully" }`

## 6. Error Handling

The controller provides consistent error handling:

- **400 Bad Request**: Validation failures
- **401 Unauthorized**: Authentication issues
- **403 Forbidden**: Permission/role issues
- **404 Not Found**: Entity not found
- **409 Conflict**: Duplicate entries
- **500 Internal Server Error**: Unexpected errors

Error responses follow the format:

```json
{
  "error": "Error message",
  "details": { ... } // Optional additional details
}
```

## 7. Current Implementations

This pattern has been implemented for:

- `/app/api/makers/route.ts`
- `/app/api/vehicle-types/route.ts`
- `/app/api/colors/route.ts`

## 8. Adding New Reference Data Routes

When adding a new reference data endpoint:

1. Identify the Prisma model name (e.g., `ref_entity`)
2. Determine the primary key field and composite key name
3. Create a validation schema using Zod
4. Set up the controller with appropriate role permissions
5. Export the route handlers

## 9. Client-Side Integration

When implementing client-side components that work with these endpoints:

- For `PUT` requests, use the format:

  ```json
  { "oldEntityName": "OLD_VALUE", "newEntityName": "NEW_VALUE" }
  ```

  where `EntityName` is the value specified in the `entityName` configuration

- For `DELETE` requests, use query parameter format:
  ```
  /api/entity?paramName=value
  ```
  where `paramName` is:
  - The value specified in `primaryKey.urlParamName` if defined, or
  - The value specified in `primaryKey.field` by default

## 10. Extending the Controller

If additional functionality is needed beyond the standard CRUD operations:

1. Create a new route file that imports from the standard controller
2. Use the standard implementations for basic operations
3. Add custom handlers for specialized operations

## 11. Best Practices

- Always use Zod schemas for validation
- Provide descriptive entity names
- Use uppercase for standardized values when appropriate
- Follow the role permission patterns consistently
- Keep validation schemas focused on the essential fields
- When client code expects a different URL parameter name for DELETE, use the `urlParamName` option

By following this standardized approach, we ensure consistency across the API, reduce code duplication, and make the codebase more maintainable for all developers.

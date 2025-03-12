# Carobar Library Code Refactoring Plan

This document outlines a comprehensive plan to refactor the library code to reduce duplication, improve organization, and create a more maintainable codebase.

## Main Issues Identified

1. **Token/Authentication Duplication**: Authentication logic is split across `jwtUtil.ts` and `refreshToken.ts` with overlapping functionality
2. **Role Management Fragmentation**: Role-related code is scattered across `roleUtils.ts`, `helpers.ts`, and `enums.ts`
3. **Date/Time Utilities Duplication**: Date formatting functions are duplicated in multiple files
4. **Type Definition Fragmentation**: Types are defined in both `types.ts` and `referenceDataService.ts`
5. **Reference Data Service Complexity**: `referenceDataService.ts` is handling too many entity types
6. **Error Handling Inconsistencies**: Different files use different error handling patterns
7. **Logger Usage Variation**: Different logging patterns and message formats across the codebase

## Proposed Directory Structure

```
app/lib/
  ├── auth/                      # Authentication module
  │   ├── index.ts               # Main exports
  │   ├── jwt.ts                 # JWT utilities (server-side)
  │   ├── client.ts              # Client-side auth utilities
  │   └── middleware.ts          # Auth middleware functions
  │
  ├── roles/                     # Role management module
  │   ├── index.ts               # Main exports
  │   ├── types.ts               # Role type definitions
  │   └── permissions.ts         # Permission checking utilities
  │
  ├── utils/                     # Utility functions
  │   ├── index.ts               # Main exports
  │   ├── dateTime.ts            # Date/time formatting utilities
  │   ├── formatting.ts          # General formatting utilities
  │   └── validation.ts          # Validation utilities
  │
  ├── data/                      # Data access layer
  │   ├── index.ts               # Main exports
  │   ├── prisma.ts              # Prisma client
  │   ├── cache.ts               # Caching service
  │   └── reference/             # Reference data services
  │       ├── index.ts           # Main exports
  │       ├── countries.ts       # Country-specific operations
  │       ├── counterparties.ts  # Counterparty-specific operations
  │       └── ...                # Other entity-specific files
  │
  ├── errors/                    # Error handling
  │   ├── index.ts               # Main exports
  │   ├── http.ts                # HTTP error utilities
  │   └── handling.ts            # Error handling patterns
  │
  ├── logging/                   # Logging utilities
  │   ├── index.ts               # Main exports
  │   └── formatters.ts          # Log message formatters
  │
  └── types/                     # Type definitions
      ├── index.ts               # Main exports
      ├── entities.ts            # Entity type definitions
      └── api.ts                 # API-related type definitions
```

## Detailed Refactoring Steps

### 1. Authentication Module Consolidation

**Current Issues:**

- `jwtUtil.ts` contains both client and server-side JWT operations
- `refreshToken.ts` duplicates token refresh logic
- `authMiddleware.ts` depends heavily on `jwtUtil.ts`

**Solutions:**

- Create an `auth` directory with specialized modules
- Move server-side JWT operations to `auth/jwt.ts`
- Move client-side token operations to `auth/client.ts`
- Move middleware functions to `auth/middleware.ts`
- Create a unified API in `auth/index.ts`

### 2. Role Management Consolidation

**Current Issues:**

- `roleUtils.ts` defines `RoleType` and `ROLES` objects
- `helpers.ts` has `CheckRoles` with duplicate role definitions
- `enums.ts` has a `Role` enum that overlaps with both

**Solutions:**

- Create a `roles` directory with specialized modules
- Merge all role type definitions into `roles/types.ts`
- Move permission checking to `roles/permissions.ts`
- Create a unified API in `roles/index.ts`

### 3. Date/Time Utilities Consolidation

**Current Issues:**

- `utils.ts` has `toTimeStamp` for date formatting
- `helpers.ts` has three date formatting functions

**Solutions:**

- Create a `utils/dateTime.ts` module
- Merge all date formatting functions with consistent naming
- Export from `utils/index.ts`

### 4. Type Definitions Consolidation

**Current Issues:**

- `types.ts` has a `Bank` type definition
- `referenceDataService.ts` redefines many entity types

**Solutions:**

- Create a `types/entities.ts` module for all entity types
- Create a `types/api.ts` module for API-related types
- Export everything from `types/index.ts`

### 5. Reference Data Service Splitting

**Current Issues:**

- `referenceDataService.ts` handles many different entity types
- Code is difficult to maintain due to size and complexity

**Solutions:**

- Create a `data/reference` directory
- Split into entity-specific modules (countries, counterparties, etc.)
- Create a facade in `data/reference/index.ts` to maintain the current API
- Gradually migrate consumers to use the specific modules

### 6. Error Handling Standardization

**Current Issues:**

- Inconsistent error handling patterns across files
- Some use try/catch while others return direct error responses

**Solutions:**

- Enhance `errors/http.ts` with standardized HTTP response creation
- Create `errors/handling.ts` with patterns for common error scenarios
- Update all modules to use the standardized patterns

### 7. Logging Standardization

**Current Issues:**

- Inconsistent logging patterns
- Different message formats across modules

**Solutions:**

- Enhance `logging/index.ts` with more structured logging capabilities
- Create `logging/formatters.ts` for standardized message formatting
- Update all logging calls to use the standard format

## Implementation Strategy

This refactoring should be implemented incrementally to avoid disruption:

1. Start with the creation of the new directory structure
2. Implement auth consolidation first, as it affects security
3. Gradually refactor each area with full test coverage
4. Update documentation as changes are made
5. Monitor performance and fix any issues that arise

## Expected Benefits

- **Reduced Duplication**: Elimination of redundant code
- **Improved Organization**: Logical grouping of related functionality
- **Better Maintainability**: Smaller, more focused modules
- **Enhanced Type Safety**: Consistent type definitions
- **Clearer Responsibility**: Each module has a single responsibility
- **Easier Onboarding**: Well-structured code is easier for new developers to understand

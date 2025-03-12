# Carobar Library Code Migration Guide

This document provides a step-by-step guide for migrating existing code to use the new modular library structure.

## Overview of Changes

The codebase has been refactored to improve organization, reduce duplication, and enhance maintainability through a more modular structure:

| Old Structure           | New Structure            | Description                                      |
| ----------------------- | ------------------------ | ------------------------------------------------ |
| `lib/authMiddleware.ts` | `lib/auth/middleware.ts` | Auth middleware refactored into dedicated module |
| `lib/jwtUtil.ts`        | `lib/auth/jwt.ts`        | JWT utilities in dedicated module                |
| `lib/refreshToken.ts`   | `lib/auth/client.ts`     | Client-side auth utilities                       |
| `lib/roleUtils.ts`      | `lib/roles/`             | Role management in dedicated module              |
| `lib/errorUtil.ts`      | `lib/errors/`            | Error handling utilities                         |
| `lib/logger.ts`         | `lib/logging/`           | Logging utilities                                |
| `lib/cacheService.ts`   | `lib/data/cache.ts`      | Cache service in data module                     |
| `lib/prisma.ts`         | `lib/data/prisma.ts`     | Prisma client in data module                     |
| `lib/types.ts`          | `lib/types/`             | Type definitions split into entity and API types |

## Import Path Migration Guide

Update your imports according to the following patterns:

### Authentication & Authorization

**Old:**

```typescript
import { withUser, getAuthUser } from '@/app/lib/authMiddleware';
import { refreshAccessToken } from '@/app/lib/refreshToken';
import { verifyToken, createToken, createRefreshToken } from '@/app/lib/jwtUtil';
import { JWTPayload } from '@/app/lib/jwtUtil';
```

**New:**

```typescript
import {
  withUser,
  getAuthUser,
  refreshAccessToken,
  verifyToken,
  createToken,
  createRefreshToken,
  JWTPayload,
} from '@/app/lib/auth';
```

> **⚠️ Important Changes:**
>
> 1. The `JWTPayload` type has been moved to `@/app/lib/auth` and should be imported from there.
> 2. The `createRefreshToken` function has been moved from `jwtUtil.ts` to the auth module.
>
> **Full Authentication API:**
>
> The auth module now provides a unified API for all authentication-related functionality:
>
> ```typescript
> // Server-side JWT utilities (from jwt.ts)
> createToken(); // Creates a JWT access token for a user
> createRefreshToken(); // Creates a JWT refresh token for a user
> verifyToken(); // Verifies a JWT token and returns the payload
>
> // Client-side utilities (from client.ts)
> refreshAccessToken(); // Makes API request to get a new access token using refresh token
> isAuthenticated(); // Checks if the current user is authenticated
> logout(); // Logs the user out by clearing tokens
>
> // API route middleware (from middleware.ts)
> withUser(); // Protects routes for authenticated users
> withSuperAdmin(); // Protects routes for admins only
> getAuthUser(); // Gets the authenticated user from the request
>
> // Type definitions
> JWTPayload; // Structure of JWT payload
> ```
>
> **Important Notes on Authentication Functions:**
>
> **1. JWT Token Function Separation:**
> There are three different refresh token related functions that serve different purposes:
>
> - `createRefreshToken`: **Server-side** function that generates a new JWT refresh token (used during login)
> - `refreshAccessTokenFromRefreshToken`: **Server-side** function that creates a new access token from a refresh token (used in API routes)
> - `refreshAccessToken`: **Client-side** function that makes an API request to exchange a refresh token for a new access token (used in React components)
>
> **2. Client-Server Compatibility:**
> The auth module is designed to work in both server and browser environments:
>
> - Server-side code has access to environment variables like `JWT_SECRET`
> - Browser-side code provides mock implementations that work without server-only dependencies
> - This allows importing the same functions in both contexts without errors
>
> **Migration Note:**
>
> - If you're importing `refreshAccessToken` from `@/app/lib/refreshToken` in server-side code (API routes), you should replace it with `refreshAccessTokenFromRefreshToken` from `@/app/lib/auth`
> - If you're importing `refreshAccessToken` in client-side code, continue using that name but import from `@/app/lib/auth`

### Role Management

**Old:**

```typescript
import { getRoles, hasRole } from '@/app/lib/roleUtils';
import { CheckRoles } from '@/app/lib/auth'; // Sometimes role constants were in auth
```

**New:**

```typescript
import { UserRoles, hasRole, isAdmin, RoleType, CheckRoles } from '@/app/lib/roles';
```

> **⚠️ Important Type Change:** The `hasRole` function now requires `RoleType[]` instead of `string[]`. You'll need to update your component props and function parameters accordingly:
>
> ```typescript
> // Old
> interface Props {
>   requiredRoles?: string[];
> }
>
> // New
> import { RoleType } from '@/app/lib/roles';
>
> interface Props {
>   requiredRoles?: RoleType[];
> }
>
> // And when using empty arrays, cast them:
> const roles = [] as RoleType[];
> ```

### Error Handling

**Old:**

```typescript
import { createErrorResponse, HttpStatus } from '@/app/lib/errorUtil';
```

**New:**

```typescript
import { createErrorResponse, createSuccessResponse, HttpStatus } from '@/app/lib/errors';
```

### Logging

**Old:**

```typescript
import { logInfo, logError, logDebug } from '@/app/lib/logger';
```

**New:**

```typescript
import { logInfo, logError, logDebug } from '@/app/lib/logging';
```

### Data Access

**Old:**

```typescript
import prisma from '@/app/lib/prisma';
import { getFromCache, setInCache } from '@/app/lib/cacheService';
import { getOrFetchData } from '@/app/lib/cacheService_bk';
```

**New:**

```typescript
import { prisma, getFromCache, setInCache, getOrFetchData } from '@/app/lib/data';
```

> **⚠️ Important Cache Function Note:**  
> All cache-related functions have been moved to the data module:
>
> - If you're importing from `@/app/lib/cacheService`, update to `@/app/lib/data`
> - If you're importing from `@/app/lib/cacheService_bk`, also update to `@/app/lib/data`
>
> The new data module exports all cache functions: `getFromCache`, `setInCache`, `clearCacheKey`, `getOrFetchData`, and `clearAllCache`.

### Type Definitions

**Old:**

```typescript
import { Bank, User, PaginatedResponse } from '@/app/lib/types';
```

**New:**

```typescript
import { Bank, User } from '@/app/lib/types'; // Entity types
import { PaginatedResponse } from '@/app/lib/types'; // API types
```

### Utilities

**Old:**

```typescript
import { toTimeStamp, formatDateYYYYMMDD } from '@/app/lib/utils';
```

**New:**

```typescript
import { toTimeStamp, formatDateYYYYMMDD, formatCurrency } from '@/app/lib/utils';
```

## Removal Plan for Redundant Files

Once all imports have been migrated to the new structure, the following files can be safely removed:

1. `app/lib/authMiddleware.ts`
2. `app/lib/refreshToken.ts`
3. `app/lib/jwtUtil.ts`
4. `app/lib/roleUtils.ts`
5. `app/lib/cacheService.ts`
6. `app/lib/cacheService_bk.ts` (if exists)
7. `app/lib/prisma.ts`
8. `app/lib/errorUtil.ts`
9. `app/lib/logger.ts`
10. `app/lib/types.ts`
11. `app/lib/utils.ts`

## API Route Migration Example

**Old:**

```typescript
import prisma from '@/app/lib/prisma';
import { withUser, getAuthUser } from '@/app/lib/authMiddleware';
import { createErrorResponse, HttpStatus } from '@/app/lib/errorUtil';
import { logInfo, logError } from '@/app/lib/logger';

export const GET = withUser(async (request) => {
  // Route logic
});
```

**New:**

```typescript
import { prisma } from '@/app/lib/data';
import { withUser, getAuthUser } from '@/app/lib/auth';
import { createErrorResponse, createSuccessResponse, HttpStatus } from '@/app/lib/errors';
import { logInfo, logError } from '@/app/lib/logging';

export const GET = withUser(async (request) => {
  // Route logic
});
```

## Component Migration Example

**Old:**

```typescript
import { refreshAccessToken } from '@/app/lib/refreshToken';
import { hasRole } from '@/app/lib/roleUtils';

// Component code
```

**New:**

```typescript
import { refreshAccessToken } from '@/app/lib/auth';
import { hasRole, UserRoles } from '@/app/lib/roles';

// Component code
```

## Post-Migration Verification

After migrating all imports and removing redundant files, run the following checks:

1. Ensure all TypeScript type checking passes (`tsc --noEmit`)
2. Run ESLint to catch any missed imports (`eslint .`)
3. Run tests to ensure functionality still works
4. Start the development server and verify application functionality

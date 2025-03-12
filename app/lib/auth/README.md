# Authentication Module

This module provides a comprehensive authentication system for the Carobar application. It has been refactored to improve organization, type safety, and code reuse.

## Structure

- **jwt.ts**: Server-side JWT token creation, verification, and management
- **client.ts**: Client-side authentication utilities for refresh and token handling
- **middleware.ts**: API route middleware for protecting endpoints
- **index.ts**: Unified API for the entire auth module

## Migration Examples

### Before (Old Pattern)

```typescript
// API routes
import { withUser } from '@/app/lib/authMiddleware';
import { createErrorResponse } from '@/app/lib/errorUtil';

// Protected API route
export const GET = withUser(async (request) => {
  // Route logic here
});

// Client-side
import { refreshAccessToken } from '@/app/lib/refreshToken';
import { JWTPayload } from '@/app/lib/jwtUtil';

async function handleApiCall() {
  const response = await fetch('/api/data');
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the request
    }
  }
}
```

### After (New Pattern)

```typescript
// API routes
import { withUser, createErrorResponse } from '@/app/lib/auth';

// Protected API route
export const GET = withUser(async (request) => {
  // Route logic here
});

// Client-side
import { refreshAccessToken, handleTokenExpiration, JWTPayload } from '@/app/lib/auth';

async function handleApiCall() {
  const response = await fetch('/api/data');

  // Use the token expiration handler to automatically retry requests
  const result = await handleTokenExpiration(response, () => {
    return fetch('/api/data');
  });

  if (result) {
    // Handle successful response
  } else {
    // Handle error or unauthorized
  }
}
```

## Key Features

### Role-Based Access Control

```typescript
import { withAuth, Roles } from '@/app/lib/auth';

// Only allow super admins
export const GET = withAuth(handler, {
  requiredRoles: [Roles.SUPER_ADMIN],
});

// Allow both admins and managers
export const POST = withAuth(handler, {
  requiredRoles: [Roles.SUPER_ADMIN, Roles.COMPANY_ADMIN],
});

// Any authenticated user
export const PUT = withAuth(handler);

// Public endpoint
export const DELETE = withAuth(handler, { public: true });
```

### Client-Side Utilities

```typescript
import { isAuthenticated, logout, refreshAccessToken } from '@/app/lib/auth';

// Check if user is authenticated
const authStatus = await isAuthenticated();

// Handle logout
await logout();

// Refresh token if needed
await refreshAccessToken();
```

## Benefits of the New Structure

1. **Reduced Duplication**: Authentication code is consolidated in one module
2. **Type Safety**: Improved TypeScript typing for better error detection
3. **Clearer API**: Unified import statement for all auth functionality
4. **Easier Testing**: Separated components can be tested in isolation
5. **Better Maintainability**: Smaller, focused files with clear responsibilities

# Carobar Codebase Documentation

## Project Overview

Carobar is a SAAS/Web application for used car traders, with a focus on the Japanese market. The application is built using Next.js and follows a modern, modular architecture.

## Application Structure

### Authentication & Authorization

The application implements role-based access control with three main user types:

- Public (non-authenticated)
- Car Company Users (authenticated)
  - CA: Company Admin (elevated privileges)
  - CU: Standard Company User
- Super Admin (SA: Carobar administrators)

### Directory Structure

#### `/app`

Main application directory following Next.js 15+ conventions.

##### `/app/api`

API routes handling server-side logic:

- `login/route.ts`: Handles user authentication
- `protected.ts`: Protected route example with authentication middleware
- `verifyToken/route.ts`: Token verification endpoint
- `/master/*`: Master data management endpoints (makers, locations, etc.)

##### `/app/lib`

Core utilities and shared functionality:

- `prisma.ts`: Central Prisma client instance
- `auth.ts`: Authentication utilities
- `jwtUtil.ts`: JWT token management
- `errorUtil.ts`: Standardized error responses
- `logger.ts`: Logging utilities
- `config.ts`: Configuration management
- `requireAuth.ts`: Authentication middleware
- `authMiddleware.ts`: Role-based access control

##### `/app/components`

Reusable React components:

- `Login.tsx`: Authentication UI
- `Auth/AuthStatus.tsx`: User authentication status display
- Various UI components (buttons, cards, dialogs, etc.)

##### `/app/hooks`

Custom React hooks:

- `useLogin.ts`: Authentication logic hook
- `useAuthStatus.ts`: Authentication state management

##### `/app/dashboard`

Dashboard-related components and layouts for authenticated users.

##### `/app/master`

Master data management interface.

##### `/app/vehicles`

Vehicle-related functionality.

##### `/app/finance`

Financial management features.

##### `/app/settings`

Application settings and configuration UI.

### Key Features

#### Authentication Flow

1. User submits credentials via Login component
2. Credentials verified in login/route.ts
3. JWT token generated and stored
4. Protected routes check token via middleware

#### Role-Based Access

- Company-specific dashboard using company_id context
- Role-based feature access (CA vs CU vs SA)
- Protected API routes with role verification

#### Master Data Management

Centralized management of:

- Vehicle Types
- Makers
- Locations
- Invoice Terms
- Fuel Types
- Countries
- Colors
- Banks

### Technical Implementation

#### Database

- Uses Prisma ORM for database operations
- Centralized Prisma client instance in app/lib/prisma.ts

#### Security

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based access control
- Secure cookie handling

#### Error Handling

- Centralized error utilities
- Standardized error responses
- Comprehensive logging

### Best Practices

- Modular architecture
- Centralized configurations
- Type safety with TypeScript
- Consistent import paths using @/app/lib
- Reusable components and hooks
- Standardized API responses

## Development Guidelines

### Import Conventions

Use `@/app/lib` for importing utilities:

```typescript
import { someUtil } from '@/app/lib/utilName';
```

### Authentication Implementation

When implementing protected routes:

1. Import necessary middleware
2. Apply role-based checks
3. Use proper error handling

### Error Handling

Use the centralized error utilities:

```typescript
import { createErrorResponse } from '@/app/lib/errorUtil';
```

### Logging

Utilize the logging utility for consistent logging:

```typescript
import { logInfo, logError } from '@/app/lib/logger';
```

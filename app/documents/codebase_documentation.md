# Carobar Codebase Documentation

This document provides a comprehensive overview of the Carobar application codebase structure, with each major file and its purpose.

## Application Structure

Carobar is a NextJS 15-based SaaS application for used car traders focusing on the Japanese market, with a multi-tenant architecture and role-based access control.

## Core Files and Components

### Root Configuration

| File | Purpose |
|------|---------|
| `package.json` | Project dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `postcss.config.js` | PostCSS configuration for Tailwind |

### Main Application Structure

| File/Directory | Purpose |
|----------------|---------|
| `app/layout.tsx` | Root layout component that wraps all pages |
| `app/page.tsx` | Home/landing page component |
| `app/providers.tsx` | Wraps application with context providers |
| `app/login/page.tsx` | Login page component |
| `app/login/Login.tsx` | Login form component |

### Authentication & Authorization

| File | Purpose |
|------|---------|
| `app/contexts/AuthContext.tsx` | Authentication context provider to manage user state, login/logout |
| `app/lib/auth.ts` | Authentication utility functions |
| `app/lib/jwtUtil.ts` | JWT token generation and validation |
| `app/lib/authMiddleware.ts` | Middleware for protecting API routes |
| `app/lib/requireAuth.ts` | Server-side authentication check |
| `app/lib/roleUtils.ts` | Utility functions for role-based access control |
| `app/components/Auth/AuthStatus.tsx` | Component to display authentication status |
| `app/components/Auth/ProtectedRoute.tsx` | Component to protect client-side routes |
| `app/api/login/route.ts` | API endpoint for user login |
| `app/api/verifyToken/route.ts` | API endpoint to verify JWT tokens |

### Layout & Navigation

| File | Purpose |
|------|---------|
| `app/components/Layout/Header.tsx` | Application header with navigation |
| `app/components/Layout/Navigation.tsx` | Navigation component with role-based menu items |
| `app/components/Layout/Footer.tsx` | Application footer |
| `app/components/Layout/Hero.tsx` | Hero section for landing page |
| `app/components/Layout/Features.tsx` | Features section for landing page |
| `app/components/Layout/MainContent.tsx` | Main content wrapper |
| `app/components/PageTemplate.tsx` | Template for authenticated pages with role-based access |
| `app/dashboard/layout.tsx` | Layout for dashboard pages |

### UI Components

| File | Purpose |
|------|---------|
| `app/components/ui/DataTable.tsx` | Reusable table component for displaying data |
| `app/components/ui/FilterPanel.tsx` | Component for filtering data |
| `app/components/ui/Pagination.tsx` | Pagination component for tables |
| `app/components/ui/StatCard.tsx` | Component for displaying statistics |
| `app/components/ui/StatusBadge.tsx` | Component for displaying status indicators |
| `app/components/ui/button.tsx` | Custom button component |
| `app/components/ui/input.tsx` | Custom input component |
| `app/components/ui/table.tsx` | Low-level table component |
| `app/components/ui/toast.tsx` | Toast notification component |
| `app/components/ui/toaster.tsx` | Toast notifications manager |
| `app/components/ui/use-toast.ts` | Hook for using toast notifications |

### API Routes

| File | Purpose |
|------|---------|
| `app/api/banks/route.ts` | API endpoints for bank CRUD operations |
| `app/api/colors/route.ts` | API endpoints for color CRUD operations |
| Additional API routes for other entities | CRUD operations for other reference data and transactions |

### Database & Prisma

| File | Purpose |
|------|---------|
| `app/lib/prisma.ts` | Prisma client setup as a singleton |
| `app/prisma/schema.prisma` | Prisma schema defining database models |

### Utility Functions

| File | Purpose |
|------|---------|
| `app/lib/errorUtil.ts` | Utility for consistent error responses |
| `app/lib/helpers.ts` | General helper functions |
| `app/lib/logger.ts` | Logging utility |
| `app/lib/utils.ts` | Miscellaneous utility functions |
| `app/lib/enums.ts` | Enum definitions |

### Dashboard Pages

| File | Purpose |
|------|---------|
| `app/dashboard/page.tsx` | Main dashboard page |
| `app/dashboard/ReferenceData/banks/page.tsx` | Bank management page |
| `app/dashboard/ReferenceData/colors/page.tsx` | Color management page |
| `app/dashboard/accounting/party-account/page.tsx` | Party account management |
| `app/dashboard/reports/vehicle-details/page.tsx` | Vehicle details report |
| `app/dashboard/transactions/purchase/page.tsx` | Purchase transactions page |

## Database Schema

The database schema follows a structured naming convention:

1. **Reference Tables**: Prefixed with `ref_`
   - `ref_bank` - Bank accounts
   - `ref_color` - Vehicle colors
   - `ref_companies` - Company information
   - `ref_contact` - Contact information (suppliers, buyers, etc.)
   - `ref_country` - Country codes and names
   - `ref_fueltype` - Fuel types
   - `ref_invoiceterms` - Invoice terms
   - `ref_location` - Vehicle locations
   - `ref_maker` - Vehicle makers
   - `ref_roles` - User roles (SA, CA, CU)
   - `ref_users` - User accounts
   - `ref_vehicle_type` - Vehicle types

2. **Transaction Tables**: Prefixed with `t_`
   - `t_banktrans` - Bank transactions
   - `t_journal_entry` - Journal entries for accounting

3. **Vehicle-related Tables**: Prefixed with `vehicle_`
   - `vehicle` - Main vehicle information
   - `vehicle_invoice` - Vehicle invoices
   - `vehicle_purchase` - Purchase transactions
   - `vehicle_sales` - Sales transactions
   - `vehicle_shipment` - Shipment information
   - `vehicle_shippinginstructions` - Shipping instructions
   - `vehicle_local_transport` - Local transport information
   - `vehicle_repair` - Repair information

## Implementation Patterns

1. **Authentication Flow**:
   - JWT token stored in cookies
   - Token verification in API routes
   - AuthContext for client-side auth state

2. **API Routes Pattern**:
   - Input validation with Zod
   - Token verification with middleware
   - Consistent error handling
   - Prisma queries with proper company_id filtering

3. **UI Components**:
   - Role-based access control with PageTemplate
   - Reusable UI components (DataTable, FilterPanel, etc.)
   - Consistent styling with Tailwind CSS

4. **Data Access Pattern**:
   - Prisma ORM for database access
   - Company-specific data filtering for multi-tenancy
   - Composite keys with company_id

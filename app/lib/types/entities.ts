/**
 * Entity Type Definitions
 *
 * This module provides centralized type definitions for all data entities
 * used throughout the application.
 */

/**
 * Bank entity
 */
export interface Bank {
  account_number: string;
  bank_name: string;
  bank_branch: string | null;
  currency: string | null;
  description: string | null;
  is_default: boolean | null;
  is_active: boolean | null;
  company_id?: string;
  created_at?: Date | string;
  created_by?: string;
  updated_at?: Date | string;
  updated_by?: string;
}

/**
 * Country entity
 */
export interface Country {
  code: string;
  name: string | null;
  is_targetcountry: boolean | null;
  company_id?: string;
  created_at?: Date | string;
  created_by?: string;
  updated_at?: Date | string;
  updated_by?: string;
}

/**
 * Counterparty entity
 */
export interface Counterparty {
  code: string;
  name: string | null;
  is_supplier: boolean | null;
  is_buyer: boolean | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state_province?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  contact_person?: string | null;
  tax_id?: string | null;
  is_active?: boolean | null;
  company_id?: string;
  created_at?: Date | string;
  created_by?: string;
  updated_at?: Date | string;
  updated_by?: string;
}

/**
 * FuelType entity
 */
export interface FuelType {
  name: string;
  description: string | null;
  created_at?: Date | string;
  created_by?: string;
  updated_at?: Date | string;
  updated_by?: string;
}

/**
 * VehicleMaker entity
 */
export interface VehicleMaker {
  name: string;
  company_id?: string;
  created_at?: Date | string;
  created_by?: string;
  updated_at?: Date | string;
  updated_by?: string;
}

/**
 * Color entity
 */
export interface Color {
  color: string;
  company_id?: string;
  created_at?: Date | string;
  created_by?: string;
  updated_at?: Date | string;
  updated_by?: string;
}

/**
 * Location entity
 */
export interface Location {
  name: string;
  company_id?: string;
  created_at?: Date | string;
  created_by?: string;
  updated_at?: Date | string;
  updated_by?: string;
}

/**
 * VehicleType entity
 */
export interface VehicleType {
  vehicle_type: string;
  company_id?: string;
  created_at?: Date | string;
  created_by?: string;
  updated_at?: Date | string;
  updated_by?: string;
}

/**
 * ChartOfAccount entity
 */
export interface ChartOfAccount {
  account_code: string;
  account_name: string;
  account_type: string;
  description?: string | null;
  is_active: boolean | null;
  company_id?: string;
  created_at?: Date | string;
  created_by?: string;
  updated_at?: Date | string;
  updated_by?: string;
}

/**
 * User entity
 */
export interface User {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: string;
  company_id: string;
  is_active: boolean;
  created_at?: Date | string;
  created_by?: string;
  updated_at?: Date | string;
  updated_by?: string;
}

/**
 * Company entity
 */
export interface Company {
  company_id: string;
  name: string;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state_province?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  tax_id?: string | null;
  is_active: boolean;
  created_at?: Date | string;
  created_by?: string;
  updated_at?: Date | string;
  updated_by?: string;
}

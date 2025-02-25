import * as z from 'zod';

export const bankSchema = z.object({
  account_number: z.string().min(1, 'Account number is required').max(30),
  bank_name: z.string().min(1, 'Bank name is required').max(100),
  bank_branch: z.string().max(100).optional(),
  currency: z.string().max(3).optional(),
  description: z.string().max(500).optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const colorSchema = z.object({
  color: z.string().min(1, 'Color is required').max(50),
});

export const makerSchema = z.object({
  name: z.string().min(1, 'Maker name is required').max(100),
});

export const vehicleTypeSchema = z.object({
  vehicle_type: z.string().min(1, 'Vehicle type is required').max(100),
});

export const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(100),
});

export const countrySchema = z.object({
  code: z.string().min(1, 'Country code is required').max(3),
  name: z.string().min(1, 'Country name is required').max(100),
  is_targetcountry: z.boolean().optional(),
});

export const fuelTypeSchema = z.object({
  name: z.string().min(1, 'Fuel type name is required').max(10),
  description: z.string().max(50).optional(),
});

export const invoiceTermsSchema = z.object({
  name: z.string().min(1, 'Term name is required').max(50),
  description: z.string().max(50).optional(),
});

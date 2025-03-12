/**
 * Reference Data Service
 *
 * Centralized service for handling reference data used throughout the application
 * Primary use case is to provide reference datagetters for forms and dropdowns
 * Uses caching to reduce database trips for infrequently changing data
 */

import { getOrFetchData } from '@/app/lib/data';
import { prisma } from '@/app/lib/data';

// Define types for reference data
export interface Country {
  code: string;
  name: string | null;
  is_targetcountry: boolean | null;
}

export interface Counterparty {
  code: string;
  name: string | null;
  is_supplier: boolean | null;
  is_buyer: boolean | null;
  address1?: string | null;
  phone?: string | null;
}

export interface FuelType {
  name: string;
  description: string | null;
}

export interface VehicleMaker {
  name: string;
}

export interface Color {
  color: string;
}

export interface Location {
  name: string;
}

export interface VehicleType {
  vehicle_type: string;
}

// Cache TTL constants
const REFERENCE_DATA_TTL = 30 * 60 * 1000; // 30 minutes for reference data

/**
 * Get all countries for a company
 */
export async function getCountries(companyId: string): Promise<Country[]> {
  const cacheKey = `countries:${companyId}`;
  return getOrFetchData(
    cacheKey,
    async () => {
      const countries = await prisma.ref_country.findMany({
        where: { company_id: companyId },
        orderBy: { name: 'asc' },
        select: {
          code: true,
          name: true,
          is_targetcountry: true,
        },
      });
      return countries;
    },
    REFERENCE_DATA_TTL
  );
}

/**
 * Get all counterparties for a company
 */
export async function getCounterparties(companyId: string): Promise<Counterparty[]> {
  const cacheKey = `counterparties:${companyId}`;
  return getOrFetchData(
    cacheKey,
    async () => {
      const counterparties = await prisma.ref_contact.findMany({
        where: { company_id: companyId },
        orderBy: [{ is_active: 'desc' }, { name: 'asc' }],
        select: {
          code: true,
          name: true,
          is_supplier: true,
          is_buyer: true,
          address1: true,
          phone: true,
        },
      });
      return counterparties;
    },
    REFERENCE_DATA_TTL
  );
}

/**
 * Get all fuel types
 */
export async function getFuelTypes(): Promise<FuelType[]> {
  const cacheKey = 'fuelTypes';
  return getOrFetchData(
    cacheKey,
    async () => {
      const fuelTypes = await prisma.ref_fueltype.findMany({
        select: {
          name: true,
          description: true,
        },
      });
      return fuelTypes;
    },
    REFERENCE_DATA_TTL
  );
}

/**
 * Get all vehicle makers for a company
 */
export async function getVehicleMakers(companyId: string): Promise<VehicleMaker[]> {
  const cacheKey = `makers:${companyId}`;
  return getOrFetchData(
    cacheKey,
    async () => {
      const makers = await prisma.ref_maker.findMany({
        where: { company_id: companyId },
        orderBy: { name: 'asc' },
        select: {
          name: true,
        },
      });
      return makers;
    },
    REFERENCE_DATA_TTL
  );
}

/**
 * Get all colors for a company
 */
export async function getColors(companyId: string): Promise<Color[]> {
  const cacheKey = `colors:${companyId}`;
  return getOrFetchData(
    cacheKey,
    async () => {
      const colors = await prisma.ref_color.findMany({
        where: { company_id: companyId },
        orderBy: { color: 'asc' },
        select: {
          color: true,
        },
      });
      return colors;
    },
    REFERENCE_DATA_TTL
  );
}

/**
 * Get all locations for a company
 */
export async function getLocations(companyId: string): Promise<Location[]> {
  const cacheKey = `locations:${companyId}`;
  return getOrFetchData(
    cacheKey,
    async () => {
      const locations = await prisma.ref_location.findMany({
        where: { company_id: companyId },
        orderBy: { name: 'asc' },
        select: {
          name: true,
        },
      });
      return locations;
    },
    REFERENCE_DATA_TTL
  );
}

/**
 * Get all vehicle types for a company
 */
export async function getVehicleTypes(companyId: string): Promise<VehicleType[]> {
  const cacheKey = `vehicleTypes:${companyId}`;
  return getOrFetchData(
    cacheKey,
    async () => {
      const vehicleTypes = await prisma.ref_vehicle_type.findMany({
        where: { company_id: companyId },
        orderBy: { vehicle_type: 'asc' },
        select: {
          vehicle_type: true,
        },
      });
      return vehicleTypes;
    },
    REFERENCE_DATA_TTL
  );
}

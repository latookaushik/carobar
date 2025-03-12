/**
 * Prisma Client Module
 *
 * Single instance of Prisma Client to be used across the application.
 * Implements the singleton pattern to avoid multiple connections.
 */

import { PrismaClient } from '@prisma/client';

/**
 * Create a new PrismaClient instance with appropriate logging
 * based on the environment
 */
const prismaClientSingleton = () => {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient({ log: ['warn', 'error'] });
  } else {
    return new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
  }
};

// Define the type for the PrismaClient instance
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

/**
 * Create a global variable to store the PrismaClient instance
 * This ensures we don't create multiple connections in development
 * due to hot reloading
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

/**
 * Get the PrismaClient instance or create a new one if it doesn't exist
 */
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// If not in production, store the instance globally
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Export the PrismaClient instance
 * This is the only instance that should be used throughout the application
 */
export default prisma;

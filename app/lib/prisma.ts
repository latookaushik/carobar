
// lib/prisma.ts
// Single instance of Prisma Client to be used across the application

import { PrismaClient } from '@prisma/client';

// Enable query logging
const prismaClientSingleton = () => {
if (process.env.NODE_ENV === 'production') {
  return new PrismaClient({ log: ['warn', 'error'] });
} else {
  return new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
}

};

// Create a singleton instance
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Centralized prisma client to be used throughout the application.
export default prisma;

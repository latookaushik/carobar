// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Centralized prisma client to be used throughout the application.
export default prisma;

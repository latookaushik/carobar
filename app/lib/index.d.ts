// lib/index.d.ts

// Import JWTPayload from jwtUtil.ts
declare module '@/app/lib/jwtUtil' {
  import { JWTPayload } from '@/app/lib/jwtUtil'; // Import the type
  export { JWTPayload }; // Re-export it
  export function createToken(payload: JWTPayload): string;
  export function verifyToken(token: string): JWTPayload | null;
}

declare module '@/app/lib/errorUtil' {
  export function createErrorResponse(message: string, status: number): any;
}

declare module '@/app/lib/logger' {
  export function logInfo(message: string): void;
  export function logError(message: string): void;
  export function logDebug(message: string): void;
  export function logWarning(message: string): void;
}

// lib/logger.ts
// This module provides logging functionality for the application.

export function logInfo(message: string) {
  console.info(`[INFO]: ${message}`);
}

export function logError(message: string) {
  console.error(`[ERROR]: ${message}`);
}

export function logDebug(message: string) {
  console.debug(`[DEBUG]: ${message}`);
}

export function logWarning(message: string) {
  console.warn(`[WARNING]: ${message}`);
}
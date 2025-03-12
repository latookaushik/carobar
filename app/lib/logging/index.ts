/**
 * Centralized Logging System
 *
 * This module provides standardized logging functions for the entire application.
 * It ensures consistent log formats and levels across all components.
 */

import { toTimeStamp } from '@/app/lib/utils';

type ConsoleMethodType = 'log' | 'debug' | 'info' | 'warn' | 'error';

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
}

// Determine log level from environment or use WARNING as default
const level = (() => {
  switch ((process.env.LOG_LEVEL || 'WARNING').toUpperCase()) {
    case 'DEBUG':
      return LogLevel.DEBUG;
    case 'INFO':
      return LogLevel.INFO;
    case 'WARNING':
      return LogLevel.WARNING;
    case 'ERROR':
      return LogLevel.ERROR;
    default:
      return LogLevel.WARNING;
  }
})();

/**
 * Internal logging function
 *
 * @param levelType The log level (DEBUG, INFO, etc.)
 * @param type The log type string for output
 * @param message The message to log
 */
const log = (levelType: LogLevel, type: string, message: string) => {
  // Only log if the message level is >= configured level
  if (level > levelType) return;

  const curTime = toTimeStamp(new Date());
  const consoleMethod: ConsoleMethodType = type.toLowerCase() as ConsoleMethodType;
  console[consoleMethod](`[${type}] [${curTime}] - Message: ${message}`);
};

/**
 * Log a debug message (lowest level)
 * Only shown when LOG_LEVEL is set to DEBUG
 */
export const logDebug = (message: string) => log(LogLevel.DEBUG, 'DEBUG', message);

/**
 * Log an info message
 * Shown when LOG_LEVEL is set to DEBUG or INFO
 */
export const logInfo = (message: string) => log(LogLevel.INFO, 'INFO', message);

/**
 * Log a warning message
 * Shown when LOG_LEVEL is set to DEBUG, INFO, or WARNING
 */
export const logWarning = (message: string) => log(LogLevel.WARNING, 'WARNING', message);

/**
 * Log an error message (highest level)
 * Always shown unless LOG_LEVEL is specifically set higher than ERROR
 */
export const logError = (message: string) => log(LogLevel.ERROR, 'ERROR', message);

/**
 * Formatter functions for structured logging
 * These will be moved to formatters.ts in a future update
 */

/**
 * Format an API error log message
 */
export function formatApiErrorLog(status: number, message: string, details?: unknown): string {
  return `API Error (${status}): ${message}${details ? ' - ' + JSON.stringify(details) : ''}`;
}

/**
 * Format an authentication log message
 */
export function formatAuthLog(
  success: boolean,
  userId: string,
  action: string,
  details?: string
): string {
  const result = success ? 'Success' : 'Failed';
  return `Auth ${result}: User ${userId} - ${action}${details ? ` (${details})` : ''}`;
}

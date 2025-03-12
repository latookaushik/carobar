/**
 * Date and Time Utility Functions
 *
 * Common date and time manipulation functions
 */

/**
 * Converts a Date object to a formatted timestamp string
 * Format: YY-MM-DD HH:MM:SS.mmm
 */
export function toTimeStamp(date: Date): string {
  const year: string = date.getFullYear().toString().slice(-2);
  const month: string = String(date.getMonth() + 1).padStart(2, '0');
  const day: string = String(date.getDate()).padStart(2, '0');
  const hours: string = String(date.getHours()).padStart(2, '0');
  const minutes: string = String(date.getMinutes()).padStart(2, '0');
  const seconds: string = String(date.getSeconds()).padStart(2, '0');
  const milliseconds: string = String(date.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Formats a date in YYYY-MM-DD format
 */
export function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Formats a date in DD/MM/YYYY format
 */
export function formatDateDDMMYYYY(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${day}/${month}/${year}`;
}

/**
 * Formats a date in YYYYMMDD number format
 */

export function parseDateToYYYYMMDD(date: Date): number {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return Number(`${year}${month}${day}`);
}

/**
 * Formats a date in YYYY-MM-DD from number format
 */

export function formatIntDateToString(date: number): string {
  const dateString = date.toString();

  if (dateString.length !== 8) {
    return 'Invalid date';
  }

  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);

  return `${year}-${month}-${day}`;
}

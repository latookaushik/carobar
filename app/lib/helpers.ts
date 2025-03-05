// Helper functions for common tasks

/**
 * Format a Date object to YYYY-MM-DD string (for HTML date inputs)
 * @param date The Date object to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDateYYYYMMDD(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse a date string or Date object to YYYYMMDD integer format
 * @param date The date to parse (string or Date object)
 * @returns Date as integer in YYYYMMDD format
 */
export function parseDateToYYYYMMDD(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return parseInt(`${year}${month}${day}`);
}

/**
 * Format YYYYMMDD integer to YYYY-MM-DD string
 * @param dateInt Date as integer in YYYYMMDD format
 * @returns Formatted date string
 */
export function formatIntDateToString(dateInt: number): string {
  if (!dateInt) return '';
  
  const dateStr = dateInt.toString();
  if (dateStr.length !== 8) return '';
  
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
}

/**
 * Format currency value for display
 * @param value The value to format
 * @param currency The currency code
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'JPY'): string {
  return `${currency} ${value.toLocaleString()}`;
}

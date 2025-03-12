/**
 * Formatting Utility Functions
 *
 * Common utilities for formatting data like currency, numbers, text, etc.
 */

/**
 * Formats a number as currency with the specified currency code
 *
 * @param value - The numeric value to format
 * @param currencyCode - The ISO currency code (e.g., 'USD', 'EUR', 'JPY')
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a number with the specified number of decimal places
 *
 * @param value - The numeric value to format
 * @param decimalPlaces - The number of decimal places (defaults to 2)
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  decimalPlaces: number = 2,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

/**
 * Truncates text to a maximum length and adds ellipsis if needed
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length (defaults to 100)
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * UI Utility Functions
 *
 * Common utilities for UI operations like class name merging
 */

// clsx: This is a very popular utility library for constructing className strings
// in dynamically in JavaScript/TypeScript.
import { type ClassValue, clsx } from 'clsx';

// twMerge: This is a utility function provided by the 'tailwind-merge' package.
import { twMerge } from 'tailwind-merge';

/**
 * Helper function that takes a flexible set of inputs (strings, arrays, objects)
 * representing CSS class names, combines them into a single string of classes, and then
 * merges those classes to ensure they work correctly with Tailwind CSS's specificity rules.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

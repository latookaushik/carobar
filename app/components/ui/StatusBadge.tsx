/**
 * StatusBadge Component
 *
 * A reusable badge component for displaying status information consistently
 * throughout the application. Automatically applies appropriate colors based
 * on status type.
 *
 * @component
 * @example
 * ```tsx
 * <StatusBadge status="Completed" />
 * <StatusBadge status="Processing" />
 * <StatusBadge status="Failed" variant="error" />
 * ```
 */

import React from 'react';

// Common status types used across the application
export type CommonStatusType =
  | 'Completed'
  | 'Pending'
  | 'Processing'
  | 'Cancelled'
  | 'Failed'
  | 'Shipped'
  | 'In Stock'
  | 'Reserved'
  | 'In Transit'
  | 'Delivered'
  | 'Active'
  | 'Inactive'
  | string;

// Predefined color variants
export type StatusVariant =
  | 'success' // Green - positive outcomes
  | 'warning' // Yellow - requires attention
  | 'info' // Blue - informational
  | 'error' // Red - errors or problems
  | 'default' // Gray - neutral
  | 'custom'; // Use custom colors defined in customColors

interface StatusBadgeProps {
  /** The status text to display */
  status: CommonStatusType;

  /** Optional predefined color variant */
  variant?: StatusVariant;

  /** Optional custom background color class (Tailwind) */
  customBgColor?: string;

  /** Optional custom text color class (Tailwind) */
  customTextColor?: string;

  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Maps status text to appropriate variant if not explicitly provided
 */
function getVariantForStatus(status: CommonStatusType): StatusVariant {
  // Map common statuses to their appropriate variants
  const statusMap: Record<string, StatusVariant> = {
    Completed: 'success',
    Delivered: 'success',
    Active: 'success',
    'In Stock': 'success',

    Pending: 'warning',
    Processing: 'info',
    'In Transit': 'info',
    Reserved: 'info',

    Cancelled: 'error',
    Failed: 'error',
    Inactive: 'error',
  };

  return statusMap[status] || 'default';
}

/**
 * Maps variant to Tailwind CSS color classes
 */
function getColorsForVariant(variant: StatusVariant): { bg: string; text: string } {
  const variantMap: Record<StatusVariant, { bg: string; text: string }> = {
    success: { bg: 'bg-green-100', text: 'text-green-800' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    info: { bg: 'bg-blue-100', text: 'text-blue-800' },
    error: { bg: 'bg-red-100', text: 'text-red-800' },
    default: { bg: 'bg-gray-100', text: 'text-gray-800' },
    custom: { bg: '', text: '' }, // Will be overridden by custom colors
  };

  return variantMap[variant];
}

export default function StatusBadge({
  status,
  variant,
  customBgColor,
  customTextColor,
  className = '',
}: StatusBadgeProps) {
  // Determine the variant if not explicitly provided
  const effectiveVariant = variant || getVariantForStatus(status);

  // Get the appropriate colors
  const colors = getColorsForVariant(effectiveVariant);

  // Use custom colors if provided and variant is custom
  const bgColor = effectiveVariant === 'custom' && customBgColor ? customBgColor : colors.bg;

  const textColor =
    effectiveVariant === 'custom' && customTextColor ? customTextColor : colors.text;

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor} ${className}`}
    >
      {status}
    </span>
  );
}

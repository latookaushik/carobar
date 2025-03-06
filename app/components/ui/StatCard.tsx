/**
 * StatCard Component
 *
 * A reusable card component for displaying statistics with a title, value, and change indicator.
 * Used throughout the application for dashboards and report summaries.
 *
 * @component
 * @example
 * ```tsx
 * <StatCard
 *   title="Total Vehicles"
 *   value="245"
 *   change="+12% from last month"
 *   bgColor="blue"
 * />
 * ```
 */

import React from 'react';

type ColorType = 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'gray';

interface StatCardProps {
  /** The title of the statistic */
  title: string;

  /** The primary value to display */
  value: string | number;

  /** Optional text describing the change (e.g., "+12% from last month") */
  change?: string;

  /** Base color for the card (affects background and text colors) */
  bgColor: ColorType;
}

/**
 * Maps color names to their respective Tailwind CSS classes
 */
const colorMap: Record<ColorType, { bg: string; text: string; textSecondary: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-800', textSecondary: 'text-blue-600' },
  green: { bg: 'bg-green-50', text: 'text-green-800', textSecondary: 'text-green-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-800', textSecondary: 'text-purple-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-800', textSecondary: 'text-amber-600' },
  red: { bg: 'bg-red-50', text: 'text-red-800', textSecondary: 'text-red-600' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-800', textSecondary: 'text-gray-600' },
};

export default function StatCard({ title, value, change, bgColor }: StatCardProps) {
  const colors = colorMap[bgColor] || colorMap.gray;

  return (
    <div className={`${colors.bg} p-4 rounded-lg shadow-sm`}>
      <h3 className={`text-lg font-medium ${colors.text}`}>{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {change && <p className={`text-sm ${colors.textSecondary} mt-1`}>{change}</p>}
    </div>
  );
}

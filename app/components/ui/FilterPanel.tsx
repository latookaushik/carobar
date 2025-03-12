/**
 * FilterPanel Component
 *
 * A reusable component for creating consistent filter panels across the application.
 * Provides a standardized layout for filter controls with responsive design.
 *
 * @component
 * @example
 * ```tsx
 * <FilterPanel onFilter={() => handleFilter()}>
 *   <FilterField label="Date Range">
 *     <DateRangePicker onChange={setDateRange} />
 *   </FilterField>
 *   <FilterField label="Status">
 *     <Select options={statusOptions} onChange={setStatus} />
 *   </FilterField>
 * </FilterPanel>
 * ```
 */

import React from 'react';

interface FilterPanelProps {
  /** Filter panel title */
  title?: string;

  /** Function called when filter button is clicked */
  onFilter: () => void;

  /** Children containing filter controls */
  children: React.ReactNode;

  /** Additional CSS class for the container */
  className?: string;

  /** Text for the filter button */
  filterButtonText?: string;

  /** Show reset button */
  showReset?: boolean;

  /** Function called when reset button is clicked */
  onReset?: () => void;
}

interface FilterFieldProps {
  /** Label for the filter field */
  label: string;

  /** Input element or other control */
  children: React.ReactNode;

  /** Additional CSS class for the field container */
  className?: string;

  /** Field spanning multiple columns */
  fullWidth?: boolean;
}

/**
 * Individual filter field with label and control
 */
export const FilterField: React.FC<FilterFieldProps> = ({
  label,
  children,
  className = '',
  fullWidth = false,
}) => {
  return (
    <div className={`${fullWidth ? 'col-span-full' : ''} ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
};

/**
 * Main filter panel container
 */
export default function FilterPanel({
  title = 'Filter Options',
  onFilter,
  children,
  className = '',
  filterButtonText = 'Apply Filters',
  showReset = true,
  onReset,
}: FilterPanelProps) {
  return (
    <div className={`bg-gray-50 p-4 rounded-lg mb-6 ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>

      <div className="mt-4 flex justify-end gap-2">
        {showReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Reset
          </button>
        )}

        <button
          onClick={onFilter}
          className="bg-maroon-500 hover:bg-maroon-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {filterButtonText}
        </button>
      </div>
    </div>
  );
}

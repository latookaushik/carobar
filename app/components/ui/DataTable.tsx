/**
 * DataTable Component
 *
 * A reusable table component for displaying data in a structured format with headers and rows.
 * Provides consistent styling and responsiveness across the application.
 *
 * @component
 * @example
 * ```tsx
 * <DataTable
 *   headers={['Date', 'Vehicle', 'Type', 'Amount', 'Status']}
 *   data={transactions}
 *   renderRow={(item) => (
 *     <>
 *       <td>{item.date}</td>
 *       <td>{item.vehicle}</td>
 *       <td>{item.type}</td>
 *       <td>{item.amount}</td>
 *       <td>{renderStatus(item.status)}</td>
 *     </>
 *   )}
 * />
 * ```
 */

import React from 'react';

interface DataTableProps<T> {
  /** Array of header labels */
  headers: string[];

  /** Array of data items to display */
  data: T[];

  /** Function to render a row for each data item */
  renderRow: (item: T, index: number) => React.ReactNode;

  /** Optional table caption */
  caption?: string;

  /** Optional CSS class for the table container */
  className?: string;

  /** Flag to indicate if the table should have a shadow */
  withShadow?: boolean;

  /** Optional CSS class for the header row */
  headerClassName?: string;

  /** Flag to indicate if the table is in a loading state */
  loading?: boolean;

  /** Text to display when there is no data */
  emptyMessage?: string;
}

export default function DataTable<T>({
  headers,
  data,
  renderRow,
  caption,
  className = '',
  withShadow = true,
  headerClassName = 'bg-gray-50',
  loading = false,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  return (
    <div
      className={`overflow-x-auto ${withShadow ? 'bg-white rounded-lg shadow' : ''} ${className}`}
    >
      <table className="min-w-full divide-y divide-gray-200">
        {caption && <caption className="sr-only">{caption}</caption>}

        <thead className={headerClassName}>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-8 text-center text-sm text-gray-500">
                <div className="flex justify-center items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-maroon-500"></div>
                  <span>Loading data...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-8 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {renderRow(item, index)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

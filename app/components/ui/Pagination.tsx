/**
 * Pagination Component
 *
 * A reusable pagination component for navigating through multi-page data.
 * Displays current page information and provides next/previous navigation.
 *
 * @component
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalPages={5}
 *   totalItems={100}
 *   pageSize={20}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 * ```
 */

import React from 'react';

interface PaginationProps {
  /** Current page number (1-based) */
  currentPage: number;

  /** Total number of pages */
  totalPages: number;

  /** Total number of items across all pages */
  totalItems: number;

  /** Number of items per page */
  pageSize: number;

  /** Callback function when page changes */
  onPageChange: (page: number) => void;

  /** Optional custom text for displaying count information */
  countText?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  countText,
}: PaginationProps) {
  // Calculate the range of items being displayed
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="mt-4 flex justify-between items-center">
      <div className="text-sm text-gray-700">
        {countText || (
          <>
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium 
            ${
              currentPage <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
        >
          Previous
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium 
            ${
              currentPage >= totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

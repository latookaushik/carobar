/**
 * Dashboard Home Page
 *
 * The main dashboard view for authenticated users showing a summary of key metrics
 * and recent transactions. This page adapts its display based on the user's role,
 * showing relevant information for their access level.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import StatCard from '@/app/components/ui/StatCard';
import DataTable from '@/app/components/ui/DataTable';
import Pagination from '@/app/components/ui/Pagination';
import StatusBadge from '@/app/components/ui/StatusBadge';
import FilterPanel, { FilterField } from '@/app/components/ui/FilterPanel';

// Sample transaction data (would be fetched from API in production)
const SAMPLE_TRANSACTIONS = [
  {
    date: '2025-02-15',
    vehicle: 'Toyota Camry',
    type: 'Purchase',
    amount: '$24,500',
    status: 'Completed',
  },
  {
    date: '2025-02-16',
    vehicle: 'Honda Accord',
    type: 'Sale',
    amount: '$28,900',
    status: 'Completed',
  },
  {
    date: '2025-02-17',
    vehicle: 'Nissan Altima',
    type: 'Purchase',
    amount: '$22,800',
    status: 'Pending',
  },
  { date: '2025-02-18', vehicle: 'Mazda 6', type: 'Sale', amount: '$26,400', status: 'Completed' },
  {
    date: '2025-02-19',
    vehicle: 'Subaru Legacy',
    type: 'Purchase',
    amount: '$25,700',
    status: 'Processing',
  },
];

// Transaction type options for the filter
const TRANSACTION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'sale', label: 'Sale' },
];

// Status options for the filter
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
];

export default function DashboardPage() {
  // State for pagination (in a real app, this would control API fetching)
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [transactionType, setTransactionType] = useState('all');
  const [status, setStatus] = useState('all');

  // Get authentication status
  const {} = useAuth();

  // Handle filter application
  const handleFilter = () => {
    // In a real app, this would fetch filtered data from the API
    console.log('Filtering with:', { dateRange, transactionType, status });
  };

  // Handle filter reset
  const handleReset = () => {
    setDateRange({ start: '', end: '' });
    setTransactionType('all');
    setStatus('all');
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Vehicles" value="245" change="+12% from last month" bgColor="blue" />

        <StatCard
          title="Sales This Month"
          value="42"
          change="+5% from last month"
          bgColor="green"
        />

        <StatCard
          title="Pending Shipments"
          value="18"
          change="-3 from last week"
          bgColor="purple"
        />

        <StatCard title="Revenue" value="$1.2M" change="+8% from last month" bgColor="amber" />
      </div>

      {/* Filters Section */}
      <FilterPanel title="Transaction Filters" onFilter={handleFilter} onReset={handleReset}>
        <FilterField label="Date From">
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
        </FilterField>

        <FilterField label="Date To">
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </FilterField>

        <FilterField label="Transaction Type">
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
          >
            {TRANSACTION_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Status">
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>
      </FilterPanel>

      {/* Recent Transactions Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>

        <DataTable
          headers={['Date', 'Vehicle', 'Type', 'Amount', 'Status']}
          data={SAMPLE_TRANSACTIONS}
          renderRow={(item) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.vehicle}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={item.status} />
              </td>
            </>
          )}
        />

        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={5}
            totalItems={25}
            pageSize={5}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

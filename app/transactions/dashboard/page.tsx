/**
 * Transactions Dashboard Page
 *
 * This dashboard view is specific to the Transactions section, showing
 * relevant metrics and recent transaction activities. It uses the PageTemplate
 * component to ensure consistent layout and authentication handling.
 */

'use client';

import { useState } from 'react';
import PageTemplate from '@/app/components/PageTemplate';
import StatCard from '@/app/components/ui/StatCard';
import DataTable from '@/app/components/ui/DataTable';
import Pagination from '@/app/components/ui/Pagination';

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

export default function DashboardPage() {
  // State for pagination (in a real app, this would control API fetching)
  const [currentPage, setCurrentPage] = useState(1);

  // Function to render the status badge with appropriate styling
  const renderStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      Completed: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Processing: 'bg-blue-100 text-blue-800',
      Cancelled: 'bg-red-100 text-red-800',
    };

    const style = statusStyles[status] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style}`}>{status}</span>
    );
  };

  return (
    <PageTemplate title="Dashboard">
      <div className="space-y-6">
        {/* Statistics Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Vehicles"
            value="245"
            change="+12% from last month"
            bgColor="blue"
          />

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
                <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(item.status)}</td>
              </>
            )}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={5}
            totalItems={25}
            pageSize={5}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </PageTemplate>
  );
}

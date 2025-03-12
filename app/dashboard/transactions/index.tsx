'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import PageTemplate from '@/app/components/PageTemplate';
import DataTable from '@/app/components/ui/DataTable';
import { toast } from '@/app/components/ui/use-toast';
import {
  ShoppingCart,
  CreditCard,
  Wrench,
  Ship,
  Download,
  Search,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

// Define types
type VehicleOverview = {
  chassis_no: string;
  vehicle_name: string;
  maker: string;
  manufacture_yyyymm: string;
  color: string;
  purchase_date: number;
  purchase_cost: number;
  supplier_name: string;
  status: 'In Stock' | 'Sold' | 'Shipped';
};

export default function VehicleTransactionsDashboard() {
  const {
    /* user */
  } = useAuth();
  const router = useRouter();
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Memoize the fetchVehicles function to prevent unnecessary re-renders
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      // Build API query parameters
      const queryParams = new URLSearchParams();

      if (searchTerm.trim() !== '') {
        queryParams.append('search', searchTerm);
      }

      queryParams.append('page', currentPage.toString());
      queryParams.append('pageSize', itemsPerPage.toString());

      // Make API request to fetch all vehicles that have purchase records
      const response = await fetch(`/api/transactions/purchases?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch vehicles');
      }

      const data = await response.json();

      // Define purchase data structure
      type PurchaseData = {
        chassis_no: string;
        vehicle_name: string;
        maker: string;
        purchase_date: number;
        purchase_cost: number;
        supplier_name: string;
        color?: string;
        manufacture_yyyymm?: string;
        status?: 'In Stock' | 'Sold' | 'Shipped';
      };

      // Transform purchase data to vehicle overview format
      const vehicleData: VehicleOverview[] = (data.purchases || []).map(
        (purchase: PurchaseData) => ({
          chassis_no: purchase.chassis_no,
          vehicle_name: purchase.vehicle_name,
          maker: purchase.maker,
          manufacture_yyyymm: purchase.manufacture_yyyymm || '',
          color: purchase.color || '',
          purchase_date: purchase.purchase_date,
          purchase_cost: purchase.purchase_cost,
          supplier_name: purchase.supplier_name,
          // Determine status based on sales/shipment data (this would be from the real API)
          // In a future implementation, this status would come from a proper API
          status: purchase.status || ('In Stock' as 'In Stock' | 'Sold' | 'Shipped'),
        })
      );

      // Set filtered vehicles
      setFilteredVehicles(vehicleData);

      // If pagination data is returned, update state
      if (data.pagination) {
        setCurrentPage(data.pagination.page);
        // Only update total pages if it's returned from the API
        if (data.pagination.totalPages) {
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch vehicles. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, itemsPerPage]);

  // Fetch vehicles on initial load
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Format YYYYMMDD to YYYY-MM-DD
  const formatDate = (dateInt: number) => {
    const dateStr = dateInt.toString();
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  };

  // We don't need custom pagination logic anymore as it's handled by the API
  const getPaginatedData = () => {
    return filteredVehicles;
  };

  // Function to handle status display with appropriate color
  const renderStatus = (status: string) => {
    let bgColor = 'bg-gray-100 text-gray-800';
    if (status === 'In Stock') bgColor = 'bg-green-100 text-green-800';
    if (status === 'Sold') bgColor = 'bg-blue-100 text-blue-800';
    if (status === 'Shipped') bgColor = 'bg-purple-100 text-purple-800';

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor}`}>{status}</span>
    );
  };

  // Navigate to vehicle details/edit page
  const handleViewVehicle = (chassis_no: string) => {
    router.push(`/dashboard/transactions/vehicle/${chassis_no}`);
  };

  // Navigate to transaction type pages
  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <PageTemplate title="Vehicle Transactions">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Vehicle Transactions</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigateTo('/dashboard/transactions/purchase')}
              className="flex items-center gap-2 bg-maroon-600 hover:bg-maroon-700 text-white px-4 py-2 rounded-md"
            >
              <ShoppingCart size={18} />
              New Purchase
            </button>
            <div className="relative">
              <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md">
                <Download size={18} />
                Export
                <ChevronDown size={16} />
              </button>
              {/* Dropdown menu would go here */}
            </div>
          </div>
        </div>

        {/* Transaction Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div
            onClick={() => navigateTo('/dashboard/transactions/purchase')}
            className="bg-white p-4 rounded-lg shadow-md border-l-4 border-maroon-500 hover:shadow-lg cursor-pointer transition-all"
          >
            <div className="flex items-center">
              <div className="p-3 bg-maroon-100 rounded-full mr-4">
                <ShoppingCart className="text-maroon-500" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Purchase</h3>
                <p className="text-sm text-gray-500">Manage vehicle purchases</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigateTo('/dashboard/transactions/sales')}
            className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg cursor-pointer transition-all"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <CreditCard className="text-blue-500" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sales</h3>
                <p className="text-sm text-gray-500">Manage vehicle sales</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigateTo('/dashboard/transactions/repair')}
            className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg cursor-pointer transition-all"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <Wrench className="text-green-500" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Repair</h3>
                <p className="text-sm text-gray-500">Maintenance & repairs</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigateTo('/dashboard/transactions/shipment')}
            className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500 hover:shadow-lg cursor-pointer transition-all"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <Ship className="text-purple-500" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Shipment</h3>
                <p className="text-sm text-gray-500">Track vehicle shipments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by chassis, name, maker..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
              >
                <option value="All">All Statuses</option>
                <option value="In Stock">In Stock</option>
                <option value="Sold">Sold</option>
                <option value="Shipped">Shipped</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="items-per-page"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Items Per Page
              </label>
              <select
                id="items-per-page"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page
                }}
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={fetchVehicles}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Vehicle Data Table */}
        <DataTable
          headers={[
            'Chassis No.',
            'Vehicle',
            'Purchase Date',
            'Cost',
            'Supplier',
            'Status',
            'Actions',
          ]}
          data={getPaginatedData()}
          loading={loading}
          renderRow={(vehicle) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-maroon-600">
                {vehicle.chassis_no}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="font-medium text-gray-900">{vehicle.vehicle_name}</div>
                <div className="text-xs text-gray-500">
                  {vehicle.maker} • {vehicle.color}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(vehicle.purchase_date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${vehicle.purchase_cost.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {vehicle.supplier_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{renderStatus(vehicle.status)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button
                  onClick={() => handleViewVehicle(vehicle.chassis_no)}
                  className="text-maroon-600 hover:text-maroon-900 font-medium"
                >
                  View Details
                </button>
              </td>
            </>
          )}
        />

        {/* Pagination */}
        {filteredVehicles.length > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredVehicles.length)}
              </span>{' '}
              of <span className="font-medium">{filteredVehicles.length}</span> results
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}

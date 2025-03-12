'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { DataGrid, GridToolbar, GridColDef } from '@mui/x-data-grid';
import dayjs, { Dayjs } from 'dayjs';
import PurchaseModal from './PurchaseModal';
import PageTemplate from '@/app/components/PageTemplate';
import { useAuth } from '@/app/contexts/AuthContext';
import { formatIntDateToString } from '@/app/lib/utils';
import { toast } from '@/app/components/ui/use-toast';
import { logDebug, logError } from '@/app/lib/logging';

// Helper for creating default date range (today - 30 days to today)
const getDefaultDateRange = () => {
  const today = dayjs();
  const thirtyDaysAgo = today.subtract(30, 'day');
  return { from: thirtyDaysAgo, to: today };
};

// Interface for Purchase data
interface PurchaseData {
  id: string;
  chassis_no: string;
  purchase_date: number | null;
  supplier_name: string;
  vehicle_name: string;
  grade: string;
  model: string; // Changed from manufacture_yyyymm to match the API response
  color: string;
  maker: string;
  vehicle_location: string;
  target_country: string;
  purchase_cost: number;
  expenses: number;
  total_vehicle_fee: number;
  currency: string;
  payment_date: number | null;
  purchase_remarks: string;
  is_active: boolean; // Added to track if vehicle is active
}

export default function PurchasePage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState({});
  const [purchaseData, setPurchaseData] = useState<PurchaseData[]>([]);
  const [loading, setLoading] = useState(true);

  // Current filter state - Using Dayjs objects for API interactions
  const [dateRange, setDateRange] = useState<{ from: Dayjs; to: Dayjs }>(getDefaultDateRange());

  // Raw string input values for the date fields - allowing free text entry
  const [dateInputs, setDateInputs] = useState<{ fromStr: string; toStr: string }>({
    fromStr: dateRange.from.format('YYYY-MM-DD'),
    toStr: dateRange.to.format('YYYY-MM-DD'),
  });
  const [supplier, setSupplier] = useState<string>('');
  const [targetCountry, setTargetCountry] = useState<string>('');

  // Applied filter state (used for actual data fetching)
  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: getDefaultDateRange(),
    supplier: '',
    targetCountry: '',
  });

  const [suppliers, setSuppliers] = useState<{ code: string; name: string }[]>([]);
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);

  // Column definitions for the data grid
  const columns: GridColDef[] = [
    {
      field: 'chassis_no',
      headerName: 'Chassis No.',
      minWidth: 150,
      renderCell: (params) => (
        <span
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleChassisClick(params.row);
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: 'purchase_date',
      headerName: 'Date',
      minWidth: 100,
      valueFormatter: (param: number) => {
        return formatIntDateToString(Number(param));
      },
    },
    { field: 'supplier_name', headerName: 'Supplier', minWidth: 200 },
    { field: 'vehicle_name', headerName: 'Vehicle', minWidth: 240 },
    { field: 'grade', headerName: 'Grade', minWidth: 140 },
    { field: 'model', headerName: 'Model', minWidth: 100, headerAlign: 'center', align: 'center' },
    { field: 'color', headerName: 'Color', minWidth: 80 },
    { field: 'maker', headerName: 'Maker', minWidth: 150 },
    { field: 'vehicle_location', headerName: 'Location', minWidth: 200 },
    { field: 'target_country', headerName: 'Country', minWidth: 50 },
    {
      field: 'purchase_cost',
      headerName: 'Base Cost',
      align: 'right',
      headerAlign: 'right',
      minWidth: 50,
      valueFormatter: (param: number) => {
        return Number(param).toLocaleString();
      },
    },
    {
      field: 'expenses',
      headerName: 'Expenses',
      align: 'right',
      headerAlign: 'right',
      minWidth: 40,
      valueFormatter: (param: number) => {
        return Number(param).toLocaleString();
      },
    },
    {
      field: 'total_vehicle_fee',
      headerName: 'Total Cost',
      align: 'right',
      headerAlign: 'right',
      minWidth: 45,
      valueFormatter: (param: number) => {
        return Number(param).toLocaleString();
      },
    },
    {
      field: 'currency',
      headerName: 'CUR',
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      flex: 1,
    },
    {
      field: 'payment_date',
      headerName: 'Pay-Date',
      minWidth: 50,
      valueFormatter: (param: number) => {
        return formatIntDateToString(Number(param));
      },
    },
    { field: 'purchase_remarks', headerName: 'Remarks', minWidth: 500 },
  ];

  // Fetch reference data once on component mount
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Use the optimized combined reference data endpoint
        const response = await fetch('/api/getReferenceList/purchase', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const refData = data.referenceData;

          // Only need suppliers and countries for this page
          setSuppliers(refData.counterparties || []);
          setCountries(refData.countries || []);

          logDebug('Reference data loaded successfully for purchase page');
        } else {
          throw new Error(`Failed to fetch reference data: ${response.status}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logError('Error fetching reference data: ' + errorMessage);

        toast({
          title: 'Error',
          description: 'Failed to load reference data. Please refresh the page.',
          variant: 'destructive',
        });
      }
    };

    fetchReferenceData();
  }, []);

  // Function to handle search button click
  const handleSearch = () => {
    // Parse the date inputs to Dayjs objects for the API
    try {
      // Parse from date if entered
      let fromDate = dateInputs.fromStr ? dayjs(dateInputs.fromStr) : null;
      let toDate = dateInputs.toStr ? dayjs(dateInputs.toStr) : null;

      // Fallback to defaults if invalid dates
      if (fromDate && !fromDate.isValid()) {
        fromDate = dayjs().subtract(30, 'day');
        toast({
          title: 'Invalid Date',
          description: 'From date is invalid, using default (30 days ago).',
          variant: 'default',
        });
      }

      if (toDate && !toDate.isValid()) {
        toDate = dayjs();
        toast({
          title: 'Invalid Date',
          description: 'To date is invalid, using today as default.',
          variant: 'default',
        });
      }

      // Default to today if no valid end date
      if (!toDate) toDate = dayjs();

      // Default to 30 days before end date if no valid start date
      if (!fromDate) fromDate = toDate.subtract(30, 'day');

      // Update the dateRange with validated dates
      const updatedDateRange = {
        from: fromDate,
        to: toDate,
      };

      // Apply all filters including parsed dates
      setDateRange(updatedDateRange);
      setAppliedFilters({
        dateRange: updatedDateRange,
        supplier,
        targetCountry,
      });
    } catch (error) {
      console.error('Error parsing dates:', error);
      toast({
        title: 'Date Error',
        description: 'There was an error with the date range. Using defaults.',
        variant: 'destructive',
      });

      // Use defaults on error
      const defaultRange = getDefaultDateRange();
      setDateRange(defaultRange);
      setAppliedFilters({
        dateRange: defaultRange,
        supplier,
        targetCountry,
      });
    }
  };

  // Fetch purchase data based on applied filters (not the current filter state)
  useEffect(() => {
    const fetchPurchaseData = async () => {
      if (!user?.companyId) return;

      setLoading(true);
      try {
        // Create the date range filter for API query
        const fromDateInt = appliedFilters.dateRange.from
          ? parseInt(appliedFilters.dateRange.from.format('YYYYMMDD'))
          : null;

        const toDateInt = appliedFilters.dateRange.to
          ? parseInt(appliedFilters.dateRange.to.format('YYYYMMDD'))
          : null;

        const queryParams = new URLSearchParams();

        if (fromDateInt) queryParams.append('fromDate', fromDateInt.toString());
        if (toDateInt) queryParams.append('toDate', toDateInt.toString());
        if (appliedFilters.supplier) queryParams.append('supplier', appliedFilters.supplier);
        if (appliedFilters.targetCountry)
          queryParams.append('targetCountry', appliedFilters.targetCountry);

        // Fetch the purchase data from custom API endpoint
        const response = await fetch(
          `/api/transactions/purchases/with-vehicle?${queryParams.toString()}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch purchase data');
        }

        const data = await response.json();

        // Log received data for debugging
        logDebug(`Raw API response: ${JSON.stringify(data)}`);

        // Define the interface for API response items
        interface PurchaseResponseItem {
          chassis_no: string;
          purchase_date: number;
          supplier_name: string;
          vehicle_name: string;
          grade: string;
          model: string;
          color: string;
          maker: string;
          vehicle_location: string;
          target_country: string;
          purchase_cost: number;
          expenses: number;
          total_vehicle_fee: number;
          currency: string;
          payment_date: number;
          purchase_remarks: string;
        }

        // Define the interface for API response items to include is_active
        interface PurchaseResponseItem {
          chassis_no: string;
          purchase_date: number;
          supplier_name: string;
          vehicle_name: string;
          grade: string;
          model: string;
          color: string;
          maker: string;
          vehicle_location: string;
          target_country: string;
          purchase_cost: number;
          expenses: number;
          total_vehicle_fee: number;
          currency: string;
          payment_date: number;
          purchase_remarks: string;
          is_active: boolean;
        }

        // Process the data and transform to grid format
        const gridData = data.purchases.map((item: PurchaseResponseItem) => {
          const rowData: PurchaseData = {
            id: item.chassis_no || 'unknown',
            chassis_no: item.chassis_no || '',
            purchase_date: item.purchase_date ? Number(item.purchase_date) : null,
            supplier_name: item.supplier_name || '',
            vehicle_name: item.vehicle_name || '',
            grade: item.grade || '',
            model: item.model || '',
            color: item.color || '',
            maker: item.maker || '',
            vehicle_location: item.vehicle_location || '',
            target_country: item.target_country || '',
            purchase_cost: Number(item.purchase_cost || 0),
            expenses: Number(item.expenses),
            total_vehicle_fee: Number(item.total_vehicle_fee || 0),
            currency: item.currency || '',
            payment_date: item.payment_date ? Number(item.payment_date) : null,
            purchase_remarks: item.purchase_remarks || '',
            is_active: item.is_active === false ? false : true, // Default to true if not specified
          };
          logDebug(`Processed row data: ${JSON.stringify(rowData)}`);
          return rowData;
        });
        logDebug(`Processed grid data: ${JSON.stringify(gridData)}`);
        setPurchaseData(gridData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logError(`Processed grid data: ${errorMessage}`);

        setPurchaseData([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseData();
  }, [user, appliedFilters]); // Only depend on user and appliedFilters

  const openNewPurchaseModal = () => {
    setIsEditing(false);
    setSelectedPurchase({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handler for when chassis number is clicked
  const handleChassisClick = async (row: PurchaseData) => {
    try {
      logDebug(`Clicked on chassis: :  ${row.chassis_no}`);

      // Fetch the complete purchase data using the chassis number
      const response = await fetch(`/api/transactions/purchases?chassis=${row.chassis_no}`);

      if (!response.ok) {
        throw new Error('Failed to fetch purchase data');
      }

      const data = await response.json();
      logDebug(`Fetched purchase data:  ${JSON.stringify(data)}`);

      if (data.purchases && data.purchases.length > 0) {
        const purchaseData = data.purchases[0];
        logDebug(`Selected purchase data for editing:  ${JSON.stringify(purchaseData)}`);

        // Set editing mode and open modal with the first purchase found
        setIsEditing(true);
        setSelectedPurchase(purchaseData);
        setIsModalOpen(true);
      } else {
        logError(`No purchase data found for chassis number: ${row.chassis_no}`);
        toast({
          title: 'Error',
          description: 'Could not find purchase data for editing',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logError(`Error fetching purchase data for editing: ${errorMessage}`);
      toast({
        title: 'Error',
        description: 'Failed to load purchase data for editing',
        variant: 'destructive',
      });
    }
  };

  return (
    <PageTemplate title="Vehicle Purchases">
      {/* Filter Panel - Single Row Layout */}
      <div className="flex items-center gap-2 mb-6 w-full">
        {/* Date Inputs */}
        <div className="flex items-center">
          <label className="text-sm font-medium whitespace-nowrap mr-2">Purchase date</label>
          <div className="relative">
            <input
              type="date"
              value={dateInputs.fromStr}
              onChange={(e) => setDateInputs((prev) => ({ ...prev, fromStr: e.target.value }))}
              className="pl-6 pr-2 py-1 border border-gray-300 rounded-md text-xs"
            />
            <Calendar
              className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={12}
            />
          </div>
          <div className="relative ml-1">
            <input
              type="date"
              value={dateInputs.toStr}
              onChange={(e) => setDateInputs((prev) => ({ ...prev, toStr: e.target.value }))}
              className="pl-6 pr-2 py-1 border border-gray-300 rounded-md text-xs"
            />
            <Calendar
              className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={12}
            />
          </div>
        </div>

        {/* Supplier Dropdown */}
        <div className="flex items-center">
          <label className="text-sm font-medium whitespace-nowrap mr-2">Supplier</label>
          <select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="py-1 px-2 w-[220px] border border-gray-300 rounded-md text-xs"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier.code} value={supplier.code}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        {/* Target Country */}
        <div className="flex items-center">
          <label className="text-sm font-medium whitespace-nowrap mr-2">Target Country</label>
          <select
            value={targetCountry}
            onChange={(e) => setTargetCountry(e.target.value)}
            className="py-1 px-2 w-[180px] border border-gray-300 rounded-md text-xs"
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Empty div with margin-left:auto to push the buttons to the right */}
        <div className="ml-auto"></div>

        {/* Search Button - now next to Add New Purchase */}
        <button
          onClick={handleSearch}
          className="flex items-center justify-center bg-maroon-600 hover:bg-red-800 text-white px-4 py-1 rounded-md text-sm font-medium"
        >
          Search
        </button>

        {/* Add New Purchase - now directly after Search Button */}
        <button
          onClick={openNewPurchaseModal}
          className="flex items-center gap-1 bg-maroon-600 hover:bg-red-800 text-white px-4 py-1 rounded-md text-sm font-medium"
        >
          <Plus size={14} />
          Add New Purchase
        </button>
      </div>

      {/* Data Grid */}
      <div style={{ height: 640, width: '100%' }}>
        <DataGrid
          rows={purchaseData}
          columns={columns}
          loading={loading}
          disableColumnMenu // Disable column menu to prevent column resizing
          disableColumnSelector // Disable column selector to prevent column resizing
          autoPageSize={false}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 50 },
            },
            density: 'compact',
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          getRowHeight={() => 'auto'}
          getRowClassName={(params) => {
            // This will be used to apply data-* attributes through CSS classes
            return params.row.is_active === false ? 'inactive-row' : '';
          }}
          sx={{
            // Match text size with filter panel controls
            '& .MuiDataGrid-root': { fontSize: '0.75rem' },
            '& .MuiDataGrid-cell': { fontSize: '0.75rem', py: 0.75 },
            '& .MuiTablePagination-root': { fontSize: '0.75rem' },
            '& .MuiDataGrid-toolbarContainer button': { fontSize: '0.75rem' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '0.75rem' },
            '& .MuiDataGrid-columnHeaders div[role="row"]': {
              // Corrected selector
              backgroundColor: '#8b0000', // Maroon color
              color: 'white',
              fontSize: '0.75rem',
            },
            // Make row hover highlight more visible
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
            // Make the row with inactive Vehicles gray
            '& .MuiDataGrid-row[data-is-active="false"]': {
              backgroundColor: '#f5f5f5',
              color: '#666',
            },
            overflowX: 'scroll',
          }}
        />
      </div>

      <PurchaseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        isEditing={isEditing}
        initialData={selectedPurchase}
      />
    </PageTemplate>
  );
}

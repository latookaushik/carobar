'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DataGrid, GridToolbar, GridColDef } from '@mui/x-data-grid';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import PurchaseModal from './PurchaseModal';
import PageTemplate from '@/app/components/PageTemplate';
import { useAuth } from '@/app/contexts/AuthContext';
import { formatIntDateToString } from '@/app/lib/helpers';
import { toast } from '@/app/components/ui/use-toast';

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
  purchase_date: number;
  supplier_name: string;
  vehicle_name: string;
  grade: string;
  manufacture_yyyymm: string;
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

export default function PurchasePage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState({});
  const [purchaseData, setPurchaseData] = useState<PurchaseData[]>([]);
  const [loading, setLoading] = useState(true);

  // Current filter state
  const [dateRange, setDateRange] = useState<{ from: Dayjs; to: Dayjs }>(getDefaultDateRange());
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
      )
    },
    {
      field: 'purchase_date',
      headerName: 'Date',
      minWidth: 100,
      valueFormatter: (param: number ) => {
        return formatIntDateToString(Number(param));
      },
    },
    { field: 'supplier_name', headerName: 'Supplier', minWidth: 200 },
    { field: 'vehicle_name', headerName: 'Vehicle', minWidth: 240 },
    { field: 'grade', headerName: 'Grade', minWidth: 140 },
    { field: 'model', headerName: 'Model', minWidth: 100,  headerAlign: 'center', align: 'center'},
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
      valueFormatter: (param:number) => {
        return Number(param).toLocaleString();
      },
    },
    { field: 'currency', headerName: 'CUR', headerAlign: 'center', align: 'center', minWidth: 70, flex: 1 },
    {
      field: 'payment_date',
      headerName: 'Pay-Date',
      minWidth: 50,
      valueFormatter: (param:number) => {
        return formatIntDateToString(Number(param));
      },
    },
    { field: 'purchase_remarks', headerName: 'Remarks', minWidth: 500 },
  ];

  // Fetch reference data (suppliers and countries) on component mount
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch suppliers
        const suppliersResponse = await fetch('/api/counterparties');
        if (suppliersResponse.ok) {
          const data = await suppliersResponse.json();
          setSuppliers(data.counterparties || []);
        }

        // Fetch countries
        const countriesResponse = await fetch('/api/countries');
        if (countriesResponse.ok) {
          const data = await countriesResponse.json();
          setCountries(data.countries || []);
        }
      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    };

    fetchReferenceData();
  }, []);

  // Function to handle search button click
  const handleSearch = () => {
    setAppliedFilters({
      dateRange,
      supplier,
      targetCountry,
    });
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
        console.log('Raw API response:', data);

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

        // Process the data and transform to grid format
        const gridData = data.purchases.map((item: PurchaseResponseItem) => {
          const rowData = {
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
            purchase_remarks: item.purchase_remarks || ''
          };
          
          console.log('Row data:', rowData);
          return rowData;
        });

        console.log('Processed grid data:', gridData);
        setPurchaseData(gridData);
      } catch (error) {
        console.error('Error fetching purchase data:', error);
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
      // Fetch the complete purchase data using the chassis number
      const response = await fetch(`/api/transactions/purchases?chassis=${row.chassis_no}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch purchase data');
      }
      
      const data = await response.json();
      
      if (data.purchases && data.purchases.length > 0) {
        // Set editing mode and open modal with the first purchase found
        setIsEditing(true);
        setSelectedPurchase(data.purchases[0]);
        setIsModalOpen(true);
      } else {
        console.error('No purchase data found for chassis number:', row.chassis_no);
        toast({
          title: 'Error',
          description: 'Could not find purchase data for editing',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching purchase data for editing:', error);
      toast({
        title: 'Error',
        description: 'Failed to load purchase data for editing',
        variant: 'destructive',
      });
    }
  };

  return (
    <PageTemplate title="Vehicle Purchases">
      {/* Filter Panel - New Layout */}
      <div className="flex flex-wrap items-end gap-4 mb-6 w-full">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Purchase date</span>
          <DatePicker
            value={dateRange.from}
            onChange={(newValue: Dayjs | null) =>
              setDateRange((prev) => ({ ...prev, from: newValue || dayjs() }))
            }
            format="YYYY-MM-DD"
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: '160px' },
              },
            }}
          />
          <DatePicker
            value={dateRange.to}
            onChange={(newValue: Dayjs | null) =>
              setDateRange((prev) => ({ ...prev, to: newValue || dayjs() }))
            }
            format="YYYY-MM-DD"
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: '160px' },
              },
            }}
          />
        </div>
        &nbsp;&nbsp;
        <div className="flex w-max items-center  gap-4">
          <FormControl sx={{ minWidth: '320px' }} size="small">
            <InputLabel>Supplier</InputLabel>
            <Select
              value={supplier}
              label="Supplier"
              onChange={(e) => setSupplier(e.target.value as string)}
            >
              <MenuItem value="">All Suppliers</MenuItem>
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.code} value={supplier.code}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          &nbsp;
          <FormControl sx={{ minWidth: '280px' }} size="small">
            <InputLabel>Target Country</InputLabel>
            <Select
              value={targetCountry}
              label="Target Country"
              onChange={(e) => setTargetCountry(e.target.value as string)}
            >
              <MenuItem value="">All Countries</MenuItem>
              {countries.map((country) => (
                <MenuItem key={country.code} value={country.code}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          &nbsp;
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 bg-maroon-600 hover:bg-red-800 text-white px-4 py-2 rounded-md"
          >
            Search
          </button>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={openNewPurchaseModal}
            className="flex items-center gap-2 bg-maroon-600 hover:bg-red-800 text-white px-4 py-2 rounded-md"
          >
            <Plus size={16} />
            Add New Purchase
          </button>
        </div>
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
              paginationModel: { pageSize: 10 },
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
          sx={{
            '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': { py: 1 },
            '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': { py: 1.5 },
            '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': { py: 2 },
            '& .MuiDataGrid-columnHeaderTitle': {fontWeight: 'bold' },
            '& .MuiDataGrid-columnHeaders div[role="row"]': {
              backgroundColor: '#de9b9b',
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

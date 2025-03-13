'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import PictureTab from './PictureTab';
import { useCompany } from '@/app/contexts/CompanyContext';
import { toast } from '@/app/components/ui/use-toast';
import { Save, X, Search, Upload, Camera, Calendar, RefreshCw } from 'lucide-react';
import { formatDateYYYYMMDD, parseDateToYYYYMMDD } from '@/app/lib/utils';
import { logDebug, logError } from '@/app/lib/logging';
// Types
interface Counterparty {
  code: string;
  name: string | null;
  is_supplier: boolean;
}

// Vehicle type for nested vehicle data in API response
interface VehicleData {
  vehicle_name?: string;
  maker?: string;
  grade?: string;
  color?: string;
  seats?: number;
  doors?: number;
  mileage?: number;
  engine_no?: string;
  vehicle_type?: string;
  auction_ref_no?: string;
  inspection_rank?: number;
  target_country?: string;
  vehicle_location?: string;
  fuel_type?: string;
  cc?: number;
  is_auto?: boolean;
  is_ac?: boolean;
  is_power_steering?: boolean;
  is_power_windows?: boolean;
  is_power_lock?: boolean;
  is_power_mirror?: boolean;
  is_sun_roof?: boolean;
  is_high_roof?: boolean;
  is_4wd?: boolean;
  is_alloy_wheel?: boolean;
  is_full_option?: boolean;
  gear_type?: string;
  manufacture_yyyymm?: string;
}

// At the top with other interfaces
type FuelType = { name: string; description: string };
type Supplier = Pick<Counterparty, 'code' | 'name'>;
type VehicleMaker = { name: string };
type Color = { color: string };
type Location = { name: string };
type Country = { code: string; name: string };

// Form data type
export type PurchaseFormData = {
  purchase_date: string;
  supplier_code: string;
  supplier_name: string;
  chassis_no: string;
  vehicle_name: string;
  maker: string;
  grade: string;
  model: string;
  color: string;
  seats: number;
  doors: number;
  mileage: number;
  engine_no: string;
  vehicle_type: string;
  auction_ref_no: string;
  rank: number;
  target_country: string;
  stock_location: string;
  payment_date: string;
  fuel_type: string;
  cc: number;
  is_auto: boolean;
  is_ac: boolean;
  is_power_steering: boolean;
  is_power_windows: boolean;
  is_power_lock: boolean;
  is_power_mirror: boolean;
  is_sun_roof: boolean;
  is_high_roof: boolean;
  is_4wd: boolean;
  is_alloy_wheel: boolean;
  is_full_option: boolean;
  is_active: boolean;
  gear_type: string;
  purchase_cost: number;
  auction_fee: number;
  tax: number; // Added GST tax field
  commission: number;
  recycle_fee: number;
  road_tax: number;
  total_vehicle_fee: number;
  currency: string;
  purchase_remarks: string;
};

// API response interface that includes vehicle data
interface PurchaseApiResponse {
  [key: string]: string | number | boolean | VehicleData | undefined;
  vehicle?: VehicleData;
}

export default function PurchaseEntryForm({
  isEditing = false,
  initialData = null,
  onClose,
}: {
  isEditing?: boolean;
  initialData?: PurchaseApiResponse | null;
  onClose: () => void;
}) {
  // State for data and UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeTab, setActiveTab] = useState<'vehicle' | 'documents' | 'pictures'>('vehicle');
  // Add to the state declarations
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [makers, setMakers] = useState<VehicleMaker[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);

  // Get company info for tax percentage
  const { company } = useCompany();
  const taxPercent = company?.taxpercent || 0;

  // Default form data
  const defaultFormData: PurchaseFormData = {
    purchase_date: formatDateYYYYMMDD(new Date()),
    supplier_code: '',
    supplier_name: '',
    chassis_no: '',
    vehicle_name: '',
    maker: 'TOYOTA', // Set default maker to TOYOTA
    grade: '',
    model: '',
    color: '',
    seats: 0,
    doors: 0,
    mileage: 0,
    engine_no: '',
    vehicle_type: '',
    auction_ref_no: '',
    rank: 0,
    target_country: '',
    stock_location: '',
    payment_date: '',
    fuel_type: '',
    cc: 0,
    is_auto: false,
    is_ac: false,
    is_power_steering: false,
    is_power_windows: false,
    is_power_lock: false,
    is_power_mirror: false,
    is_sun_roof: false,
    is_high_roof: false,
    is_4wd: false,
    is_alloy_wheel: false,
    is_full_option: false,
    is_active: true,
    gear_type: '',
    purchase_cost: 0,
    auction_fee: 0,
    tax: 0, // Added GST tax field
    commission: 0,
    recycle_fee: 0,
    road_tax: 0,
    total_vehicle_fee: 0,
    currency: 'JPY',
    purchase_remarks: '',
  };

  // Initialize form data
  const [formData, setFormData] = useState<PurchaseFormData>(() => {
    if (!initialData) return defaultFormData;

    logDebug('Init data before mapping = ' + JSON.stringify(initialData));
    // Map the API response to form data, handling nested vehicle data
    const mappedData: PurchaseFormData = { ...defaultFormData };

    // Map purchase fields directly using type-safe approach
    Object.keys(initialData).forEach((key) => {
      if (key !== 'vehicle' && key in mappedData) {
        const value = initialData[key as keyof PurchaseApiResponse];
        if (value !== undefined) {
          // Use type-safe approach to assign values
          switch (key) {
            case 'purchase_date':
            case 'supplier_code':
            case 'supplier_name':
            case 'chassis_no':
            case 'vehicle_name':
            case 'maker':
            case 'grade':
            case 'model':
            case 'color':
            case 'engine_no':
            case 'vehicle_type':
            case 'auction_ref_no':
            case 'target_country':
            case 'stock_location':
            case 'payment_date':
            case 'fuel_type':
            case 'gear_type':
            case 'currency':
            case 'purchase_remarks':
              mappedData[key] = String(value);
              break;
            case 'seats':
            case 'doors':
            case 'mileage':
            case 'rank':
            case 'cc':
            case 'purchase_cost':
            case 'auction_fee':
            case 'tax':
            case 'commission':
            case 'recycle_fee':
            case 'road_tax':
            case 'total_vehicle_fee':
              mappedData[key] = Number(value);
              break;
            case 'is_auto':
            case 'is_ac':
            case 'is_power_steering':
            case 'is_power_windows':
            case 'is_power_lock':
            case 'is_power_mirror':
            case 'is_sun_roof':
            case 'is_high_roof':
            case 'is_4wd':
            case 'is_alloy_wheel':
            case 'is_full_option':
            case 'is_active':
              mappedData[key] = Boolean(value);
              break;
          }
        }
      }
    });

    // Map vehicle fields if present
    if (initialData.vehicle) {
      const vehicle = initialData.vehicle;

      // Map each vehicle field to the corresponding form field
      if (vehicle.vehicle_name !== undefined) mappedData.vehicle_name = vehicle.vehicle_name;
      if (vehicle.maker !== undefined) mappedData.maker = vehicle.maker;
      if (vehicle.grade !== undefined) mappedData.grade = vehicle.grade;
      if (vehicle.color !== undefined) mappedData.color = vehicle.color;
      if (vehicle.seats !== undefined) mappedData.seats = vehicle.seats;
      if (vehicle.doors !== undefined) mappedData.doors = vehicle.doors;
      if (vehicle.mileage !== undefined) mappedData.mileage = vehicle.mileage;
      if (vehicle.engine_no !== undefined) mappedData.engine_no = vehicle.engine_no;
      if (vehicle.vehicle_type !== undefined) mappedData.vehicle_type = vehicle.vehicle_type;
      if (vehicle.auction_ref_no !== undefined) mappedData.auction_ref_no = vehicle.auction_ref_no;
      if (vehicle.inspection_rank !== undefined) mappedData.rank = vehicle.inspection_rank;
      if (vehicle.target_country !== undefined) mappedData.target_country = vehicle.target_country;
      if (vehicle.vehicle_location !== undefined)
        mappedData.stock_location = vehicle.vehicle_location;
      if (vehicle.fuel_type !== undefined) mappedData.fuel_type = vehicle.fuel_type;
      if (vehicle.cc !== undefined) mappedData.cc = vehicle.cc;
      if (vehicle.is_auto !== undefined) mappedData.is_auto = vehicle.is_auto;
      if (vehicle.is_ac !== undefined) mappedData.is_ac = vehicle.is_ac;
      if (vehicle.is_power_steering !== undefined)
        mappedData.is_power_steering = vehicle.is_power_steering;
      if (vehicle.is_power_windows !== undefined)
        mappedData.is_power_windows = vehicle.is_power_windows;
      if (vehicle.is_power_lock !== undefined) mappedData.is_power_lock = vehicle.is_power_lock;
      if (vehicle.is_power_mirror !== undefined)
        mappedData.is_power_mirror = vehicle.is_power_mirror;
      if (vehicle.is_sun_roof !== undefined) mappedData.is_sun_roof = vehicle.is_sun_roof;
      if (vehicle.is_high_roof !== undefined) mappedData.is_high_roof = vehicle.is_high_roof;
      if (vehicle.is_4wd !== undefined) mappedData.is_4wd = vehicle.is_4wd;
      if (vehicle.is_alloy_wheel !== undefined) mappedData.is_alloy_wheel = vehicle.is_alloy_wheel;
      if (vehicle.is_full_option !== undefined) mappedData.is_full_option = vehicle.is_full_option;
      if (vehicle.gear_type !== undefined) mappedData.gear_type = vehicle.gear_type;
      if (vehicle.manufacture_yyyymm !== undefined) mappedData.model = vehicle.manufacture_yyyymm;
    }

    // Format dates for the form
    if (mappedData.purchase_date !== undefined) {
      if (typeof mappedData.purchase_date === 'number') {
        // Handle numeric format (YYYYMMDD)
        const dateStr = String(mappedData.purchase_date);
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        mappedData.purchase_date = `${year}-${month}-${day}`;
      } else if (typeof mappedData.purchase_date === 'string') {
        // If it's already a string, ensure it's in YYYY-MM-DD format
        if (mappedData.purchase_date.length === 8 && !mappedData.purchase_date.includes('-')) {
          // Convert YYYYMMDD string to YYYY-MM-DD
          const year = mappedData.purchase_date.substring(0, 4);
          const month = mappedData.purchase_date.substring(4, 6);
          const day = mappedData.purchase_date.substring(6, 8);
          mappedData.purchase_date = `${year}-${month}-${day}`;
        } else if (mappedData.purchase_date.includes('T')) {
          // Handle ISO date format
          mappedData.purchase_date = mappedData.purchase_date.split('T')[0];
        }
      }
      // If it's already in YYYY-MM-DD format, keep it as is
    } else {
      // Default to today if no date provided
      mappedData.purchase_date = formatDateYYYYMMDD(new Date());
    }

    if (mappedData.payment_date !== undefined) {
      if (typeof mappedData.payment_date === 'number') {
        // Handle numeric format (YYYYMMDD)
        const dateStr = String(mappedData.payment_date);
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        mappedData.payment_date = `${year}-${month}-${day}`;
      } else if (typeof mappedData.payment_date === 'string') {
        // If it's already a string, ensure it's in YYYY-MM-DD format
        if (mappedData.payment_date.length === 8 && !mappedData.payment_date.includes('-')) {
          // Convert YYYYMMDD string to YYYY-MM-DD
          const year = mappedData.payment_date.substring(0, 4);
          const month = mappedData.payment_date.substring(4, 6);
          const day = mappedData.payment_date.substring(6, 8);
          mappedData.payment_date = `${year}-${month}-${day}`;
        } else if (mappedData.payment_date.includes('T')) {
          // Handle ISO date format
          mappedData.payment_date = mappedData.payment_date.split('T')[0];
        }
      }
      // If it's already in YYYY-MM-DD format, keep it as is
    }
    logDebug('Mapped form data = ' + JSON.stringify(mappedData));
    return mappedData;
  });

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const [vehicleTypes, setVehicleTypes] = useState<{ vehicle_type: string }[]>([]);

  // Reference to track if data has been fetched to prevent duplicate calls
  const dataFetchedRef = useRef(false);

  // Fetch all reference data
  const fetchReferenceData = useCallback(async () => {
    // Skip fetching if data has already been fetched
    if (dataFetchedRef.current) {
      setLoading(false);
      return;
    }

    try {
      // Use the optimized combined reference data endpoint
      const requestOptions: RequestInit = {
        credentials: 'include' as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch('/api/getReferenceList/purchase', requestOptions);

      if (response.ok) {
        const data = await response.json();
        const refData = data.referenceData;

        // Set all reference data at once
        setSuppliers(refData.counterparties || []);
        setFuelTypes(refData.fuelTypes || []);
        setMakers(refData.makers || []);
        setColors(refData.colors || []);
        setLocations(refData.locations || []);
        setCountries(refData.countries || []);
        setVehicleTypes(refData.vehicleTypes || []);

        logDebug('All reference data loaded successfully');

        // Mark data as fetched to prevent duplicate calls
        dataFetchedRef.current = true;
      } else {
        throw new Error(`Failed to fetch reference data: ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logError(`Error fetching reference data: ${errorMessage}`);

      toast({
        title: 'Error',
        description: 'Failed to load reference data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-calculate GST tax
  useEffect(() => {
    if (taxPercent) {
      const purchaseCost = Number(formData.purchase_cost || 0);
      const auctionFee = Number(formData.auction_fee || 0);

      const calculatedTax = purchaseCost * (taxPercent / 100) + auctionFee * (taxPercent / 100);

      setFormData((prev) => ({
        ...prev,
        tax: Math.round(calculatedTax), // Round to nearest whole number
      }));
    }
  }, [formData.purchase_cost, formData.auction_fee, taxPercent]);

  // Auto-calculate total cost
  useEffect(() => {
    const total =
      Number(formData.purchase_cost || 0) +
      Number(formData.auction_fee || 0) +
      Number(formData.tax || 0) + // Include tax in total
      Number(formData.commission || 0) +
      Number(formData.recycle_fee || 0) +
      Number(formData.road_tax || 0);

    setFormData((prev) => ({ ...prev, total_vehicle_fee: total }));
  }, [
    formData.purchase_cost,
    formData.auction_fee,
    formData.tax, // Add tax to dependencies
    formData.commission,
    formData.recycle_fee,
    formData.road_tax,
  ]);

  // Load data on mount
  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  // Log form data for debugging
  useEffect(() => {
    logDebug(`Current form data: ${JSON.stringify(formData)}`);
  }, [formData]);

  // Filter suppliers based on search
  useEffect(() => {
    if (supplierSearch.trim() === '') {
      setFilteredSuppliers([]);
    } else {
      const searchLower = supplierSearch.toLowerCase();
      setFilteredSuppliers(
        suppliers.filter(
          (s) =>
            s.code.toLowerCase().includes(searchLower) ||
            (s.name && s.name.toLowerCase().includes(searchLower))
        )
      );
    }
  }, [supplierSearch, suppliers]);

  // Event handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, decimalPlaces = 0) => {
    const { name, value } = e.target;
    let numValue = value.trim() === '' ? 0 : parseFloat(value);

    if (!isNaN(numValue)) {
      if (decimalPlaces > 0) {
        numValue = parseFloat(numValue.toFixed(decimalPlaces));
      } else {
        numValue = Math.round(numValue);
      }

      setFormData((prev) => ({ ...prev, [name]: numValue }));
    }
  };

  const handleSupplierSelect = (supplierCode: string) => {
    const supplier = suppliers.find((s) => s.code === supplierCode);
    if (supplier) {
      setFormData((prev) => ({
        ...prev,
        supplier_code: supplier.code,
        supplier_name: supplier.name || '',
      }));
    }
  };

  const openDocumentUpload = () => {
    toast({
      title: 'Feature Coming Soon',
      description: 'Document upload functionality is under development.',
    });
  };

  const openPictureUpload = () => {
    setActiveTab('pictures');
  };

  const handleSave = async () => {
    if (!formData.purchase_date || !formData.supplier_code || !formData.chassis_no) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const formattedData = {
        ...formData,
        purchase_date: parseDateToYYYYMMDD(new Date(formData.purchase_date)),
        payment_date: formData.payment_date
          ? parseDateToYYYYMMDD(new Date(formData.payment_date))
          : undefined,
      };

      const response = await fetch('/api/transactions/purchases', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' as RequestCredentials, // Add credentials for JWT cookies
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save purchase');
      }

      toast({
        title: 'Success',
        description: `Vehicle purchase ${isEditing ? 'updated' : 'created'} successfully.`,
      });

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logError(`Error saving purchase: ${errorMessage}`);
      toast({
        title: 'Error',
        description: `Failed to save purchase. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin mr-2">
          <RefreshCw size={16} />
        </div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-y-auto overflow-x-hidden max-h-[95vh]">
      {/* Header */}
      <div className="sticky top-0 z-10 flex justify-between items-center p-2 bg-red-50 border-b">
        <h2 className="text-base font-semibold">
          {isEditing ? 'Edit Purchase' : 'New Vehicle Purchase'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 bg-maroon-600 hover:bg-maroon-700 text-white px-2 py-1 rounded-md text-xs"
          >
            {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
            {isEditing ? 'Update' : 'Save'}
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-md text-xs"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      </div>

      <div className="p-2">
        {/* Purchase Info - All in one line with labels inline */}
        <div className="flex items-center gap-2 mb-4">
          <label className="text-xs font-medium whitespace-nowrap">
            <span className="text-red-600">Purchase Date *</span>
          </label>
          <div className="relative w-52">
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleInputChange}
              className="pl-6 pr-2 py-1 w-full border border-gray-300 rounded-md text-xs"
            />
            <Calendar
              className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={12}
            />
          </div>

          <label className="text-xs font-medium ml-4 whitespace-nowrap">
            <span className="text-red-600">Supplier *</span>
          </label>
          <div className="relative w-64">
            <input
              type="text"
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              placeholder="Search supplier..."
              className="pl-6 pr-2 py-1 w-full border border-gray-300 rounded-md text-xs"
            />
            <Search
              className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={12}
            />

            {supplierSearch && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier) => (
                    <div
                      key={supplier.code}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        handleSupplierSelect(supplier.code);
                        setSupplierSearch('');
                      }}
                    >
                      <div className="font-medium text-xs">
                        {supplier.code}
                        {supplier.name ? `: ${supplier.name}` : ''}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-2 py-1 text-gray-500 text-xs">No matches found</div>
                )}
              </div>
            )}
          </div>

          {formData.supplier_name && (
            <span className="text-xs text-gray-600 truncate ml-1">{formData.supplier_name}</span>
          )}

          <div className="ml-auto">
            <label className="text-xs font-medium whitespace-nowrap">Payment Date</label>
            &nbsp;
            <input
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleInputChange}
              className="py-1 px-2 border border-gray-300 rounded-md text-xs"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-2">
          <ul className="flex -mb-px">
            <li className="mr-1">
              <button
                onClick={() => setActiveTab('vehicle')}
                className={`inline-flex items-center px-2 py-1 font-medium text-xs ${
                  activeTab === 'vehicle'
                    ? 'border-b-2 border-maroon-600 text-maroon-600'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                }`}
              >
                Vehicle Details
              </button>
            </li>
            <li className="mr-1">
              <button
                onClick={openDocumentUpload}
                className={`inline-flex items-center px-2 py-1 font-medium text-xs ${
                  activeTab === 'documents'
                    ? 'border-b-2 border-maroon-600 text-maroon-600'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                }`}
              >
                <Upload className="mr-1" size={10} />
                Documents
              </button>
            </li>
            <li>
              <button
                onClick={openPictureUpload}
                className={`inline-flex items-center px-2 py-1 font-medium text-xs ${
                  activeTab === 'pictures'
                    ? 'border-b-2 border-maroon-600 text-maroon-600'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                }`}
              >
                <Camera className="mr-1" size={10} />
                Pictures
              </button>
            </li>
          </ul>
        </div>

        {/* Vehicle Form - Only shown when vehicle tab is active */}
        {activeTab === 'vehicle' && (
          <div className="space-y-3">
            {/* Row 1: Left - Chassis No, Vehicle Name | Right - Maker, Grade */}
            <div className="flex gap-5">
              {/* Left column */}
              <div className="w-1/2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      <span className="text-red-600">Chassis No *</span>
                    </label>
                    <input
                      type="text"
                      name="chassis_no"
                      value={formData.chassis_no}
                      onChange={handleInputChange}
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Vehicle Name</label>
                    <input
                      type="text"
                      name="vehicle_name"
                      value={formData.vehicle_name}
                      onChange={handleInputChange}
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="w-1/2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Maker</label>
                    <select
                      name="maker"
                      value={formData.maker}
                      onChange={handleInputChange}
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                    >
                      <option value="">Select</option>
                      {makers.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Grade</label>
                    <input
                      type="text"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Left - Mileage, Engine (cc) | Right - Model, Color */}
            <div className="flex gap-5">
              {/* Left column */}
              <div className="w-1/2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Mileage (km)</label>
                    <input
                      type="number"
                      name="mileage"
                      value={formData.mileage}
                      onChange={(e) => handleNumberChange(e)}
                      className="w-10px py-1 px-2 border border-gray-300 rounded-md text-xs text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Engine (cc)</label>
                    <input
                      type="number"
                      name="cc"
                      value={formData.cc}
                      onChange={(e) => handleNumberChange(e)}
                      className="w-10px py-1 px-2 border border-gray-300 rounded-md text-xs text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Model (YYYY/MM)</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="YYYY/MM"
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="w-1/2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Color</label>
                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                    >
                      <option value="">Select</option>
                      {colors.map((c) => (
                        <option key={c.color} value={c.color}>
                          {c.color}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Fuel Type</label>
                    <select
                      name="fuel_type"
                      value={formData.fuel_type}
                      onChange={handleInputChange}
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                    >
                      <option value="">Select</option>
                      {fuelTypes.map((ft) => (
                        <option key={ft.name} value={ft.name}>
                          {ft.name + ' : ' + ft.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Left - Seats, Doors | Right - Gear Type, Engine No */}
            <div className="flex gap-5">
              {/* Left column */}
              <div className="w-1/2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Seats</label>
                    <input
                      type="number"
                      name="seats"
                      value={formData.seats}
                      onChange={(e) => handleNumberChange(e)}
                      min="0"
                      className="w-10px py-1 px-2 border border-gray-300 rounded-md text-xs text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Doors</label>
                    <input
                      type="number"
                      name="doors"
                      value={formData.doors}
                      onChange={(e) => handleNumberChange(e)}
                      min="0"
                      className="w-10px py-1 px-2 border border-gray-300 rounded-md text-xs text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Vehicle Type</label>
                    <select
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      onChange={handleInputChange}
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                    >
                      <option value="">Select</option>
                      {vehicleTypes.map((vt) => (
                        <option key={vt.vehicle_type} value={vt.vehicle_type}>
                          {vt.vehicle_type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="w-1/2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Gear Type</label>
                    <select
                      name="gear_type"
                      value={formData.gear_type}
                      onChange={handleInputChange}
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                    >
                      <option value="">Select</option>
                      <option value="5F">5-Speed Manual</option>
                      <option value="4C">4-Speed Auto</option>
                      <option value="CVT">CVT</option>
                      <option value="DCT">Dual Clutch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Engine No.</label>
                    <input
                      type="text"
                      name="engine_no"
                      value={formData.engine_no}
                      onChange={handleInputChange}
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Attributes Checkboxes */}
            <div className="border border-gray-200 rounded-md p-1">
              <div className="grid grid-cols-6 gap-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_auto"
                    name="is_auto"
                    checked={formData.is_auto}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_auto: e.target.checked }))
                    }
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="is_auto" className="text-xs">
                    Auto
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_ac"
                    name="is_ac"
                    checked={formData.is_ac}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_ac: e.target.checked }))}
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="is_ac" className="text-xs">
                    AC
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_power_steering"
                    name="is_power_steering"
                    checked={formData.is_power_steering}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_power_steering: e.target.checked }))
                    }
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="is_power_steering" className="text-xs">
                    PS
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_power_lock"
                    name="is_power_lock"
                    checked={formData.is_power_lock}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_power_lock: e.target.checked }))
                    }
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="is_power_lock" className="text-xs">
                    PL
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_power_mirror"
                    name="is_power_mirror"
                    checked={formData.is_power_mirror}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_power_mirror: e.target.checked }))
                    }
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="is_power_mirror" className="text-xs">
                    PM
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_power_windows"
                    name="is_power_windows"
                    checked={formData.is_power_windows}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_power_windows: e.target.checked }))
                    }
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="is_power_windows" className="text-xs">
                    PW
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_sun_roof"
                    name="is_sun_roof"
                    checked={formData.is_sun_roof}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_sun_roof: e.target.checked }))
                    }
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="is_sun_roof" className="text-xs">
                    SR
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_high_roof"
                    name="is_high_roof"
                    checked={formData.is_high_roof}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_high_roof: e.target.checked }))
                    }
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="is_high_roof" className="text-xs">
                    HR
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_4wd"
                    name="is_4wd"
                    checked={formData.is_4wd}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_4wd: e.target.checked }))}
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="is_4wd" className="text-xs">
                    4WD
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_alloy_wheel"
                    name="is_alloy_wheel"
                    checked={formData.is_alloy_wheel}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_alloy_wheel: e.target.checked }))
                    }
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="is_alloy_wheel" className="text-xs">
                    AW
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_full_option"
                    name="is_full_option"
                    checked={formData.is_full_option}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_full_option: e.target.checked }))
                    }
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="is_full_option" className="text-xs">
                    Full Opts
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                    }
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="is_active" className="text-xs">
                    Active?
                  </label>
                </div>
              </div>
            </div>

            {/* Row 4: Left - Inspection Rank, Auction No | Right - Stock Location, Target Country */}
            <div className="flex gap-5">
              {/* Left column */}
              <div className="w-1/2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Inspection Rank</label>
                    <input
                      type="number"
                      name="rank"
                      value={formData.rank}
                      onChange={(e) => handleNumberChange(e, 1)}
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Auction No.</label>
                    <input
                      type="text"
                      name="auction_ref_no"
                      value={formData.auction_ref_no}
                      onChange={handleInputChange}
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="w-1/2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Stock Location</label>
                    <select
                      name="stock_location"
                      value={formData.stock_location}
                      onChange={handleInputChange}
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                    >
                      <option value="">Select</option>
                      {locations.map((loc) => (
                        <option key={loc.name} value={loc.name}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Target Country</label>
                    <select
                      name="target_country"
                      value={formData.target_country}
                      onChange={handleInputChange}
                      className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                    >
                      <option value="">Select</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Section */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-8 gap-2">
                <div>
                  <label className="block text-xs mb-1">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                  >
                    <option value={company?.base_currency || 'JPY'}>
                      {company?.base_currency || 'JPY'}
                    </option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs mb-1">Vehicle Price</label>
                  <input
                    type="number"
                    name="purchase_cost"
                    value={formData.purchase_cost}
                    onChange={(e) => handleNumberChange(e)}
                    className="w-full py-1 px-2 border text-right rounded-md text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1">Auction Fee</label>
                  <input
                    type="number"
                    name="auction_fee"
                    value={formData.auction_fee}
                    onChange={(e) => handleNumberChange(e)}
                    className="w-full py-1 px-2 border text-right rounded-md text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1">GST ({taxPercent}%)</label>
                  <input
                    type="number"
                    name="tax"
                    value={formData.tax}
                    onChange={(e) => handleNumberChange(e)}
                    className="w-full py-1 px-2 border text-right rounded-md text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1">Commission</label>
                  <input
                    type="number"
                    name="commission"
                    value={formData.commission}
                    onChange={(e) => handleNumberChange(e)}
                    className="w-full py-1 px-2 border text-right rounded-md text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1">Recycle Fee</label>
                  <input
                    type="number"
                    name="recycle_fee"
                    value={formData.recycle_fee}
                    onChange={(e) => handleNumberChange(e)}
                    className="w-full py-1 px-2 border text-right rounded-md text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1">Road Tax</label>
                  <input
                    type="number"
                    name="road_tax"
                    value={formData.road_tax}
                    onChange={(e) => handleNumberChange(e)}
                    className="w-full py-1 px-2 border text-right rounded-md text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1">Total Cost</label>
                  <input
                    type="text"
                    value={formatNumber(formData.total_vehicle_fee)}
                    readOnly
                    className="w-full py-1 px-2 border bg-gray-50 text-right rounded-md text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 whitespace-nowrap">Remarks</span>
              <input
                type="text"
                name="purchase_remarks"
                value={formData.purchase_remarks}
                onChange={handleInputChange}
                className="flex-1 py-1 px-2 border border-gray-300 rounded-md text-xs"
                placeholder="Additional information or comments"
              />
            </div>
          </div>
        )}

        {/* Pictures Tab Component */}
        <PictureTab chassisNo={formData.chassis_no} isVisible={activeTab === 'pictures'} />
      </div>
    </div>
  );
}

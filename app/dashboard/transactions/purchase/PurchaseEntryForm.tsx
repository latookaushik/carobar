"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/app/components/ui/use-toast";
import { Save, X, Search, Upload, Camera, Calendar, RefreshCw } from "lucide-react";
import { formatDateYYYYMMDD, parseDateToYYYYMMDD } from "@/app/lib/helpers";

// Types
interface Counterparty {
  code: string;
  name: string | null;
  is_supplier: boolean;
}

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
  commission: number;
  recycle_fee: number;
  road_tax: number;
  total_vehicle_fee: number;
  currency: string;
  purchase_remarks: string;
};

export default function PurchaseEntryForm({
  isEditing = false,
  initialData = null,
  onClose
}: {
  isEditing?: boolean;
  initialData?: Partial<PurchaseFormData> | null;
  onClose: () => void;
}) {
  // State for data and UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [makers, setMakers] = useState<VehicleMaker[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  
  // Default form data
  const defaultFormData: PurchaseFormData = {
    purchase_date: formatDateYYYYMMDD(new Date()),
    supplier_code: "",
    supplier_name: "",
    chassis_no: "",
    vehicle_name: "",
    maker: "",
    grade: "",
    model: "",
    color: "",
    seats: 0,
    doors: 0,
    mileage: 0,
    engine_no: "",
    vehicle_type: "",
    auction_ref_no: "",
    rank: 0,
    target_country: "",
    stock_location: "",
    payment_date: "",
    fuel_type: "",
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
    gear_type: "",
    purchase_cost: 0,
    auction_fee: 0,
    commission: 0,
    recycle_fee: 0,
    road_tax: 0,
    total_vehicle_fee: 0,
    currency: "JPY",
    purchase_remarks: ""
  };
  
  // Initialize form data
  const [formData, setFormData] = useState<PurchaseFormData>(
    initialData ? { ...defaultFormData, ...initialData } : defaultFormData
  );
  
  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  const [vehicleTypes, setVehicleTypes] = useState<{vehicle_type: string}[]>([]);

  // Fetch all reference data
  const fetchReferenceData = useCallback(async () => {
    try {
      // Suppliers
      const suppliersRes = await fetch('/api/counterparties');
      if (suppliersRes.ok) {
        const data = await suppliersRes.json();
        setSuppliers(data.counterparties?.filter((c: Counterparty) => c.is_supplier) || []);
      }
      
      // Makers
      const makersRes = await fetch('/api/makers');
      if (makersRes.ok) {
        const data = await makersRes.json();
        setMakers(data.makers || []);
      }
      
      // Colors
      const colorsRes = await fetch('/api/colors');
      if (colorsRes.ok) {
        const data = await colorsRes.json();
        setColors(data.colors || []);
      }
      
      // Locations
      const locationsRes = await fetch('/api/locations');
      if (locationsRes.ok) {
        const data = await locationsRes.json();
        setLocations(data.locations || []);
      }
      
      // Countries
      const countriesRes = await fetch('/api/countries');
      if (countriesRes.ok) {
        const data = await countriesRes.json();
        setCountries(data.countries || []);
      }
      
      // Vehicle Types
      const vehicleTypesRes = await fetch('/api/vehicle-types');
      if (vehicleTypesRes.ok) {
        const data = await vehicleTypesRes.json();
        setVehicleTypes(data.vehicleTypes || []);
      }
    } catch (error) {
      console.error("Error fetching reference data:", error);
      toast({
        title: "Error",
        description: "Failed to load reference data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Auto-calculate total cost
  useEffect(() => {
    const total = (
      Number(formData.purchase_cost || 0) +
      Number(formData.auction_fee || 0) +
      Number(formData.commission || 0) +
      Number(formData.recycle_fee || 0) +
      Number(formData.road_tax || 0)
    );
    
    setFormData(prev => ({ ...prev, total_vehicle_fee: total }));
  }, [
    formData.purchase_cost,
    formData.auction_fee,
    formData.commission,
    formData.recycle_fee,
    formData.road_tax
  ]);
  
  // Load data on mount
  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);
  
  // Filter suppliers based on search
  useEffect(() => {
    if (supplierSearch.trim() === '') {
      setFilteredSuppliers([]);
    } else {
      const searchLower = supplierSearch.toLowerCase();
      setFilteredSuppliers(
        suppliers.filter(
          s => s.code.toLowerCase().includes(searchLower) || 
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
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
      
      setFormData(prev => ({ ...prev, [name]: numValue }));
    }
  };
  
  const handleSupplierSelect = (supplierCode: string) => {
    const supplier = suppliers.find(s => s.code === supplierCode);
    if (supplier) {
      setFormData(prev => ({
        ...prev,
        supplier_code: supplier.code,
        supplier_name: supplier.name || ''
      }));
    }
  };
  
  const openDocumentUpload = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Document upload functionality is under development."
    });
  };
  
  const openPictureUpload = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Picture upload functionality is under development."
    });
  };
  
  const handleSave = async () => {
    if (!formData.purchase_date || !formData.supplier_code || !formData.chassis_no) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    
    try {
      const formattedData = {
        ...formData,
        purchase_date: parseDateToYYYYMMDD(new Date(formData.purchase_date)),
        payment_date: formData.payment_date ? parseDateToYYYYMMDD(new Date(formData.payment_date)) : undefined
      };
      
      const response = await fetch('/api/transactions/purchases', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save purchase');
      }
      
      toast({
        title: "Success",
        description: `Vehicle purchase ${isEditing ? 'updated' : 'created'} successfully.`
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving purchase:", error);
      toast({
        title: "Error",
        description: `Failed to save purchase. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin mr-2"><RefreshCw size={16} /></div>
        <span>Loading...</span>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg overflow-auto max-h-[85vh]">
      {/* Header */}
      <div className="sticky top-0 z-10 flex justify-between items-center p-2 bg-gray-100 border-b">
        <h2 className="text-base font-semibold">{isEditing ? "Edit Purchase" : "New Vehicle Purchase"}</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 bg-maroon-600 hover:bg-maroon-700 text-white px-2 py-1 rounded-md text-xs"
          >
            {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
            {isEditing ? "Update" : "Save"}
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
            <Calendar className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
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
            <Search className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
            
            {supplierSearch && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                {filteredSuppliers.length > 0 ? 
                  filteredSuppliers.map((supplier) => (
                    <div
                      key={supplier.code}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        handleSupplierSelect(supplier.code);
                        setSupplierSearch("");
                      }}
                    >
                      <div className="font-medium text-xs">{supplier.code}{supplier.name ? `: ${supplier.name}` : ''}</div>
                    </div>
                  )) : 
                  <div className="px-2 py-1 text-gray-500 text-xs">No matches found</div>
                }
              </div>
            )}
          </div>
          
          {formData.supplier_name && (
            <span className="text-xs text-gray-600 truncate ml-1">
              {formData.supplier_name}
            </span>
          )}
        </div>
      
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-2">
          <ul className="flex -mb-px">
            <li className="mr-1">
              <button className="inline-flex items-center px-2 py-1 font-medium text-xs border-b-2 border-maroon-600 text-maroon-600">
                Vehicle Details
              </button>
            </li>
            <li className="mr-1">
              <button
                onClick={openDocumentUpload}
                className="inline-flex items-center px-2 py-1 font-medium text-xs text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              >
                <Upload className="mr-1" size={10} />
                Documents
              </button>
            </li>
            <li>
              <button
                onClick={openPictureUpload}
                className="inline-flex items-center px-2 py-1 font-medium text-xs text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              >
                <Camera className="mr-1" size={10} />
                Pictures
              </button>
            </li>

            <li>
            <div>
                <label className="text-xs font-medium ml-4 whitespace-nowrap">Payment Date</label>&nbsp;
                <input
                    type="date"
                    name="payment_date"
                    value={formData.payment_date}
                    onChange={handleInputChange}
                    className="py-1 px-2 border border-gray-300 rounded-md text-xs"
                  />
              </div>
              </li>

          </ul>
        </div>
        
        {/* Vehicle Form - True 2-column layout */}
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
                    {makers.map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
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
                  <label className="block text-xs font-medium mb-1">Model (YYYYMM)</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="YYYYMM"
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
                    {colors.map(c => (
                      <option key={c.color} value={c.color}>{c.color}</option>
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
                  <option value="GAS">Gasoline</option>
                  <option value="DIE">Diesel</option>
                  <option value="HYB">Hybrid</option>
                  <option value="EV">Electric</option>
                  <option value="LPG">LPG</option>
                  <option value="CNG">CNG</option>
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
                  {vehicleTypes.map(vt => (
                    <option key={vt.vehicle_type} value={vt.vehicle_type}>{vt.vehicle_type}</option>
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
                    {locations.map(loc => (
                      <option key={loc.name} value={loc.name}>{loc.name}</option>
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
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        
          {/* Features */}
          <div className="mt-2">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="is_auto"
                  checked={formData.is_auto}
                  onChange={handleInputChange}
                  className="rounded h-3 w-3"
                />
                <span className="ml-1 text-xs">AT</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="is_ac"
                  checked={formData.is_ac}
                  onChange={handleInputChange}
                  className="rounded h-3 w-3"
                />
                <span className="ml-1 text-xs">AC</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="is_power_steering"
                  checked={formData.is_power_steering}
                  onChange={handleInputChange}
                  className="rounded h-3 w-3"
                />
                <span className="ml-1 text-xs">PS</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="is_power_windows"
                  checked={formData.is_power_windows}
                  onChange={handleInputChange}
                  className="rounded h-3 w-3"
                />
                <span className="ml-1 text-xs">PW</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="is_power_lock"
                  checked={formData.is_power_lock}
                  onChange={handleInputChange}
                  className="rounded h-3 w-3"
                />
                <span className="ml-1 text-xs">PL</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="is_power_mirror"
                  checked={formData.is_power_mirror}
                  onChange={handleInputChange}
                  className="rounded h-3 w-3"
                />
                <span className="ml-1 text-xs">PM</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="is_sun_roof"
                  checked={formData.is_sun_roof}
                  onChange={handleInputChange}
                  className="rounded h-3 w-3"
                />
                <span className="ml-1 text-xs">SR</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="is_high_roof"
                  checked={formData.is_high_roof}
                  onChange={handleInputChange}
                  className="rounded h-3 w-3"
                />
                <span className="ml-1 text-xs">HR</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="is_4wd"
                  checked={formData.is_4wd}
                  onChange={handleInputChange}
                  className="rounded h-3 w-3"
                />
                <span className="ml-1 text-xs">4WD</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="is_alloy_wheel"
                  checked={formData.is_alloy_wheel}
                  onChange={handleInputChange}
                  className="rounded h-3 w-3"
                />
                <span className="ml-1 text-xs">AW</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="is_full_option"
                  checked={formData.is_full_option}
                  onChange={handleInputChange}
                  className="rounded h-3 w-3"
                />
                <span className="ml-1 text-xs">Full</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="rounded h-3 w-3"
                />
                <span className="ml-1 text-xs">Is Active?</span>
              </label>

            </div>
          </div>
          
          {/* Financial Section */}
          <div>
     
              <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              <div>
                <label className="block text-xs mb-1">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
                >
                  <option value="JPY">JPY</option>
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
          <div>
            <h3 className="text-xs font-medium mb-1">Remarks</h3>
            <textarea
              name="purchase_remarks"
              value={formData.purchase_remarks}
              onChange={handleInputChange}
              rows={2}
              className="w-full py-1 px-2 border border-gray-300 rounded-md text-xs"
              placeholder="Additional information or comments"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

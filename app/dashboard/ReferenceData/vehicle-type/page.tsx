'use client';

/**
 * Vehicle Type Management Page
 *
 * Provides UI for viewing, adding, editing, and deleting vehicle types
 * for the authenticated user's company.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Role } from '@/app/lib/roles';
import PageTemplate from '@/app/components/PageTemplate';
import { PlusCircle, Edit, Trash2, Check, X, RefreshCw, Truck } from 'lucide-react';
import { toast } from '@/app/components/ui/use-toast';

interface VehicleType {
  vehicle_type: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export default function VehicleTypePage() {
  const {} = useAuth();

  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, { first_name: string; last_name: string }>>({});

  const [newType, setNewType] = useState('');
  const [addingType, setAddingType] = useState(false);

  const [editTypeId, setEditTypeId] = useState<string | null>(null);
  const [editTypeValue, setEditTypeValue] = useState('');

  // Load vehicle types and users on component mount
  useEffect(() => {
    fetchVehicleTypes();
    fetchUsers();
  }, []);

  // Function to fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();

      // Create a lookup object with user_id as key and name info as value
      const userMap: Record<string, { first_name: string; last_name: string }> = {};
      if (data.users) {
        data.users.forEach((user: { user_id: string; first_name: string; last_name: string }) => {
          userMap[user.user_id] = {
            first_name: user.first_name,
            last_name: user.last_name,
          };
        });
      }
      setUsers(userMap);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Function to fetch vehicle types from API
  const fetchVehicleTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vehicle-types');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch vehicle types');
      }

      const data = await response.json();
      setVehicleTypes(data.vehicleTypes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle adding a new vehicle type
  const handleAddType = async () => {
    if (!newType.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Vehicle type cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/vehicle-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vehicle_type: newType.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add vehicle type');
      }

      // Refresh vehicle types list and reset form
      await fetchVehicleTypes();
      setNewType('');
      setAddingType(false);

      toast({
        title: 'Success',
        description: 'Vehicle type added successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Function to handle updating a vehicle type
  const handleUpdateType = async (oldType: string) => {
    if (!editTypeValue.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Vehicle type cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Format the request body according to the referenceDataController format
      const requestBody = {
        oldType: {
          vehicle_type: oldType,
        },
        newType: {
          vehicle_type: editTypeValue.trim(),
        },
      };

      console.log('Sending vehicle type update request with oldType and newType:', requestBody);

      // Debugging the actual structure
      console.log('JSON.stringify body:', JSON.stringify(requestBody));

      const response = await fetch('/api/vehicle-types', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update vehicle type');
      }

      // Refresh vehicle types list and reset edit state
      await fetchVehicleTypes();
      setEditTypeId(null);
      setEditTypeValue('');

      toast({
        title: 'Success',
        description: 'Vehicle type updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Function to handle deleting a vehicle type
  const handleDeleteType = async (type: string) => {
    if (!window.confirm(`Are you sure you want to delete the vehicle type &quot;${type}&quot;?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/vehicle-types?vehicle_type=${encodeURIComponent(type)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete vehicle type');
      }

      // Refresh vehicle types list
      await fetchVehicleTypes();

      toast({
        title: 'Success',
        description: 'Vehicle type deleted successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Start editing a vehicle type
  const startEditType = (type: VehicleType) => {
    setEditTypeId(type.vehicle_type);
    setEditTypeValue(type.vehicle_type);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditTypeId(null);
    setEditTypeValue('');
  };

  return (
    <PageTemplate
      title="Vehicle Type Management"
      requiredRoles={[Role.ADMIN, Role.MANAGER, Role.STAFF]}
    >
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Vehicle Type Management</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchVehicleTypes}
              className="flex items-center gap-1 bg-maroon-600 text-white px-3 py-1 rounded hover:bg-red-600"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            {!addingType && (
              <button
                onClick={() => setAddingType(true)}
                className="flex items-center gap-1 bg-maroon-600 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                <PlusCircle size={16} />
                Add New Type
              </button>
            )}
          </div>
        </div>

        {/* Add new vehicle type form */}
        {addingType && (
          <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">Add New Vehicle Type</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type *
                </label>
                <input
                  type="text"
                  placeholder="Enter vehicle type"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full p-2 border rounded"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setAddingType(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddType}
                className="bg-maroon-600 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Add Type
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 my-4 bg-red-50 text-red-600 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* Vehicle types table */}
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full bg-white table-auto text-sm">
            <thead className="bg-maroon-700 text-white">
              <tr>
                <th className="py-2 px-4 border-b text-left">Vehicle Type</th>
                <th className="py-2 px-4 border-b text-left">Updated By</th>
                <th className="py-2 px-4 border-b text-left">Updated At</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      Loading vehicle types...
                    </div>
                  </td>
                </tr>
              ) : vehicleTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    No vehicle types found. Add your first type by clicking the &quot;Add New
                    Type&quot; button.
                  </td>
                </tr>
              ) : (
                vehicleTypes.map((type) => (
                  <tr key={type.vehicle_type} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {editTypeId === type.vehicle_type ? (
                        <input
                          type="text"
                          value={editTypeValue}
                          onChange={(e) => setEditTypeValue(e.target.value)}
                          className="w-full p-1 border rounded"
                          maxLength={100}
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Truck size={16} className="text-maroon-600" />
                          <span>{type.vehicle_type}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {users[type.updated_by]
                        ? `${users[type.updated_by].first_name} ${users[type.updated_by].last_name}`
                        : type.updated_by}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(type.updated_at)
                        .toLocaleString('en-GB', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false,
                        })
                        .replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6')}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {editTypeId === type.vehicle_type ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleUpdateType(type.vehicle_type)}
                            className="text-green-600 hover:text-green-800"
                            title="Save"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-500 hover:text-red-700"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => startEditType(type)} title="Edit">
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteType(type.vehicle_type)}
                            className="text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTemplate>
  );
}

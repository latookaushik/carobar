'use client';

/**
 * Location Management Page
 *
 * Provides UI for viewing, adding, editing, and deleting vehicle locations
 * for the authenticated user's company.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Role } from '@/app/lib/roles';
import PageTemplate from '@/app/components/PageTemplate';
import { PlusCircle, Edit, Trash2, Check, X, RefreshCw, MapPin } from 'lucide-react';
import { toast } from '@/app/components/ui/use-toast';

interface Location {
  name: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export default function LocationsPage() {
  const {} = useAuth();

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, { first_name: string; last_name: string }>>({});

  const [newLocation, setNewLocation] = useState('');
  const [addingLocation, setAddingLocation] = useState(false);

  const [editLocationId, setEditLocationId] = useState<string | null>(null);
  const [editLocationValue, setEditLocationValue] = useState('');

  // Load locations and users on component mount
  useEffect(() => {
    fetchLocations();
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

  // Function to fetch locations from API
  const fetchLocations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/locations');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch locations');
      }

      const data = await response.json();
      setLocations(data.locations || []);
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

  // Function to handle adding a new location
  const handleAddLocation = async () => {
    if (!newLocation.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Location name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newLocation.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add location');
      }

      // Refresh locations list and reset form
      await fetchLocations();
      setNewLocation('');
      setAddingLocation(false);

      toast({
        title: 'Success',
        description: 'Location added successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Function to handle updating a location
  const handleUpdateLocation = async (oldName: string) => {
    if (!editLocationValue.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Location name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Format the request body according to the referenceDataController format
      const requestBody = {
        oldLocation: {
          name: oldName,
        },
        newLocation: {
          name: editLocationValue.trim(),
        },
      };

      console.log('Sending location update request:', requestBody);

      const response = await fetch('/api/locations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update location');
      }

      // Refresh locations list and reset edit state
      await fetchLocations();
      setEditLocationId(null);
      setEditLocationValue('');

      toast({
        title: 'Success',
        description: 'Location updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Function to handle deleting a location
  const handleDeleteLocation = async (name: string) => {
    if (!window.confirm(`Are you sure you want to delete the location &quot;${name}&quot;?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/locations?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete location');
      }

      // Refresh locations list
      await fetchLocations();

      toast({
        title: 'Success',
        description: 'Location deleted successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Start editing a location
  const startEditLocation = (location: Location) => {
    setEditLocationId(location.name);
    setEditLocationValue(location.name);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditLocationId(null);
    setEditLocationValue('');
  };

  return (
    <PageTemplate
      title="Vehicle Location Management"
      requiredRoles={[Role.ADMIN, Role.MANAGER, Role.STAFF]}
    >
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Vehicle Location Management</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchLocations}
              className="flex items-center gap-1 bg-maroon-600 text-white px-3 py-1 rounded hover:bg-red-600"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            {!addingLocation && (
              <button
                onClick={() => setAddingLocation(true)}
                className="flex items-center gap-1 bg-maroon-600 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                <PlusCircle size={16} />
                Add New Location
              </button>
            )}
          </div>
        </div>

        {/* Add new location form */}
        {addingLocation && (
          <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">Add New Location</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter location name"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2 border rounded"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setAddingLocation(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLocation}
                className="bg-maroon-600 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Add Location
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

        {/* Locations table */}
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full bg-white table-auto text-sm">
            <thead className="bg-maroon-700 text-white">
              <tr>
                <th className="py-2 px-4 border-b text-left">Location</th>
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
                      Loading locations...
                    </div>
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    No locations found. Add your first location by clicking the &quot;Add New
                    Location&quot; button.
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr key={location.name} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {editLocationId === location.name ? (
                        <input
                          type="text"
                          value={editLocationValue}
                          onChange={(e) => setEditLocationValue(e.target.value)}
                          className="w-full p-1 border rounded"
                          maxLength={100}
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MapPin size={16} className="text-maroon-600" />
                          <span>{location.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {users[location.updated_by]
                        ? `${users[location.updated_by].first_name} ${users[location.updated_by].last_name}`
                        : location.updated_by}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(location.updated_at)
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
                      {editLocationId === location.name ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleUpdateLocation(location.name)}
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
                          <button onClick={() => startEditLocation(location)} title="Edit">
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(location.name)}
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

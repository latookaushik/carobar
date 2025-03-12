'use client';

/**
 * Vehicle Maker Management Page
 *
 * Provides UI for viewing, adding, editing, and deleting vehicle makers
 * for the authenticated user's company.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Role } from '@/app/lib/roles';
import PageTemplate from '@/app/components/PageTemplate';
import { PlusCircle, Edit, Trash2, Check, X, RefreshCw, Car } from 'lucide-react';
import { toast } from '@/app/components/ui/use-toast';

interface Maker {
  name: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export default function VehicleMakerPage() {
  const {} = useAuth();

  const [makers, setMakers] = useState<Maker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, { first_name: string; last_name: string }>>({});

  const [newMaker, setNewMaker] = useState('');
  const [addingMaker, setAddingMaker] = useState(false);

  const [editMakerId, setEditMakerId] = useState<string | null>(null);
  const [editMakerValue, setEditMakerValue] = useState('');

  // Load makers and users on component mount
  useEffect(() => {
    fetchMakers();
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

  // Function to fetch makers from API
  const fetchMakers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/makers');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch vehicle makers');
      }

      const data = await response.json();
      setMakers(data.makers || []);
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

  // Function to handle adding a new maker
  const handleAddMaker = async () => {
    if (!newMaker.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Maker name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/makers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newMaker.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add vehicle maker');
      }

      // Refresh makers list and reset form
      await fetchMakers();
      setNewMaker('');
      setAddingMaker(false);

      toast({
        title: 'Success',
        description: 'Vehicle maker added successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Function to handle updating a maker
  const handleUpdateMaker = async (oldName: string) => {
    if (!editMakerValue.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Maker name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Format the request body according to the referenceDataController format
      const requestBody = {
        oldMaker: {
          name: oldName,
        },
        newMaker: {
          name: editMakerValue.trim(),
        },
      };

      console.log('Sending maker update request:', requestBody);

      const response = await fetch('/api/makers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update vehicle maker');
      }

      // Refresh makers list and reset edit state
      await fetchMakers();
      setEditMakerId(null);
      setEditMakerValue('');

      toast({
        title: 'Success',
        description: 'Vehicle maker updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Function to handle deleting a maker
  const handleDeleteMaker = async (name: string) => {
    if (!window.confirm(`Are you sure you want to delete the vehicle maker &quot;${name}&quot;?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/makers?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete vehicle maker');
      }

      // Refresh makers list
      await fetchMakers();

      toast({
        title: 'Success',
        description: 'Vehicle maker deleted successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Start editing a maker
  const startEditMaker = (maker: Maker) => {
    setEditMakerId(maker.name);
    setEditMakerValue(maker.name);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditMakerId(null);
    setEditMakerValue('');
  };

  return (
    <PageTemplate
      title="Vehicle Maker Management"
      requiredRoles={[Role.ADMIN, Role.MANAGER, Role.STAFF]}
    >
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Vehicle Maker Management</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchMakers}
              className="flex items-center gap-1 bg-maroon-600 text-white px-3 py-1 rounded hover:bg-red-600"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            {!addingMaker && (
              <button
                onClick={() => setAddingMaker(true)}
                className="flex items-center gap-1 bg-maroon-600 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                <PlusCircle size={16} />
                Add New Maker
              </button>
            )}
          </div>
        </div>

        {/* Add new maker form */}
        {addingMaker && (
          <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">Add New Vehicle Maker</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maker Name *</label>
                <input
                  type="text"
                  placeholder="Enter maker name"
                  value={newMaker}
                  onChange={(e) => setNewMaker(e.target.value)}
                  className="w-full p-2 border rounded"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setAddingMaker(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMaker}
                className="bg-maroon-600 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Add Maker
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

        {/* Makers table */}
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full bg-white table-auto text-sm">
            <thead className="bg-maroon-700 text-white">
              <tr>
                <th className="py-2 px-4 border-b text-left">Maker</th>
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
                      Loading vehicle makers...
                    </div>
                  </td>
                </tr>
              ) : makers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    No vehicle makers found. Add your first maker by clicking the &quot;Add New
                    Maker&quot; button.
                  </td>
                </tr>
              ) : (
                makers.map((maker) => (
                  <tr key={maker.name} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {editMakerId === maker.name ? (
                        <input
                          type="text"
                          value={editMakerValue}
                          onChange={(e) => setEditMakerValue(e.target.value)}
                          className="w-full p-1 border rounded"
                          maxLength={100}
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Car size={16} className="text-maroon-600" />
                          <span>{maker.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {users[maker.updated_by]
                        ? `${users[maker.updated_by].first_name} ${users[maker.updated_by].last_name}`
                        : maker.updated_by}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(maker.updated_at)
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
                      {editMakerId === maker.name ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleUpdateMaker(maker.name)}
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
                          <button onClick={() => startEditMaker(maker)} title="Edit">
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteMaker(maker.name)}
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

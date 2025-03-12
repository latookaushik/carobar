'use client';

/**
 * Country Management Page
 *
 * Provides UI for viewing, adding, editing, and deleting countries
 * for the authenticated user's company.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Role } from '@/app/lib/roles';
import PageTemplate from '@/app/components/PageTemplate';
import { PlusCircle, Edit, Trash2, Check, X, RefreshCw, Globe } from 'lucide-react';
import { toast } from '@/app/components/ui/use-toast';

interface Country {
  code: string;
  name: string;
  is_targetcountry: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export default function CountryManagement() {
  const {} = useAuth();

  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, { first_name: string; last_name: string }>>({});

  // Form state for adding
  const [addingCountry, setAddingCountry] = useState(false);
  const [newCountry, setNewCountry] = useState({
    code: '',
    name: '',
    is_targetcountry: false,
  });

  // Form state for editing
  const [editCountryCode, setEditCountryCode] = useState<string | null>(null);
  const [editingCountry, setEditingCountry] = useState({
    code: '',
    name: '',
    is_targetcountry: false,
  });

  // Load countries and users on component mount
  useEffect(() => {
    fetchCountries();
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

  // Function to fetch countries from API
  const fetchCountries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/countries');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch countries');
      }

      const data = await response.json();
      setCountries(data.countries || []);
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

  // Function to handle adding a new country
  const handleAddCountry = async () => {
    if (!newCountry.code.trim() || !newCountry.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Country code and name are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/countries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: newCountry.code.trim(),
          name: newCountry.name.trim(),
          is_targetcountry: newCountry.is_targetcountry,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add country');
      }

      // Refresh countries list and reset form
      await fetchCountries();
      setNewCountry({
        code: '',
        name: '',
        is_targetcountry: false,
      });
      setAddingCountry(false);

      toast({
        title: 'Success',
        description: 'Country added successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Function to handle updating a country
  const handleUpdateCountry = async () => {
    if (!editingCountry.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Country name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Format the request body according to the referenceDataController format
      const requestBody = {
        oldCountry: {
          code: editCountryCode,
        },
        newCountry: {
          code: editingCountry.code.trim(),
          name: editingCountry.name.trim(),
          is_targetcountry: editingCountry.is_targetcountry,
        },
      };

      console.log('Sending country update request:', requestBody);

      const response = await fetch('/api/countries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update country');
      }

      // Refresh countries list and reset edit state
      await fetchCountries();
      setEditCountryCode(null);
      setEditingCountry({
        code: '',
        name: '',
        is_targetcountry: false,
      });

      toast({
        title: 'Success',
        description: 'Country updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Function to handle deleting a country
  const handleDeleteCountry = async (code: string) => {
    if (!window.confirm(`Are you sure you want to delete the country with code "${code}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/countries?code=${encodeURIComponent(code)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete country');
      }

      // Refresh countries list
      await fetchCountries();

      toast({
        title: 'Success',
        description: 'Country deleted successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Start editing a country
  const startEditCountry = (country: Country) => {
    setEditCountryCode(country.code);
    setEditingCountry({
      code: country.code,
      name: country.name,
      is_targetcountry: country.is_targetcountry || false,
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditCountryCode(null);
    setEditingCountry({
      code: '',
      name: '',
      is_targetcountry: false,
    });
  };

  return (
    <PageTemplate title="Country Management" requiredRoles={[Role.ADMIN, Role.MANAGER, Role.STAFF]}>
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Country Management</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchCountries}
              className="flex items-center gap-1 bg-maroon-600 text-white px-3 py-1 rounded hover:bg-red-600"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            {!addingCountry && (
              <button
                onClick={() => setAddingCountry(true)}
                className="flex items-center gap-1 bg-maroon-600 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                <PlusCircle size={16} />
                Add New Country
              </button>
            )}
          </div>
        </div>

        {/* Add new country form */}
        {addingCountry && (
          <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">Add New Country</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country Code *
                </label>
                <input
                  type="text"
                  placeholder="2-3 letter code (e.g. JP)"
                  value={newCountry.code}
                  onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value })}
                  className="w-full p-2 border rounded"
                  maxLength={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country Name *
                </label>
                <input
                  type="text"
                  placeholder="Full country name"
                  value={newCountry.name}
                  onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  maxLength={100}
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_targetcountry_new"
                  checked={newCountry.is_targetcountry}
                  onChange={(e) =>
                    setNewCountry({ ...newCountry, is_targetcountry: e.target.checked })
                  }
                  className="mr-2"
                />
                <label htmlFor="is_targetcountry_new" className="text-sm font-medium text-gray-700">
                  Target Country
                </label>
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setAddingCountry(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCountry}
                className="bg-maroon-600 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Add Country
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

        {/* Countries table */}
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full bg-white table-auto text-sm">
            <thead className="bg-maroon-700 text-white">
              <tr>
                <th className="py-2 px-4 border-b text-left">Code</th>
                <th className="py-2 px-4 border-b text-left">Country Name</th>
                <th className="py-2 px-4 border-b text-center">Target Country</th>
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
                      Loading countries...
                    </div>
                  </td>
                </tr>
              ) : countries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    No countries found. Add your first country by clicking the &quot;Add New
                    Country&quot; button.
                  </td>
                </tr>
              ) : (
                countries.map((country) => (
                  <tr key={country.code} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{country.code}</td>
                    <td className="py-2 px-4 border-b">
                      {editCountryCode === country.code ? (
                        <input
                          type="text"
                          value={editingCountry.name}
                          onChange={(e) =>
                            setEditingCountry({ ...editingCountry, name: e.target.value })
                          }
                          className="w-full p-1 border rounded"
                          maxLength={100}
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Globe size={16} className="text-maroon-600" />
                          <span>{country.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {editCountryCode === country.code ? (
                        <input
                          type="checkbox"
                          checked={editingCountry.is_targetcountry}
                          onChange={(e) =>
                            setEditingCountry({
                              ...editingCountry,
                              is_targetcountry: e.target.checked,
                            })
                          }
                          className="form-checkbox h-4 w-4"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={country.is_targetcountry || false}
                          readOnly
                          className="form-checkbox h-4 w-4 cursor-default"
                        />
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {users[country.updated_by || '']
                        ? `${users[country.updated_by || ''].first_name} ${users[country.updated_by || ''].last_name}`
                        : country.updated_by}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(country.updated_at)
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
                      {editCountryCode === country.code ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={handleUpdateCountry}
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
                          <button onClick={() => startEditCountry(country)} title="Edit">
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCountry(country.code)}
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

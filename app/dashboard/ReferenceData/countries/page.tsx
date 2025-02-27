"use client";

/**
 * Country Management Page
 * 
 * Provides UI for viewing, adding, editing, and deleting countries
 * for the authenticated user's company.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Role } from '@/app/lib/enums';
import PageTemplate from '@/app/components/PageTemplate';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { PlusCircle, Edit, Trash2, Check, X, RefreshCw, Globe, Target } from 'lucide-react';
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

export default function CountriesPage() {
  const { } = useAuth();
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, {first_name: string, last_name: string}>>({});
  
  // New country form state
  const [addingCountry, setAddingCountry] = useState(false);
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newCountryName, setNewCountryName] = useState('');
  const [newIsTargetCountry, setNewIsTargetCountry] = useState(false);
  
  // Edit country state
  const [editCountryId, setEditCountryId] = useState<string | null>(null);
  const [editCountryName, setEditCountryName] = useState('');
  const [editIsTargetCountry, setEditIsTargetCountry] = useState(false);

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
      const userMap: Record<string, {first_name: string, last_name: string}> = {};
      if (data.users) {
        data.users.forEach((user: any) => {
          userMap[user.user_id] = {
            first_name: user.first_name,
            last_name: user.last_name
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
        title: "Error",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle adding a new country
  const handleAddCountry = async () => {
    if (!newCountryCode.trim()) {
      toast({
        title: "Validation Error",
        description: "Country code cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!newCountryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Country name cannot be empty",
        variant: "destructive",
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
          code: newCountryCode.trim(),
          name: newCountryName.trim(),
          is_targetcountry: newIsTargetCountry
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add country');
      }
      
      // Refresh countries list and reset form
      await fetchCountries();
      setNewCountryCode('');
      setNewCountryName('');
      setNewIsTargetCountry(false);
      setAddingCountry(false);
      
      toast({
        title: "Success",
        description: "Country added successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a country
  const handleUpdateCountry = async (code: string) => {
    if (!editCountryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Country name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch('/api/countries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code,
          name: editCountryName.trim(),
          is_targetcountry: editIsTargetCountry
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update country');
      }
      
      // Refresh countries list and reset edit state
      await fetchCountries();
      setEditCountryId(null);
      setEditCountryName('');
      setEditIsTargetCountry(false);
      
      toast({
        title: "Success",
        description: "Country updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a country
  const handleDeleteCountry = async (code: string) => {
    if (!window.confirm(`Are you sure you want to delete this country?`)) {
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
        title: "Success",
        description: "Country deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
    }
  };

  // Start editing a country
  const startEditCountry = (country: Country) => {
    setEditCountryId(country.code);
    setEditCountryName(country.name);
    setEditIsTargetCountry(country.is_targetcountry);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditCountryId(null);
    setEditCountryName('');
    setEditIsTargetCountry(false);
  };

  return (
    <PageTemplate 
      title="Country Management" 
      requiredRoles={[Role.ADMIN, Role.MANAGER, Role.STAFF]}
    >
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Country Management</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchCountries}
              className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            {!addingCountry && (
              <button
                onClick={() => setAddingCountry(true)}
                className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Country Code * (2-3 characters)</label>
                <input
                  type="text"
                  placeholder="e.g. US, UK, JP"
                  value={newCountryCode}
                  onChange={(e) => setNewCountryCode(e.target.value)}
                  className="w-full p-2 border rounded"
                  maxLength={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country Name *</label>
                <input
                  type="text"
                  placeholder="Enter country name"
                  value={newCountryName}
                  onChange={(e) => setNewCountryName(e.target.value)}
                  className="w-full p-2 border rounded"
                  maxLength={100}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newIsTargetCountry}
                    onChange={(e) => setNewIsTargetCountry(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-maroon-600 focus:ring-maroon-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Is Target Country</span>
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
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-maroon-700 text-white">
              <tr>
                <th className="py-2 px-4 border-b text-left">Code</th>
                <th className="py-2 px-4 border-b text-left">Country</th>
                <th className="py-2 px-4 border-b text-center">Target</th>
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
                    No countries found. Add your first country by clicking the "Add New Country" button.
                  </td>
                </tr>
              ) : (
                countries.map((country) => (
                  <tr key={country.code} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b font-medium">{country.code}</td>
                    <td className="py-2 px-4 border-b">
                      {editCountryId === country.code ? (
                        <input
                          type="text"
                          value={editCountryName}
                          onChange={(e) => setEditCountryName(e.target.value)}
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
                      {editCountryId === country.code ? (
                        <input
                          type="checkbox"
                          checked={editIsTargetCountry}
                          onChange={(e) => setEditIsTargetCountry(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-maroon-600 focus:ring-maroon-500"
                        />
                      ) : country.is_targetcountry ? (
                        <div className="flex justify-center">
                          <Target size={16} className="text-green-600" />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <span className="text-gray-400">—</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {users[country.updated_by] 
                        ? `${users[country.updated_by].first_name} ${users[country.updated_by].last_name}`
                        : country.updated_by}
                    </td>
                    <td className="py-2 px-4 border-b">{new Date(country.updated_at).toLocaleString('en-GB', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    }).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6')}</td>
                    <td className="py-2 px-4 border-b text-center">
                      {editCountryId === country.code ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleUpdateCountry(country.code)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Save"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-500 hover:text-gray-700"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEditCountry(country)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCountry(country.code)}
                            className="text-red-500 hover:text-red-700"
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

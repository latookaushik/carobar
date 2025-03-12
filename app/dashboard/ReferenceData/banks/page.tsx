'use client';

import { useState, useEffect } from 'react';
import { CheckRoles } from '@/app/lib/roles';

import PageTemplate from '@/app/components/PageTemplate';
import { toast } from '@/app/components/ui/use-toast';
import { PlusCircle, Edit, Trash2, Check, X, RefreshCw } from 'lucide-react';

type Bank = {
  company_id: string;
  account_number: string;
  bank_name: string;
  bank_branch: string | null;
  currency: string | null;
  description: string | null;
  is_default: boolean | null;
  is_active: boolean | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
};

type EditingBank = {
  account_number: string;
  bank_name: string;
  bank_branch: string;
  currency: string;
  description: string;
  is_default: boolean;
  is_active: boolean;
};

const defaultNewBank: EditingBank = {
  account_number: '',
  bank_name: '',
  bank_branch: '',
  currency: '',
  description: '',
  is_default: false,
  is_active: true,
};

export default function BankManagement() {
  // const { user } = useAuth();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [newBank, setNewBank] = useState<EditingBank>(defaultNewBank);
  const [editingBank, setEditingBank] = useState<EditingBank>(defaultNewBank);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      console.log('Fetching banks...');

      const response = await fetch('/api/banks');
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch banks');
      }

      const data = await response.json();
      console.log('Received data:', data);
      setBanks(data.banks || []);
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load banks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch the banks on component mount, regardless of user state
    // This will help diagnose if the issue is with authentication or data retrieval
    fetchBanks();
  }, []);

  const handleAddBank = async () => {
    try {
      if (!newBank.account_number || !newBank.bank_name) {
        toast({
          title: 'Validation Error',
          description: 'Account number and bank name are required.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/banks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBank),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add bank');
      }

      toast({
        title: 'Success',
        description: 'Bank added successfully.',
      });

      setNewBank(defaultNewBank);
      setIsAdding(false);
      fetchBanks();
    } catch (error) {
      console.error('Error adding bank:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to add bank. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateBank = async () => {
    try {
      if (!editingBank.account_number || !editingBank.bank_name) {
        toast({
          title: 'Validation Error',
          description: 'Account number and bank name are required.',
          variant: 'destructive',
        });
        return;
      }

      // Find the original bank record
      const originalBank = banks.find((bank) => bank.account_number === editingBankId);
      if (!originalBank) {
        throw new Error('Could not find the original bank record');
      }

      // Format the request body with both oldBank and newBank
      const requestBody = {
        oldBank: {
          account_number: originalBank.account_number,
        },
        newBank: editingBank,
      };

      console.log('Sending update request:', requestBody);

      const response = await fetch('/api/banks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update bank');
      }

      toast({
        title: 'Success',
        description: 'Bank updated successfully.',
      });

      setEditingBankId(null);
      fetchBanks();
    } catch (error: unknown) {
      console.error('Error updating bank:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update bank. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBank = async (accountNumber: string) => {
    if (!confirm('Are you sure you want to delete this bank?')) {
      return;
    }

    try {
      const response = await fetch(`/api/banks?account_number=${accountNumber}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete bank');
      }

      toast({
        title: 'Success',
        description: 'Bank deleted successfully.',
      });

      fetchBanks();
    } catch (error: unknown) {
      console.error('Error deleting bank:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete bank. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleDefault = async (accountNumber: string, isDefault: boolean) => {
    if (isDefault) {
      // If it's already the default, do nothing
      return;
    }

    try {
      const bankToUpdate = banks.find((bank) => bank.account_number === accountNumber);
      if (!bankToUpdate) return;

      // Create an editing bank object from the original bank
      const updatedBank = {
        account_number: bankToUpdate.account_number,
        bank_name: bankToUpdate.bank_name,
        bank_branch: bankToUpdate.bank_branch || '',
        currency: bankToUpdate.currency || '',
        description: bankToUpdate.description || '',
        is_default: true, // Set to default
        is_active: bankToUpdate.is_active || true,
      };

      // Format the request body with both oldBank and newBank
      const requestBody = {
        oldBank: {
          account_number: bankToUpdate.account_number,
        },
        newBank: updatedBank,
      };

      console.log('Sending toggle default request:', requestBody);

      const response = await fetch('/api/banks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update bank');
      }

      await fetchBanks();

      toast({
        title: 'Success',
        description: 'Default bank updated successfully.',
      });
    } catch (error) {
      console.error('Error updating default bank:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update default bank.',
        variant: 'destructive',
      });
    }
  };

  const startEditing = (bank: Bank) => {
    setEditingBank({
      account_number: bank.account_number,
      bank_name: bank.bank_name,
      bank_branch: bank.bank_branch || '',
      currency: bank.currency || '',
      description: bank.description || '',
      is_default: bank.is_default || false,
      is_active: bank.is_active || true,
    });
    setEditingBankId(bank.account_number);
  };

  const cancelEditing = () => {
    setEditingBankId(null);
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewBank(defaultNewBank);
  };

  return (
    <PageTemplate title="Bank Management" requiredRoles={CheckRoles.allRoles}>
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Bank Management</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchBanks}
              className="flex items-center gap-1 bg-maroon-600 text-white px-3 py-1 rounded hover:bg-red-600"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1 bg-maroon-600 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                <PlusCircle size={16} />
                Add Bank
              </button>
            )}
          </div>
        </div>

        {/* Add Bank Form */}
        {isAdding && (
          <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">Add New Bank</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={newBank.account_number}
                  onChange={(e) => setNewBank({ ...newBank, account_number: e.target.value })}
                  className="w-full p-2 border rounded"
                  maxLength={30}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                <input
                  type="text"
                  value={newBank.bank_name}
                  onChange={(e) => setNewBank({ ...newBank, bank_name: e.target.value })}
                  className="w-full p-2 border rounded"
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <input
                  type="text"
                  value={newBank.bank_branch}
                  onChange={(e) => setNewBank({ ...newBank, bank_branch: e.target.value })}
                  className="w-full p-2 border rounded"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={newBank.currency}
                  onChange={(e) => setNewBank({ ...newBank, currency: e.target.value })}
                  className="w-full p-2 border rounded"
                  maxLength={3}
                  placeholder="USD"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newBank.description}
                  onChange={(e) => setNewBank({ ...newBank, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  maxLength={500}
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_default_new"
                    checked={newBank.is_default}
                    onChange={(e) => setNewBank({ ...newBank, is_default: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_default_new" className="text-sm font-medium text-gray-700">
                    Default Bank
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active_new"
                    checked={newBank.is_active}
                    onChange={(e) => setNewBank({ ...newBank, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_active_new" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={cancelAdding}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBank}
                className="bg-maroon-600 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Add Bank
              </button>
            </div>
          </div>
        )}

        {/* Banks Table */}
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full bg-white table-auto text-sm">
            <thead className="bg-maroon-700 text-white">
              <tr>
                <th className="py-2 px-4 border-b text-left">Account Number</th>
                <th className="py-2 px-4 border-b text-left">Bank Name</th>
                <th className="py-2 px-4 border-b text-left">Branch</th>
                <th className="py-2 px-4 border-b text-left">Currency</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    Loading banks...
                  </td>
                </tr>
              ) : banks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    No banks found. Add your first bank.
                  </td>
                </tr>
              ) : (
                banks.map((bank) => (
                  <tr
                    key={bank.account_number}
                    className={`${!bank.is_active ? 'bg-gray-200' : ''} hover:bg-gray-50`}
                  >
                    {editingBankId === bank.account_number ? (
                      // Editing Mode
                      <>
                        <td className="py-2 px-4 border-b">
                          {bank.account_number} {/* Account number cannot be changed */}
                        </td>
                        <td className="py-2 px-4 border-b">
                          <input
                            type="text"
                            value={editingBank.bank_name}
                            onChange={(e) =>
                              setEditingBank({ ...editingBank, bank_name: e.target.value })
                            }
                            className="w-full p-1 border rounded"
                            maxLength={100}
                          />
                        </td>
                        <td className="py-2 px-4 border-b">
                          <input
                            type="text"
                            value={editingBank.bank_branch}
                            onChange={(e) =>
                              setEditingBank({ ...editingBank, bank_branch: e.target.value })
                            }
                            className="w-full p-1 border rounded"
                            maxLength={100}
                          />
                        </td>
                        <td className="py-2 px-4 border-b">
                          <input
                            type="text"
                            value={editingBank.currency}
                            onChange={(e) =>
                              setEditingBank({ ...editingBank, currency: e.target.value })
                            }
                            className="w-full p-1 border rounded"
                            maxLength={3}
                          />
                        </td>
                        <td className="py-2 px-4 border-b">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`is_default_${bank.account_number}`}
                                checked={editingBank.is_default}
                                onChange={(e) =>
                                  setEditingBank({ ...editingBank, is_default: e.target.checked })
                                }
                                className="mr-1"
                              />
                              <label
                                htmlFor={`is_default_${bank.account_number}`}
                                className="text-xs"
                              >
                                Default
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`is_active_${bank.account_number}`}
                                checked={editingBank.is_active}
                                onChange={(e) =>
                                  setEditingBank({ ...editingBank, is_active: e.target.checked })
                                }
                                className="mr-1"
                              />
                              <label
                                htmlFor={`is_active_${bank.account_number}`}
                                className="text-xs"
                              >
                                Active
                              </label>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={handleUpdateBank}
                              className="text-green-600 hover:text-green-800"
                              title="Save"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-red-500 hover:text-red-700"
                              title="Cancel"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // View Mode
                      <>
                        <td className="py-2 px-4 border-b">{bank.account_number}</td>
                        <td className="py-2 px-4 border-b">{bank.bank_name}</td>
                        <td className="py-2 px-4 border-b">{bank.bank_branch || '-'}</td>
                        <td className="py-2 px-4 border-b">{bank.currency || '-'}</td>
                        <td className="py-2 px-4 border-b">
                          <div className="flex flex-col">
                            {bank.is_default && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mb-1">
                                Default
                              </span>
                            )}
                            {bank.is_active ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded inline-block">
                                Active
                              </span>
                            ) : (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded inline-block">
                                Inactive
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => startEditing(bank)} title="Edit">
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteBank(bank.account_number)}
                              className="text-red-600"
                              title="Delete"
                              disabled={!!bank.is_default}
                            >
                              <Trash2
                                size={18}
                                className={bank.is_default ? 'opacity-30 cursor-not-allowed' : ''}
                              />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleDefault(bank.account_number, !!bank.is_default)
                              }
                              title="Toggle Default"
                            >
                              {bank.is_default ? <X size={18} /> : <Check size={18} />}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>* Account number cannot be changed after creation</p>
          <p>* Default bank cannot be deleted</p>
          <p>* Only one bank can be set as default per company</p>
        </div>
      </div>
    </PageTemplate>
  );
}

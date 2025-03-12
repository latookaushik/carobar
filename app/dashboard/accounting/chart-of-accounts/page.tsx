'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import PageTemplate from '@/app/components/PageTemplate';
import { toast } from '@/app/components/ui/use-toast';
import { PlusCircle, Edit, Trash2, RefreshCw, Search } from 'lucide-react';
import { RoleType } from '@/app/lib/roles';

// Temporary definition until CheckRoles is properly migrated
const CheckRoles = {
  allRoles: [] as RoleType[], // Empty array allows all roles
};

type ChartOfAccount = {
  company_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  description: string | null;
  is_active: boolean | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
};

type EditingAccount = {
  account_code: string;
  account_name: string;
  account_type: string;
  description: string;
  is_active: boolean;
};

type PaginationData = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// Custom error type for better error handling
type ApiError = Error & {
  status?: number;
  data?: unknown;
};

// Account type options for dropdown
const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

const defaultNewAccount: EditingAccount = {
  account_code: '',
  account_name: '',
  account_type: ACCOUNT_TYPES[0],
  description: '',
  is_active: true,
};

export default function ChartOfAccountsManagement() {
  const {
    /* user */
  } = useAuth();
  const [, setAccounts] = useState<ChartOfAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<EditingAccount>(defaultNewAccount);
  const [oldCode, setOldCode] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<Record<string, { first_name: string; last_name: string }>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationData, setPaginationData] = useState<PaginationData | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);

      // Build query parameters for pagination and search
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('pageSize', itemsPerPage.toString());
      if (searchTerm.trim() !== '') {
        queryParams.append('search', searchTerm);
      }

      const url = `/api/chart-of-accounts?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch chart of accounts');
      }

      const data = await response.json();
      setAccounts(data.coa || []);
      setFilteredAccounts(data.coa || []);

      // Update pagination from server response
      if (data.pagination) {
        setPaginationData(data.pagination);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching chart of accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chart of accounts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Handle outside clicks for the modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    }

    if (isAddEditModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddEditModalOpen]);

  // Load accounts and users on component mount
  useEffect(() => {
    fetchAccounts();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, searchTerm]);

  const openAddModal = () => {
    setCurrentAccount(defaultNewAccount);
    setIsEditing(false);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (account: ChartOfAccount) => {
    setCurrentAccount({
      account_code: account.account_code,
      account_name: account.account_name,
      account_type: account.account_type,
      description: account.description || '',
      is_active: account.is_active || true,
    });
    setOldCode(account.account_code);
    setIsEditing(true);
    setIsAddEditModalOpen(true);
  };

  const closeModal = () => {
    setIsAddEditModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentAccount({ ...currentAccount, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCurrentAccount({ ...currentAccount, [name]: checked });
  };

  const handleAddAccount = async () => {
    try {
      if (
        !currentAccount.account_code ||
        !currentAccount.account_name ||
        !currentAccount.account_type
      ) {
        toast({
          title: 'Validation Error',
          description: 'Account Code, Name, and Type are required fields.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/chart-of-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentAccount),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add account');
      }

      toast({
        title: 'Success',
        description: 'Account added successfully.',
      });

      closeModal();
      fetchAccounts();
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Error adding account:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to add account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateAccount = async () => {
    try {
      if (
        !currentAccount.account_code ||
        !currentAccount.account_name ||
        !currentAccount.account_type
      ) {
        toast({
          title: 'Validation Error',
          description: 'Account Code, Name, and Type are required fields.',
          variant: 'destructive',
        });
        return;
      }

      // Format the request body according to the referenceDataController format
      const requestBody = {
        oldAccount: {
          account_code: oldCode,
        },
        newAccount: currentAccount,
      };

      console.log('Sending update request:', requestBody);

      const response = await fetch('/api/chart-of-accounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update account');
      }

      toast({
        title: 'Success',
        description: 'Account updated successfully.',
      });

      closeModal();
      fetchAccounts();
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Error updating account:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async (code: string) => {
    if (!confirm('Are you sure you want to delete this account?')) {
      return;
    }

    try {
      const response = await fetch(`/api/chart-of-accounts?code=${encodeURIComponent(code)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      toast({
        title: 'Success',
        description: 'Account deleted successfully.',
      });

      fetchAccounts();
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Error deleting account:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <PageTemplate title="Chart of Accounts" requiredRoles={CheckRoles.allRoles}>
      <div className="w-full">
        <div className="flex justify-between items-center text-sm mb-4">
          <h1 className="text-2xl font-bold">Chart of Accounts</h1>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-1 border rounded-md"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={fetchAccounts}
              className="flex items-center gap-1 bg-maroon-600 text-white px-3 py-1 rounded hover:bg-red-600"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1 bg-maroon-600 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              <PlusCircle size={16} />
              Add Account
            </button>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="overflow-x-auto rounded-md border text-sm border-gray-200">
          <table className="w-full bg-white">
            <thead className="bg-maroon-700 text-white">
              <tr>
                <th className="py-2 px-4 border-b text-left w-[150px]">Account Code</th>
                <th className="py-2 px-4 border-b text-left w-[250px]">Account Name</th>
                <th className="py-2 px-4 border-b text-left w-[150px]">Type</th>
                <th className="py-2 px-4 border-b text-left">Description</th>
                <th className="py-2 px-4 border-b text-center w-[100px]">Status</th>
                <th className="py-2 px-4 border-b text-left w-[150px]">Updated By</th>
                <th className="py-2 px-4 border-b text-left w-[180px]">Updated At</th>
                <th className="py-2 px-4 border-b text-center w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center">
                    Loading accounts...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center">
                    No accounts found.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr
                    key={account.account_code}
                    className={`hover:bg-gray-50 ${!account.is_active ? 'bg-gray-200' : ''}`}
                  >
                    <td className="py-2 px-4 border-b">{account.account_code}</td>
                    <td className="py-2 px-4 border-b">{account.account_name}</td>
                    <td className="py-2 px-4 border-b">{account.account_type}</td>
                    <td className="py-2 px-4 border-b">{account.description || '-'}</td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex flex-col">
                        {account.is_active ? (
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
                    <td className="py-2 px-4 border-b">
                      {users[account.updated_by || '']
                        ? `${users[account.updated_by || ''].first_name} ${users[account.updated_by || ''].last_name}`
                        : account.updated_by || '-'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {account.updated_at
                        ? new Date(account.updated_at)
                            .toLocaleString('en-GB', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false,
                            })
                            .replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6')
                        : '-'}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(account)} title="Edit">
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.account_code)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAccounts.length > 0 && paginationData && (
          <div className="mt-4 flex justify-between items-center py-3 bg-gray-50 border rounded-md px-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Showing {filteredAccounts.length} of {paginationData.total} accounts
              </span>
              <select
                className="ml-4 p-1 border rounded text-sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
                <option value={0}>All</option>
              </select>
            </div>

            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate which page numbers to show
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === pageNum ? 'bg-maroon-600 text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isAddEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-semibold mb-4">
                {isEditing ? 'Edit Account' : 'Add New Account'}
              </h2>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Code *
                  </label>
                  <input
                    type="text"
                    name="account_code"
                    value={currentAccount.account_code}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    maxLength={50}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    name="account_name"
                    value={currentAccount.account_name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type *
                  </label>
                  <select
                    name="account_type"
                    value={currentAccount.account_type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {ACCOUNT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={currentAccount.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows={3}
                    maxLength={250}
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={currentAccount.is_active}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={isEditing ? handleUpdateAccount : handleAddAccount}
                  className="px-4 py-2 bg-maroon-600 text-white rounded hover:bg-red-600"
                >
                  {isEditing ? 'Save Changes' : 'Add Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}

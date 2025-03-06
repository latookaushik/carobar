'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { CheckRoles } from '@/app/lib/helpers';
import PageTemplate from '@/app/components/PageTemplate';
import { toast } from '@/app/components/ui/use-toast';
import { PlusCircle, Edit, Trash2, RefreshCw, Search } from 'lucide-react';

type Counterparty = {
  company_id: string;
  code: string;
  name: string | null;
  address1: string | null;
  address2: string | null;
  address3: string | null;
  phone: string | null;
  mobile: string | null;
  fax: string | null;
  email: string | null;
  is_active: boolean | null;
  comment: string | null;
  is_supplier: boolean | null;
  is_buyer: boolean | null;
  is_repair: boolean | null;
  is_localtransport: boolean | null;
  is_shipper: boolean | null;
  is_journal: boolean | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
};

type EditingCounterparty = {
  code: string;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  fax: string;
  address1: string;
  address2: string;
  address3: string;
  is_active: boolean;
  comment: string;
  is_supplier: boolean;
  is_buyer: boolean;
  is_repair: boolean;
  is_localtransport: boolean;
  is_shipper: boolean;
  is_journal: boolean;
};

const defaultNewCounterparty: EditingCounterparty = {
  code: '',
  name: '',
  email: '',
  phone: '',
  mobile: '',
  fax: '',
  address1: '',
  address2: '',
  address3: '',
  is_active: true,
  comment: '',
  is_supplier: false,
  is_buyer: false,
  is_repair: false,
  is_localtransport: false,
  is_shipper: false,
  is_journal: false,
};

export default function CounterpartyManagement() {
  const {
    /* user */
  } = useAuth();
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [filteredCounterparties, setFilteredCounterparties] = useState<Counterparty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCounterparty, setCurrentCounterparty] =
    useState<EditingCounterparty>(defaultNewCounterparty);
  const [oldCode, setOldCode] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCounterparties = async () => {
    try {
      setLoading(true);
      console.log('Fetching counterparties...');

      const response = await fetch('/api/counterparties');
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch counterparties');
      }

      const data = await response.json();
      console.log('Received data:', data);
      setCounterparties(data.counterparties || []);
      setFilteredCounterparties(data.counterparties || []);
    } catch (error) {
      console.error('Error fetching counterparties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load counterparties. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounterparties();
  }, []);

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

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCounterparties(counterparties);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = counterparties.filter(
        (cp) =>
          cp.code?.toLowerCase().includes(term) ||
          cp.name?.toLowerCase().includes(term) ||
          cp.email?.toLowerCase().includes(term) ||
          cp.phone?.toLowerCase().includes(term)
      );
      setFilteredCounterparties(filtered);
    }

    // Reset to first page when search results change
    setCurrentPage(1);
    // Calculate total pages
    const total = Math.ceil(
      (searchTerm.trim() === '' ? counterparties.length : filteredCounterparties.length) /
        itemsPerPage
    );
    setTotalPages(total || 1); // Ensure at least 1 page
  }, [searchTerm, counterparties, itemsPerPage, filteredCounterparties.length]);

  const openAddModal = () => {
    setCurrentCounterparty(defaultNewCounterparty);
    setIsEditing(false);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (counterparty: Counterparty) => {
    setCurrentCounterparty({
      code: counterparty.code,
      name: counterparty.name || '',
      email: counterparty.email || '',
      phone: counterparty.phone || '',
      mobile: counterparty.mobile || '',
      fax: counterparty.fax || '',
      address1: counterparty.address1 || '',
      address2: counterparty.address2 || '',
      address3: counterparty.address3 || '',
      is_active: counterparty.is_active || true,
      comment: counterparty.comment || '',
      is_supplier: counterparty.is_supplier || false,
      is_buyer: counterparty.is_buyer || false,
      is_repair: counterparty.is_repair || false,
      is_localtransport: counterparty.is_localtransport || false,
      is_shipper: counterparty.is_shipper || false,
      is_journal: counterparty.is_journal || false,
    });
    setOldCode(counterparty.code);
    setIsEditing(true);
    setIsAddEditModalOpen(true);
  };

  const closeModal = () => {
    setIsAddEditModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentCounterparty({ ...currentCounterparty, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCurrentCounterparty({ ...currentCounterparty, [name]: checked });
  };

  const handleAddCounterparty = async () => {
    try {
      if (!currentCounterparty.code || !currentCounterparty.name) {
        toast({
          title: 'Validation Error',
          description: 'Code and Name are required fields.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/counterparties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentCounterparty),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add counterparty');
      }

      toast({
        title: 'Success',
        description: 'Counterparty added successfully.',
      });

      closeModal();
      fetchCounterparties();
    } catch (error: unknown) {
      console.error('Error adding counterparty:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add counterparty. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCounterparty = async () => {
    try {
      if (!currentCounterparty.code || !currentCounterparty.name) {
        toast({
          title: 'Validation Error',
          description: 'Code and Name are required fields.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/counterparties', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldCode: oldCode,
          newCode: currentCounterparty.code,
          ...currentCounterparty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update counterparty');
      }

      toast({
        title: 'Success',
        description: 'Counterparty updated successfully.',
      });

      closeModal();
      fetchCounterparties();
    } catch (error: unknown) {
      console.error('Error updating counterparty:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update counterparty. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCounterparty = async (code: string) => {
    if (!confirm('Are you sure you want to delete this counterparty?')) {
      return;
    }

    try {
      const response = await fetch(`/api/counterparties?code=${encodeURIComponent(code)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete counterparty');
      }

      toast({
        title: 'Success',
        description: 'Counterparty deleted successfully.',
      });

      fetchCounterparties();
    } catch (error: unknown) {
      console.error('Error deleting counterparty:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete counterparty. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Function to get combined address
  const getCombinedAddress = (cp: Counterparty): string => {
    const addressParts = [cp.address1, cp.address2, cp.address3].filter(Boolean);
    return addressParts.join(', ');
  };

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCounterparties.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <PageTemplate title="Counterparty Management" requiredRoles={CheckRoles.allRoles}>
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Counterparty Management</h1>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search counterparties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-1 border rounded-md"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={fetchCounterparties}
              className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              <PlusCircle size={16} />
              Add Counterparty
            </button>
          </div>
        </div>

        {/* Counterparties Table */}
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full bg-white" style={{ minWidth: '1400px' }}>
            <thead className="bg-maroon-700 text-white">
              <tr>
                <th className="py-2 px-4 border-b text-left w-[120px]">Code</th>
                <th className="py-2 px-4 border-b text-left w-[200px]">Name</th>
                <th className="py-2 px-4 border-b text-left w-[200px]">Email</th>
                <th className="py-2 px-4 border-b text-left w-[300px]">Address</th>
                <th className="py-2 px-4 border-b text-left w-[200px]">Phone</th>
                <th className="py-2 px-4 border-b text-left w-[200px]">Mobile</th>
                <th className="py-2 px-4 border-b text-center w-[60px]">Supplier</th>
                <th className="py-2 px-4 border-b text-center w-[60px]">Buyer</th>
                <th className="py-2 px-4 border-b text-center w-[60px]">Shuriya</th>
                <th className="py-2 px-4 border-b text-center w-[60px]">Riksoya</th>
                <th className="py-2 px-4 border-b text-center w-[60px]">Shipper</th>
                <th className="py-2 px-4 border-b text-center w-[60px]">Journal AC</th>
                <th className="py-2 px-4 border-b text-center w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={13} className="py-4 text-center">
                    Loading counterparties...
                  </td>
                </tr>
              ) : filteredCounterparties.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-4 text-center">
                    No counterparties found.
                  </td>
                </tr>
              ) : (
                getPaginatedData().map((cp) => (
                  <tr key={cp.code} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{cp.code}</td>
                    <td className="py-2 px-4 border-b">{cp.name || '-'}</td>
                    <td className="py-2 px-4 border-b">{cp.email || '-'}</td>
                    <td className="py-2 px-4 border-b">{getCombinedAddress(cp) || '-'}</td>
                    <td className="py-2 px-4 border-b">{cp.phone || '-'}</td>
                    <td className="py-2 px-4 border-b">{cp.mobile || '-'}</td>
                    <td className="py-2 px-4 border-b text-center">
                      {cp.is_supplier ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {cp.is_buyer ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {cp.is_repair ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {cp.is_localtransport ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {cp.is_shipper ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {cp.is_journal ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(cp)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCounterparty(cp.code)}
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
        {filteredCounterparties.length > 0 && (
          <div className="mt-4 flex justify-between items-center py-3 bg-gray-50 border rounded-md px-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredCounterparties.length)} of{' '}
                {filteredCounterparties.length} counterparties
              </span>
              <select
                className="ml-4 p-1 border rounded text-sm"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
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
                      currentPage === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
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
            <div ref={modalRef} className="bg-white rounded-lg p-4 w-full max-w-3xl">
              <h2 className="text-lg font-semibold mb-3">
                {isEditing ? 'Edit Counterparty' : 'Add New Counterparty'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={currentCounterparty.code}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    maxLength={25}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={currentCounterparty.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={currentCounterparty.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={currentCounterparty.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    maxLength={25}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    name="mobile"
                    value={currentCounterparty.mobile}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    maxLength={25}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fax</label>
                  <input
                    type="text"
                    name="fax"
                    value={currentCounterparty.fax}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    maxLength={25}
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="address1"
                      placeholder="Address Line 1"
                      value={currentCounterparty.address1}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      maxLength={255}
                    />
                    <input
                      type="text"
                      name="address2"
                      placeholder="Address Line 2"
                      value={currentCounterparty.address2}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      maxLength={255}
                    />
                    <input
                      type="text"
                      name="address3"
                      placeholder="Address Line 3"
                      value={currentCounterparty.address3}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      maxLength={255}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_supplier"
                    name="is_supplier"
                    checked={currentCounterparty.is_supplier}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="is_supplier" className="text-sm font-medium text-gray-700">
                    Supplier
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_buyer"
                    name="is_buyer"
                    checked={currentCounterparty.is_buyer}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="is_buyer" className="text-sm font-medium text-gray-700">
                    Buyer
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_repair"
                    name="is_repair"
                    checked={currentCounterparty.is_repair}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="is_repair" className="text-sm font-medium text-gray-700">
                    Shuriya
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_localtransport"
                    name="is_localtransport"
                    checked={currentCounterparty.is_localtransport}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="is_localtransport" className="text-sm font-medium text-gray-700">
                    Riksoya
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_shipper"
                    name="is_shipper"
                    checked={currentCounterparty.is_shipper}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="is_shipper" className="text-sm font-medium text-gray-700">
                    Shipper
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_journal"
                    name="is_journal"
                    checked={currentCounterparty.is_journal}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="is_journal" className="text-sm font-medium text-gray-700">
                    Journal AC
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={currentCounterparty.is_active}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  name="comment"
                  value={currentCounterparty.comment}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows={3}
                  maxLength={255}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={isEditing ? handleUpdateCounterparty : handleAddCounterparty}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {isEditing ? 'Save Changes' : 'Add Counterparty'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}

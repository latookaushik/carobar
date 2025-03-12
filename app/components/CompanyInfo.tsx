/**
 * Company Info Component
 *
 * A demonstration component that shows how to use the CompanyContext.
 * Displays company information from the cached company data.
 */

'use client';

import { useCompany } from '@/app/contexts/CompanyContext';
import { RefreshCw } from 'lucide-react';

export default function CompanyInfo({ showDetails = false }: { showDetails?: boolean }) {
  const { company, loading, error, refreshCompanyData } = useCompany();

  if (loading) {
    return (
      <div className="flex items-center text-xs text-gray-500">
        <RefreshCw className="animate-spin mr-1" size={12} />
        <span>Loading company info...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-xs text-red-500">Error loading company data: {error}</div>;
  }

  if (!company) {
    return <div className="text-xs text-gray-500">No company data available</div>;
  }

  return (
    <div className="text-xs bg-gray-50 p-2 rounded border border-gray-200">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-medium">{company.company_name}</h3>
        <button
          onClick={() => refreshCompanyData()}
          className="text-gray-500 hover:text-gray-700"
          title="Refresh company data"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {showDetails && (
        <div className="space-y-1 mt-2">
          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-gray-500">Base Currency:</span>
            <span>{company.base_currency || 'N/A'}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-gray-500">Tax Rate:</span>
            <span>{company.taxpercent ? `${company.taxpercent}%` : 'N/A'}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-gray-500">Last Invoice #:</span>
            <span>{company.lastinvoiceno || 0}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-gray-500">Local Invoice #:</span>
            <span>{company.lastlocalinvoice || 0}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-gray-500">Report Prefix:</span>
            <span>{company.report_prefix || 'N/A'}</span>
          </div>

          {company.address1 && (
            <div>
              <div className="text-gray-500">Address:</div>
              <div className="pl-2">
                <div>{company.address1}</div>
                {company.address2 && <div>{company.address2}</div>}
                {company.address3 && <div>{company.address3}</div>}
                {company.country && <div>{company.country}</div>}
              </div>
            </div>
          )}

          {(company.phone || company.mobile || company.email) && (
            <div>
              <div className="text-gray-500">Contact:</div>
              <div className="pl-2">
                {company.phone && <div>Phone: {company.phone}</div>}
                {company.mobile && <div>Mobile: {company.mobile}</div>}
                {company.email && <div>Email: {company.email}</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {!showDetails && (
        <div className="text-gray-500">
          <small>Company data cached and ready for use throughout the application.</small>
        </div>
      )}
    </div>
  );
}

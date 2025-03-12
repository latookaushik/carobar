/**
 * Company Context
 *
 * Centralized company data cache for the Carobar application.
 * Provides company information throughout the app during user sessions.
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { logError } from '@/app/lib/logging';

// Company data type definition (matches database structure)
export interface CompanyData {
  company_id: string;
  company_name: string;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  country?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  is_active?: boolean | null;
  base_currency?: string | null;
  lastopeningday?: number | null;
  lastinvoiceno?: number | null;
  lastlocalinvoice?: number | null;
  taxpercent?: number | null;
  report_prefix?: string | null;
  last_login_date?: Date | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

// Company context state
export interface CompanyContextType {
  company: CompanyData | null;
  loading: boolean;
  error: string | null;
  refreshCompanyData: () => Promise<void>;
}

// Create the context with a default value
const CompanyContext = createContext<CompanyContextType>({
  company: null,
  loading: true,
  error: null,
  refreshCompanyData: async () => {},
});

// Provider component
export function CompanyProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, token } = useAuth();

  // Function to fetch company data - memoized to prevent infinite loops in useEffect
  const fetchCompanyData = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setCompany(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/companies', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company data');
      }

      const data = await response.json();
      setCompany(data.company);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error fetching company data';
      logError(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Load company data when the auth state changes or when fetchCompanyData changes
  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  // Function to manually refresh company data - memoized to ensure consistency
  const refreshCompanyData = useCallback(async () => {
    await fetchCompanyData();
  }, [fetchCompanyData]);

  // Context value
  const value = {
    company,
    loading,
    error,
    refreshCompanyData,
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

// Custom hook to use the company context
export function useCompany() {
  const context = useContext(CompanyContext);

  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }

  return context;
}

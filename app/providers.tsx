/**
 * Client-side Providers Component
 *
 * Wraps the application with all required client-side context providers.
 * This component is imported in the root layout.
 */

'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { CompanyProvider } from '@/app/contexts/CompanyContext';
import { Toaster } from '@/app/components/ui/toaster';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <CompanyProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {children}
          <Toaster />
        </LocalizationProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}

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

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <CompanyProvider>
        {children}
        <Toaster />
      </CompanyProvider>
    </AuthProvider>
  );
}

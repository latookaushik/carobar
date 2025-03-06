'use client';

import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { redirect } from 'next/navigation';

interface PageTemplateProps {
  title: string;
  children?: React.ReactNode;
  requiredRoles?: string[];
}

export default function PageTemplate({ children, requiredRoles = [] }: PageTemplateProps) {
  const { loading, isAuthenticated, hasRole } = useAuth();

  // Check if user is authenticated
  if (!loading && !isAuthenticated) {
    redirect('/login');
  }

  // Check if user has required role (if specified)
  if (!loading && isAuthenticated && requiredRoles.length > 0) {
    if (!hasRole(requiredRoles)) {
      // Redirect to unauthorized page
      redirect('/unauthorized');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1600px]">
      <div className="bg-white rounded-lg shadow-md p-6">{children}</div>
    </div>
  );
}

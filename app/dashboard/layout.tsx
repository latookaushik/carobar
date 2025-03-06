'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Layout/Header';
import Footer from '@/app/components/Layout/Footer';
import { useAuth } from '@/app/contexts/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon-500"></div>
      </div>
    );
  }

  // Only render the layout if the user is authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-background min-h-screen w-full flex flex-col">
      <Header />
      <main className="flex-grow px-0 py-4 w-full">{children}</main>
      <Footer />
    </div>
  );
}

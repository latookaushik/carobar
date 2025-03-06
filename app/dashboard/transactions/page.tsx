'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TransactionsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the transactions dashboard
    router.push('/dashboard/transactions/index');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon-500"></div>
    </div>
  );
}

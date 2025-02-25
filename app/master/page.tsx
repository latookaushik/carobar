'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/master');
  }, [router]);

  return null;
}

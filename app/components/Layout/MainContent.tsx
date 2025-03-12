'use client';

import Hero from '@/app/components/Layout/Hero';
import { cn } from '@/app/lib/utils';

interface MainContentProps {
  className?: string;
}

export default function MainContent({ className }: MainContentProps) {
  return (
    <main className={cn('text-center mt-1', className)}>
      <Hero />
    </main>
  );
}

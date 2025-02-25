'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Finance Management</h1>
        </CardHeader>
        <CardContent>
          <p>Finance management features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

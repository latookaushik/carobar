'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Settings</h1>
        </CardHeader>
        <CardContent>
          <p>Settings and configuration features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

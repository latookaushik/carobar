'use client';

import { Card, CardContent, CardHeader } from '@/app/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </CardHeader>
        <CardContent>
          <p>Welcome to Carobar Dashboard</p>
        </CardContent>
      </Card>
    </div>
  );
}

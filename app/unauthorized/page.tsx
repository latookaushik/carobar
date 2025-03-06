'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-5">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-16 w-16 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don&apos;t have permission to access this page. Please contact your administrator if
          you believe this is an error.
        </p>

        {user && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-gray-600">Logged in as:</p>
            <p className="font-medium">{user.userName}</p>
            <p className="text-sm text-gray-500">
              Role: {user.roleName}
              {user.companyName && ` | Company: ${user.companyName}`}
            </p>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <Link
            href="/"
            className="px-4 py-2 bg-maroon-500 hover:bg-maroon-600 text-white rounded-md transition-colors"
          >
            Return to Home
          </Link>

          {user && user.roleId.startsWith('C') && (
            <Link
              href="/transactions/dashboard"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

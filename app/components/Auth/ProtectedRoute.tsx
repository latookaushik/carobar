/**
 * Protected Route Component
 *
 * Wraps routes that require authentication or specific roles.
 * Redirects to login or unauthorized page as needed.
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Role } from '@/app/lib/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRoles = [],
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Store the current URL for post-login redirect
    if (!isAuthenticated && !loading) {
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push(`${redirectTo}?from=${encodeURIComponent(pathname)}`);
    }

    // Check role requirements if authenticated
    if (isAuthenticated && requiredRoles.length > 0) {
      if (!hasRole(requiredRoles)) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, loading, hasRole, requiredRoles, pathname, redirectTo, router]);

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // If authenticated and has required roles, render children
  if (isAuthenticated && (!requiredRoles.length || hasRole(requiredRoles))) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}

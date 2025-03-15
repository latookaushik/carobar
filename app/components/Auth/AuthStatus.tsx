/**
 * Authentication Status Component
 *
 * Displays the current authentication status and user information in the header.
 * Provides login/logout functionality for the user.
 */

'use client';

import Link from 'next/link';
import { User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useEffect, useState } from 'react';

// Purpose: React component to display authentication status and user information
// in application header.
export default function AuthStatus() {
  const { user, loading, logout, isAuthenticated } = useAuth();

  // Simplified log for authentication state changes
  useEffect(() => {
    if (user) {
      console.log('User authenticated:', user.userName);
    }
  }, [user]);

  // Track if we're in the post-login state
  const [recentlyLoggedIn, setRecentlyLoggedIn] = useState(false);

  // Reset the recently logged in state after the grace period
  useEffect(() => {
    let gracePeriodTimer: NodeJS.Timeout | null = null;

    // When user becomes authenticated, set the recently logged in flag
    if (!loading && isAuthenticated && !recentlyLoggedIn) {
      // Set recently logged in flag
      setRecentlyLoggedIn(true);

      // Clear the flag after the grace period
      gracePeriodTimer = setTimeout(() => {
        // Login grace period ended
        setRecentlyLoggedIn(false);
      }, 10000); // 10 second grace period after login
    }

    return () => {
      if (gracePeriodTimer) clearTimeout(gracePeriodTimer);
    };
  }, [loading, isAuthenticated, recentlyLoggedIn]);

  // Separate effect for validating authentication state
  useEffect(() => {
    let authCheckTimer: NodeJS.Timeout | null = null;
    let initialCheckTimer: NodeJS.Timeout | null = null;

    // Function to verify authentication state
    const verifyAuthState = async () => {
      // Skip checks in these scenarios:
      // 1. We're in the loading state
      // 2. We're in the post-login grace period
      // 3. We're on the login page
      if (loading || recentlyLoggedIn || window.location.pathname.includes('/login')) {
        // Skip auth check when in loading/grace period or on login page
        return;
      }

      try {
        // Don't check document.cookie as httpOnly cookies are not accessible there
        // Instead, make a lightweight call to verifyToken API
        if (isAuthenticated) {
          // Verify token validity
          const response = await fetch('/api/verifyToken', {
            method: 'GET',
            credentials: 'include', // Important for cookies
          });

          if (!response.ok && response.status === 401) {
            // Token invalid - log out
            logout();
          }
        }
      } catch (error) {
        console.error('Auth verification error:', error);
      }
    };

    // Set up periodic authentication checking every 60 seconds
    authCheckTimer = setInterval(() => {
      // Periodic auth check
      verifyAuthState();
    }, 60000); // 60 second interval

    // Delay the initial check to avoid race conditions on page load
    initialCheckTimer = setTimeout(() => {
      // Initial auth check
      verifyAuthState();
    }, 10000); // 10 second delay for initial check

    // Clean up
    return () => {
      if (authCheckTimer) clearInterval(authCheckTimer);
      if (initialCheckTimer) clearTimeout(initialCheckTimer);
    };
  }, [loading, isAuthenticated, logout, recentlyLoggedIn]);

  // If still loading, show loading indicator
  if (loading) {
    return <div className="text-white/80">Loading...</div>;
  }

  return (
    <div className="text-white flex items-left space-x-4 border-2 border-dotted border-white/70 rounded-lg p-2">
      {isAuthenticated && user ? (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="bg-maroon-400/30 p-1.5 rounded-full">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-tight">{user.userName}</span>
              {user.companyName && (
                <span className="text-xs text-gray-200/80 leading-tight">
                  [ {user.companyName} - {user.roleName} ]
                </span>
              )}
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 hover:bg-maroon-400/30 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="flex items-center space-x-2 p-1.5 hover:bg-maroon-400/30 rounded-full transition-colors"
          title="Login"
        >
          <LogIn className="w-4 h-4" />
          <span className="text-sm">Login</span>
        </Link>
      )}
    </div>
  );
}

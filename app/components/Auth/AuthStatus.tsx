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

  // Debug log to console
  useEffect(() => {
    console.log('AuthStatus: user state', { user, isAuthenticated, loading });
  }, [user, isAuthenticated, loading]);

  // Track if we're in the post-login state
  const [recentlyLoggedIn, setRecentlyLoggedIn] = useState(false);

  // Reset the recently logged in state after the grace period
  useEffect(() => {
    let gracePeriodTimer: NodeJS.Timeout | null = null;

    // When user becomes authenticated, set the recently logged in flag
    if (!loading && isAuthenticated && !recentlyLoggedIn) {
      console.log('Setting recently logged in flag');
      setRecentlyLoggedIn(true);

      // Clear the flag after the grace period
      gracePeriodTimer = setTimeout(() => {
        console.log('Login grace period ended');
        setRecentlyLoggedIn(false);
      }, 10000); // 10 second grace period after login
    }

    return () => {
      if (gracePeriodTimer) clearTimeout(gracePeriodTimer);
    };
  }, [loading, isAuthenticated, recentlyLoggedIn]);

  // Separate effect for detecting expired cookies
  useEffect(() => {
    let cookieCheckTimer: NodeJS.Timeout | null = null;
    let initialCheckTimer: NodeJS.Timeout | null = null;

    // Function to check if authentication cookies exist
    const checkCookies = () => {
      // Skip checks in these scenarios:
      // 1. We're in the loading state
      // 2. We're in the post-login grace period
      // 3. We're on the login page
      if (loading || recentlyLoggedIn || window.location.pathname.includes('/login')) {
        console.log('Skipping cookie check due to loading/grace period/login page');
        return;
      }

      // More accurate cookie detection
      const authCookieRegex = /(?:^|;\s*)(token|refreshToken)=/;
      const hasCookies = authCookieRegex.test(document.cookie);
      console.log('Cookie check result:', hasCookies);

      // Only force logout if:
      // 1. Cookies are missing
      // 2. We believe we're authenticated
      // 3. We're not on a public page
      if (!hasCookies && isAuthenticated && !window.location.pathname.includes('/unauthorized')) {
        console.log('Auth cookies missing but state shows authenticated - logging out');
        logout();
      }
    };

    // Set up periodic cookie checking every 60 seconds
    cookieCheckTimer = setInterval(() => {
      console.log('Running periodic cookie check');
      checkCookies();
    }, 60000); // Longer interval of 60 seconds

    // Delay the initial check to allow cookies to be properly set after page load
    // This prevents false positives immediately after login
    initialCheckTimer = setTimeout(() => {
      console.log('Running initial cookie check after delay');
      checkCookies();
    }, 10000); // 10 second delay for initial check

    // Clean up
    return () => {
      if (cookieCheckTimer) clearInterval(cookieCheckTimer);
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

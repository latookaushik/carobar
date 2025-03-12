/**
 * Authentication Context
 *
 * Centralized authentication state management for the Carobar application.
 * Provides login, logout, and auth state functionality throughout the app.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { refreshAccessToken, logout as authLogout } from '@/app/lib/auth';
import { JWTPayload } from '@/app/lib/auth';
import { hasRole as checkRole, RoleType } from '@/app/lib/roles';

// Use the JWTPayload as our auth user type for consistency
export type AuthUser = JWTPayload;

// Authentication context state
export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (
    companyId: string,
    userId: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: RoleType[]) => boolean;
  token: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false, error: 'AuthContext not initialized' }),
  logout: () => {},
  isAuthenticated: false,
  hasRole: () => false as boolean,
  token: null,
});

// Provider component that wraps the app
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Check if the user is authenticated on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Use the centralized auth module to check authentication
        const response = await fetch('/api/verifyToken', {
          method: 'GET',
          credentials: 'include', // Important for cookies
        });

        if (response.ok) {
          const { user } = await response.json();
          setUser(user);
          setToken('token-exists'); // Just a flag to indicate authentication
        } else if (response.status === 401) {
          // Token might be expired, try to refresh it
          const refreshed = await refreshAccessToken();

          if (refreshed) {
            // If token was refreshed successfully, try to verify again
            const newResponse = await fetch('/api/verifyToken', {
              method: 'GET',
              credentials: 'include',
            });

            if (newResponse.ok) {
              const { user } = await newResponse.json();
              setUser(user);
              setToken('token-exists');
            } else {
              setUser(null);
              setToken(null);
            }
          } else {
            setUser(null);
            setToken(null);
          }
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Login function
  const login = async (companyId: string, userId: string, password: string) => {
    try {
      // Use the original API endpoint for now
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, user_id: userId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Login failed',
        };
      }

      // The token is now set as an httpOnly cookie by the server
      // We just need to update the user state
      setUser(data.user);
      setToken('token-exists'); // We don't store the actual token anymore, just a flag

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Use the centralized auth module logout function
      await authLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear client-side state regardless of API success
    setUser(null);
    setToken(null);
    router.push('/');
  };

  // Check if user has one of the required roles
  const hasRole = (requiredRoles: RoleType[]) => {
    return checkRole(user, requiredRoles);
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

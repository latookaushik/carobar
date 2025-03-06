/**
 * Authentication Context
 *
 * Centralized authentication state management for the Carobar application.
 * Provides login, logout, and auth state functionality throughout the app.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// User type definition (single source of truth)
export interface AuthUser {
  userId: string;
  userName: string;
  email: string;
  companyId: string;
  companyName: string;
  roleId: string;
  roleName: string;
}

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
  hasRole: (roles: string[]) => boolean;
  token: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false, error: 'AuthContext not initialized' }),
  logout: () => {},
  isAuthenticated: false,
  hasRole: () => false,
  token: null,
});

// Provider component that wraps the app
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Check if the user is authenticated on mount and when token changes
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check if a token exists
        const storedToken = Cookies.get('token');

        if (!storedToken) {
          setUser(null);
          setToken(null);
          setLoading(false);
          return;
        }

        setToken(storedToken);

        // Use the original API endpoint for now
        const response = await fetch('/api/verifyToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: storedToken }),
        });

        if (response.ok) {
          const { user } = await response.json();
          setUser(user);
        } else {
          // Clear invalid token
          Cookies.remove('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        // Clear token on error
        Cookies.remove('token');
        setUser(null);
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

      // Set token cookie
      const token = data.token;
      Cookies.set('token', token, {
        expires: 1,
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });

      // Set user data from the API response
      setUser(data.user);
      setToken(token);

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
  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    setToken(null);
    router.push('/');
  };

  // Check if user has one of the required roles
  const hasRole = (requiredRoles: string[]) => {
    if (!user) return false;
    return requiredRoles.includes(user.roleId);
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

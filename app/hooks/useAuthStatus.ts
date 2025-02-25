// app/hooks/useAuthStatus.ts
'use client';

import { useState, useEffect } from 'react';
import { JWTPayload } from '@/app/lib/jwtUtil';
import { logError } from '@/app/lib/logger';
import Cookies from 'js-cookie';

export function useAuthStatus() {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [loading, setLoading] = useState(true);

  // Utility method for managing the token cookie.
  const getCookieToken = (): string | undefined => {
    return Cookies.get("token");
  }
  const removeCookieToken = () => {
    Cookies.remove("token"); // Clear invalid token
  };

  useEffect(() => {
    const verifyUser = async () => {
      const token = getCookieToken();

      if (token) {
        try {
          const response = await fetch('/api/verifyToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const { user } = await response.json();
            setUser(user);
          } else {
            logError('Invalid or expired token');
            setUser(null);
            removeCookieToken();
          }
        } catch (error) {
          logError(`Error fetching token: ${error instanceof Error ? error.message : error}`);
          setUser(null);
          removeCookieToken();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  return { user, loading };
}

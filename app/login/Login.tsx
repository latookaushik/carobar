/**
 * Login Component
 *
 * This component provides a login interface for users to authenticate into the Carobar application.
 * It allows users to enter their Company ID, User ID, and Password to gain access to their dashboard.
 *
 * Features:
 * - State management for form inputs and error handling.
 * - Loading state to indicate when the login process is ongoing.
 * - Redirects users to their intended destination upon successful login.
 * - Displays error messages for invalid credentials or unexpected errors.
 *
 * Usage:
 * - This component should be used within a client-side rendered page in Next.js.
 * - It utilizes the `useAuth` context for handling authentication logic.
 *
 * Props:
 * - None, as it manages its own internal state.
 *
 * Example:
 * ```jsx
 * <Login />
 * ```
 */

'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export function Login() {
  const [companyId, setCompanyId] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(companyId, userId, password);

      if (result.success) {
        router.push(from);
      } else {
        setError(
          result.error ||
            'Invalid credentials. Please check your Company ID, User ID, and Password.'
        );
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="rounded-md shadow-sm -space-y-px">
        <div className="mb-4">
          <label htmlFor="company-id" className="block text-sm font-medium text-gray-700">
            Company ID
          </label>
          <input
            id="company-id"
            type="text"
            required
            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 focus:z-10 sm:text-sm"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="user-id" className="block text-sm font-medium text-gray-700">
            User ID
          </label>
          <input
            id="user-id"
            type="text"
            required
            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 focus:z-10 sm:text-sm"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 focus:z-10 sm:text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-maroon-400' : 'bg-maroon-600 hover:bg-maroon-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500`}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
}

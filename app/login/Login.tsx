"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from '@/app/hooks/useLogin';

export function Login() {
  const {
    companyId,
    setCompanyId,
    userId,
    setUserId,
    password,
    setPassword,
    error,
    handleSubmit,
  } = useLogin();
  const router = useRouter();

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
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}

      <div>
        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-maroon-600 hover:bg-maroon-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500"
        >
          Sign in
        </button>
      </div>
    </form>
  );
}

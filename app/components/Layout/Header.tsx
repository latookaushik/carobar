"use client"

import { useState, useEffect } from 'react';
import AuthStatus from '@/app/components/Auth/AuthStatus';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  
  useEffect(() => {
    const token = Cookies.get('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <header className="bg-maroon-500 shadow-md">
      <div className="mx-auto flex space-x-4 items-center justify-between h-14 p-[2px]">
        <div className="flex-shrink-0 space-x-2">
          <Link href="/" className="flex items-center h-14">
            <Image
              src="/images/carobar4.gif"
              alt="Carobar"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Navigation - left aligned */}
        <nav className="flex-grow">
          <ul className="flex space-x-6">
            {!isDashboard && (
              <>
                <li><a href="#features" className="text-white hover:text-gray-200 font-medium text-sm uppercase tracking-wide">Features</a></li>
                <li><a href="#pricing" className="text-white hover:text-gray-200 font-medium text-sm uppercase tracking-wide">Pricing</a></li>
                <li><a href="#contact" className="text-white hover:text-gray-200 font-medium text-sm uppercase tracking-wide">Contact</a></li>
              </>
            )}
            {isAuthenticated && !isDashboard && (
              <li>
                <Link href="/dashboard" className="text-white hover:text-gray-200 font-medium text-sm uppercase tracking-wide">
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Auth status - right aligned */}
        <div className="flex-shrink-0">
          <div className="h-14 flex items-center">
            <AuthStatus />
          </div>
        </div>
      </div>
    </header>
  );
}

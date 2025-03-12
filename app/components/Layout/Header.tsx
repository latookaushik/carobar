'use client';

import AuthStatus from '@/app/components/Auth/AuthStatus';
import Navigation from '@/app/components/Layout/Navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/contexts/AuthContext';

export default function Header() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <header className="bg-maroon-500 shadow-md">
      <div className="mx-auto flex items-center h-14 p-[2px]">
        <div className="flex-shrink-0 space-x-2 mr-4">
          <Link href="/" className="flex items-center h-14">
            <Image
              src="/images/carobar4.gif"
              alt="Carobar"
              width={36}
              height={36}
              style={{ width: '36px', height: '36px' }}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Main area - flexible space */}
        <div className="flex-grow flex items-center">
          {/* Conditional Navigation based on auth status */}
          {isAuthenticated && !loading ? (
            /* Authenticated Navigation (menu embedded in header) */
            <Navigation user={user} />
          ) : !loading ? (
            /* Public Navigation */
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <a
                    href="#features"
                    className="text-white hover:text-gray-200 font-medium text-sm uppercase tracking-wide"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#subscription"
                    className="text-white hover:text-gray-200 font-medium text-sm uppercase tracking-wide"
                  >
                    Subscription
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-white hover:text-gray-200 font-medium text-sm uppercase tracking-wide"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </nav>
          ) : null}
        </div>

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

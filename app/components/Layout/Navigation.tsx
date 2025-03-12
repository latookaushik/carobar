'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AuthUser } from '@/app/contexts/AuthContext';

interface MenuCategory {
  label: string;
  items: { label: string; href: string; roles?: string[] }[];
}

const menuStructure: MenuCategory[] = [
  {
    label: 'TRANSACTIONS',
    items: [
      { label: 'DASHBOARD', href: '/dashboard' },
      { label: 'PURCHASE', href: '/dashboard/transactions/purchase' },
      { label: 'SALES', href: '/dashboard/transactions/sales' },
      { label: 'SHIPMENT', href: '/dashboard/transactions/shipment' },
      { label: 'EXPENSES', href: '/dashboard/transactions/expenses' },
      { label: 'LOCAL TRANSPORT', href: '/dashboard/transactions/local-transport' },
      { label: 'REPAIR', href: '/dashboard/transactions/repair' },
    ],
  },
  {
    label: 'ACCOUNTING',
    items: [
      { label: 'JOURNALS', href: '/dashboard/accounting/journals' },
      { label: 'PARTY ACCOUNT', href: '/dashboard/accounting/party-account' },
      { label: 'TRIAL BALANCE', href: '/dashboard/accounting/trial-balance' },
      { label: 'CHART OF ACCOUNTS', href: '/dashboard/accounting/chart-of-accounts' },
    ],
  },
  {
    label: 'REPORTS',
    items: [
      { label: 'VEHICLE DETAILS', href: '/dashboard/reports/vehicle-details' },
      { label: 'PURCHASE', href: '/dashboard/reports/purchase' },
      { label: 'SALES', href: '/dashboard/reports/sales' },
      { label: 'STOCKLIST', href: '/dashboard/reports/stocklist' },
      { label: 'SHIPMENT', href: '/dashboard/reports/shipment' },
      { label: 'VEHICLE LOCATION', href: '/dashboard/reports/vehicle-location' },
      { label: 'CUSTOMER REPORT', href: '/dashboard/reports/customer' },
      { label: 'RECYCLE', href: '/dashboard/reports/recycle' },
      { label: 'PAYMENT PLAN', href: '/dashboard/reports/payment-plan' },
    ],
  },
  {
    label: 'INVOICE',
    items: [
      { label: 'EXPORT INVOICE', href: '/dashboard/invoice/export' },
      { label: 'LOCAL INVOICE', href: '/dashboard/invoice/local' },
    ],
  },
  {
    label: 'REFERENCE DATA',
    items: [
      { label: 'COUNTERPARTIES', href: '/dashboard/ReferenceData/counterparties' },
      { label: 'BANKS', href: '/dashboard/ReferenceData/banks' },
      { label: 'VEHICLE LOCATION', href: '/dashboard/ReferenceData/locations' },
      { label: 'VEHICLE MAKER', href: '/dashboard/ReferenceData/vehicle-maker' },
      { label: 'VEHICLE TYPE', href: '/dashboard/ReferenceData/vehicle-type' },
      { label: 'COLORS', href: '/dashboard/ReferenceData/colors' },
      { label: 'COUNTRIES', href: '/dashboard/ReferenceData/countries' },
    ],
  },
];

interface NavigationProps {
  user: AuthUser | null;
}

export default function Navigation({ user }: NavigationProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRefs = useRef<Record<string, HTMLElement | null>>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openCategory && !event.target) return;

      const target = event.target as Node;
      const dropdown = dropdownRefs.current[openCategory || ''];

      if (dropdown && !dropdown.contains(target)) {
        setOpenCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openCategory]);

  // Close dropdowns when route changes
  useEffect(() => {
    setOpenCategory(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleCategory = (category: string) => {
    if (openCategory === category) {
      setOpenCategory(null);
    } else {
      setOpenCategory(category);
    }
  };

  // Filter menu items based on user role
  const getFilteredMenu = () => {
    if (!user) return [];

    const { roleId } = user;

    // Check if user is a super admin
    const isSuperAdmin = roleId === 'SA';

    // If super admin, return all menu items
    if (isSuperAdmin) {
      return menuStructure;
    }

    // Filter menu items for company users (CA or CU)
    return menuStructure
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          // If the item has specific roles defined, check if user's role is included
          if (item.roles && !item.roles.includes(roleId)) {
            return false;
          }

          return true;
        }),
      }))
      .filter((category) => category.items.length > 0); // Only show categories with items
  };

  const filteredMenu = getFilteredMenu();

  // Find active category based on current path
  const activeCategory =
    filteredMenu.find((category) => category.items.some((item) => pathname.startsWith(item.href)))
      ?.label || null;

  return (
    <>
      {/* Desktop Navigation - integrated into header */}
      <div className="hidden md:flex h-full">
        <ul className="flex h-full">
          {filteredMenu.map((category) => (
            <li
              key={category.label}
              className="relative h-full flex items-center"
              ref={(el) => {
                dropdownRefs.current[category.label] = el;
              }}
            >
              <button
                onClick={() => toggleCategory(category.label)}
                className={`flex items-center space-x-1 px-3 py-2 h-full text-sm font-medium text-white hover:bg-maroon-700 transition-colors ${
                  openCategory === category.label || activeCategory === category.label
                    ? 'bg-maroon-700'
                    : ''
                }`}
                aria-expanded={openCategory === category.label}
              >
                <span>{category.label}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    openCategory === category.label ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openCategory === category.label && (
                <div className="absolute left-0 top-full z-50 w-56 bg-white shadow-lg rounded-b-md py-2 border border-gray-200">
                  {category.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 ${
                        pathname === item.href ? 'bg-gray-100 font-medium text-maroon-600' : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile Navigation Trigger - integrated in header */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 rounded-md text-white hover:bg-maroon-700"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute left-0 right-0 top-14 z-50 bg-maroon-600 border-t border-maroon-700 shadow-md">
            {filteredMenu.map((category) => (
              <div key={category.label} className="border-b border-maroon-700">
                <button
                  onClick={() => toggleCategory(category.label)}
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-white ${
                    openCategory === category.label ? 'bg-maroon-700' : ''
                  }`}
                >
                  <span>{category.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openCategory === category.label ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openCategory === category.label && (
                  <div className="bg-maroon-700 py-1">
                    {category.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`block px-6 py-2 text-sm text-white hover:bg-maroon-800 ${
                          pathname === item.href ? 'font-medium bg-maroon-800' : ''
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

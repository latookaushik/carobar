// app/components/Auth/AuthStatus.tsx

'use client';
import Link from 'next/link';
import { User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';

// Purpose: React component to display authentication status and user information
// in application header.
export default function AuthStatus() {
  const { user, loading, logout } = useAuth();


  
  if (loading) {
    return <div className="text-white/80">Loading...</div>;
  }




  return (
    <div className="text-white flex items-left space-x-4 border-2 border-dotted border-white/70 rounded-lg p-2">
      {user ? (
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

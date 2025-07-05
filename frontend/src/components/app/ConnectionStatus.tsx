'use client';

import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import Link from 'next/link';

const ConnectionStatus = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/app/settings"
        className="flex items-center gap-2 px-3 py-1.5 bg-green-50 hover:bg-green-100 transition-colors duration-200 border border-green-200 rounded-full cursor-pointer"
      >
        <CheckCircleIcon className="h-4 w-4 text-green-600" />
        <span className="text-xs font-medium text-green-700">
          {user.first_name} {user.last_name}
        </span>
      </Link>

      <button
        onClick={handleLogout}
        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
        title="Se déconnecter"
      >
        <RiLogoutBoxRLine className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ConnectionStatus;

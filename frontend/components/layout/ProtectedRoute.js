"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !token && pathname !== '/login') {
      router.push('/login');
    }
  }, [token, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (!token && pathname !== '/login') {
    return null; // Prevents flashing protected content before redirection
  }

  return <>{children}</>;
};

export default ProtectedRoute;

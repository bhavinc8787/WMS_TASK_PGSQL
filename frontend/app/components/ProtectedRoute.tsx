'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const isLoading = useAppSelector((s) => s.auth.isLoading);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

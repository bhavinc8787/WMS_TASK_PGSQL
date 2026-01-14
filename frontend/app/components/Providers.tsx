'use client';

import React from 'react';
import { Provider } from 'react-redux';
import store from '@/store/store';
import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { verifyToken } from '@/store/authSlice';

export default function Providers({ children }: { children: React.ReactNode }) {
  function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    useEffect(() => {
      dispatch(verifyToken());
    }, [dispatch]);
    return <>{children}</>;
  }

  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}

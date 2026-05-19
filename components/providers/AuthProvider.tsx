// components/providers/AuthProvider.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setLoading } = useAuth();

  useEffect(() => {
    // Ensure auth state is initialized
    setLoading(false);
  }, [setLoading]);

  return <>{children}</>;
}
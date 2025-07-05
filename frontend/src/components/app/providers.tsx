'use client';

import { HeroUIProvider } from '@heroui/react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';
import AppLayout from './AppLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>
        <Toaster richColors />
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </HeroUIProvider>
    </QueryClientProvider>
  );
};

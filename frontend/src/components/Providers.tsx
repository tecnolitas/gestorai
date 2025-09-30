'use client';

import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppSettingsProvider } from '@/contexts/AppSettingsContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <AuthProvider>
        <AppSettingsProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AppSettingsProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
} 
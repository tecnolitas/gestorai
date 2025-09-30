'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAppSettings, AppSettings } from '@/hooks/useAppSettings';

interface AppSettingsContextType {
  settings: AppSettings;
  isLoaded: boolean;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateNotificationSettings: (updates: Partial<AppSettings['notifications']>) => void;
  updateDefaultView: (updates: Partial<AppSettings['defaultView']>) => void;
  updateDisplaySettings: (updates: Partial<AppSettings['display']>) => void;
  resetSettings: () => void;
  getLanguage: () => 'es' | 'en';
  getTimezone: () => string;
  getNotificationSettings: () => AppSettings['notifications'];
  getDefaultView: () => AppSettings['defaultView'];
  getDisplaySettings: () => AppSettings['display'];
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

interface AppSettingsProviderProps {
  children: ReactNode;
}

export function AppSettingsProvider({ children }: AppSettingsProviderProps) {
  const appSettings = useAppSettings();

  return (
    <AppSettingsContext.Provider value={appSettings}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettingsContext() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettingsContext must be used within an AppSettingsProvider');
  }
  return context;
}




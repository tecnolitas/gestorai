import { useState, useEffect } from 'react';

export interface AppSettings {
  language: 'es' | 'en';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    taskReminders: boolean;
    projectUpdates: boolean;
    weeklyReports: boolean;
  };
  defaultView: {
    dashboard: 'overview' | 'tasks' | 'projects';
    tasks: 'list' | 'kanban' | 'calendar';
    projects: 'grid' | 'list';
  };
  display: {
    itemsPerPage: number;
    showCompletedTasks: boolean;
    autoRefresh: boolean;
    refreshInterval: number; // en minutos
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'es',
  timezone: 'America/Mexico_City',
  notifications: {
    email: true,
    push: true,
    taskReminders: true,
    projectUpdates: true,
    weeklyReports: false
  },
  defaultView: {
    dashboard: 'overview',
    tasks: 'list',
    projects: 'grid'
  },
  display: {
    itemsPerPage: 10,
    showCompletedTasks: true,
    autoRefresh: true,
    refreshInterval: 5
  }
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar configuración al inicializar
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveSettings = (newSettings: AppSettings) => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error guardando configuración:', error);
      return false;
    }
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updateNotificationSettings = (updates: Partial<AppSettings['notifications']>) => {
    const newSettings = {
      ...settings,
      notifications: { ...settings.notifications, ...updates }
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updateDefaultView = (updates: Partial<AppSettings['defaultView']>) => {
    const newSettings = {
      ...settings,
      defaultView: { ...settings.defaultView, ...updates }
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updateDisplaySettings = (updates: Partial<AppSettings['display']>) => {
    const newSettings = {
      ...settings,
      display: { ...settings.display, ...updates }
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  };

  const getLanguage = () => {
    return settings.language;
  };

  const getTimezone = () => {
    return settings.timezone;
  };

  const getNotificationSettings = () => {
    return settings.notifications;
  };

  const getDefaultView = () => {
    return settings.defaultView;
  };

  const getDisplaySettings = () => {
    return settings.display;
  };

  return {
    settings,
    isLoaded,
    updateSettings,
    updateNotificationSettings,
    updateDefaultView,
    updateDisplaySettings,
    resetSettings,
    getLanguage,
    getTimezone,
    getNotificationSettings,
    getDefaultView,
    getDisplaySettings
  };
}




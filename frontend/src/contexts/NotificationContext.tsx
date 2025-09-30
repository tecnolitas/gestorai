'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Notification, NotificationProps, NotificationType } from '@/components/ui/Notification';

interface NotificationContextType {
  notifications: NotificationProps[];
  showNotification: (notification: Omit<NotificationProps, 'id' | 'onClose'>) => void;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((notification: Omit<NotificationProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onClose: hideNotification,
    };
    
    setNotifications(prev => [...prev, newNotification]);
  }, [hideNotification]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    showNotification({
      type: 'success',
      title,
      message,
      duration,
    });
  }, [showNotification]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    showNotification({
      type: 'error',
      title,
      message,
      duration,
    });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    showNotification({
      type: 'warning',
      title,
      message,
      duration,
    });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    showNotification({
      type: 'info',
      title,
      message,
      duration,
    });
  }, [showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        hideNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      {/* Renderizar notificaciones */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Notification key={notification.id} {...notification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

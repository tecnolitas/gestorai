'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSettingsContext } from '@/contexts/AppSettingsContext';
import { Button } from '@/components/ui/Button';
import { Table, Calendar, List, Trello, ChevronDown } from 'lucide-react';

interface ViewSelectorProps {
  className?: string;
}

const VIEW_STORAGE_KEY = 'task-view-preference';

export function ViewSelector({ className = '' }: ViewSelectorProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, isLoaded } = useAppSettingsContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<string>('/tasks');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const views = [
    {
      name: 'Tabla',
      href: '/tasks',
      icon: Table,
      description: 'Vista en tabla con filtros'
    },
    {
      name: 'Kanban',
      href: '/tasks/kanban',
      icon: Trello,
      description: 'Drag & drop entre columnas'
    },
    {
      name: 'Calendario',
      href: '/tasks/calendar',
      icon: Calendar,
      description: 'Vista de calendario mensual'
    },
    {
      name: 'Lista',
      href: '/tasks/list',
      icon: List,
      description: 'Agrupado por proyecto'
    }
  ];

  // Cargar vista guardada al inicializar
  useEffect(() => {
    if (!isLoaded) return;

    // Usar la configuración por defecto en lugar de localStorage
    const defaultTasksView = settings.defaultView.tasks;
    const defaultViewHref = defaultTasksView === 'list' ? '/tasks' : `/tasks/${defaultTasksView}`;
    
    // Establecer la vista seleccionada basada en la configuración
    setSelectedView(defaultViewHref);
    
    // Si estamos en /tasks y la vista por defecto no es 'list', redirigir
    if (pathname === '/tasks' && defaultTasksView !== 'list') {
      router.replace(`/tasks/${defaultTasksView}`);
    }
  }, [pathname, router, isLoaded, settings.defaultView.tasks]);

  const isActive = (href: string) => {
    if (href === '/tasks') {
      return pathname === '/tasks';
    }
    return pathname.startsWith(href);
  };

  const getCurrentView = () => {
    return views.find(view => view.href === selectedView) || views[0];
  };

  const currentView = getCurrentView();
  const CurrentIcon = currentView.icon;

  const handleViewSelect = (href: string) => {
    setSelectedView(href);
    // Guardar la preferencia temporal del usuario
    localStorage.setItem(VIEW_STORAGE_KEY, href);
    setIsOpen(false);
    router.push(href);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[120px] justify-between"
      >
        <div className="flex items-center space-x-2">
          <CurrentIcon className="h-4 w-4" />
          <span>{currentView.name}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 w-56 rounded-md shadow-lg z-50"
          style={{ 
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)'
          }}
        >
          <div className="py-1">
            {views.map((view) => {
              const Icon = view.icon;
              const active = isActive(view.href);
              
              return (
                <button
                  key={view.href}
                  onClick={() => handleViewSelect(view.href)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${
                    active 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  style={{
                    color: active ? 'var(--primary)' : 'var(--foreground)'
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">{view.name}</div>
                    <div className="text-xs opacity-70" style={{ color: 'var(--muted-foreground)' }}>
                      {view.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 
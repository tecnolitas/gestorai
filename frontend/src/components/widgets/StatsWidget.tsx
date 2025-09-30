'use client';

import React, { memo } from 'react';
import { FolderOpen, CheckSquare, Clock, TrendingUp } from 'lucide-react';

interface StatsWidgetProps {
  stats: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
  };
  variant?: 'default' | 'compact' | 'wide';
  isUpdating?: boolean;
  updatingStats?: string[]; // Array de nombres de estadísticas que se están actualizando
}

export const StatsWidget = memo(function StatsWidget({ 
  stats, 
  variant = 'default', 
  isUpdating = false, 
  updatingStats = [] 
}: StatsWidgetProps) {
  const statItems = [
    {
      title: 'Total Proyectos',
      value: stats.totalProjects,
      icon: FolderOpen,
      color: 'text-blue-600',
      key: 'totalProjects'
    },
    {
      title: 'Total Tareas',
      value: stats.totalTasks,
      icon: CheckSquare,
      color: 'text-green-600',
      key: 'totalTasks'
    },
    {
      title: 'Tareas Completadas',
      value: stats.completedTasks,
      icon: CheckSquare,
      color: 'text-green-600',
      key: 'completedTasks'
    },
    {
      title: 'Tareas Pendientes',
      value: stats.pendingTasks,
      icon: Clock,
      color: 'text-yellow-600',
      key: 'pendingTasks'
    },
  ];

  const getGridClasses = () => {
    switch (variant) {
      case 'compact':
        return 'grid grid-cols-2 lg:grid-cols-4 gap-4';
      case 'wide':
        return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';
    }
  };

  const getCardClasses = () => {
    switch (variant) {
      case 'compact':
        return 'p-4';
      case 'wide':
        return 'p-6';
      default:
        return 'p-5';
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'compact':
        return 'h-5 w-5';
      case 'wide':
        return 'h-8 w-8';
      default:
        return 'h-6 w-6';
    }
  };

  const getTextSize = () => {
    switch (variant) {
      case 'compact':
        return 'text-sm';
      case 'wide':
        return 'text-xl';
      default:
        return 'text-lg';
    }
  };

  return (
    <div className={getGridClasses()}>
      {statItems.map((item, index) => {
        const IconComponent = item.icon;
        const isThisStatUpdating = updatingStats.includes(item.key);
        
        return (
          <div 
            key={index} 
            className={`overflow-hidden shadow rounded-lg transition-all duration-300 relative ${
              isThisStatUpdating ? 'ring-2 ring-blue-500/50 shadow-lg' : ''
            }`} 
            style={{ backgroundColor: 'var(--card)' }}
          >
            {/* Indicador de actualización sutil */}
            {isThisStatUpdating && (
              <div className="absolute top-2 right-2">
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            )}
            
            <div className={getCardClasses()}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <IconComponent className={`${getIconSize()} ${item.color} transition-colors duration-200`} />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium truncate ${variant === 'compact' ? 'text-xs' : ''}`} style={{ color: 'var(--muted-foreground)' }}>
                      {item.title}
                    </dt>
                    <dd className={`font-medium ${getTextSize()} transition-all duration-200 ${
                      isThisStatUpdating ? 'text-blue-600 dark:text-blue-400' : ''
                    }`} style={{ color: 'var(--card-foreground)' }}>
                      {item.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}); 
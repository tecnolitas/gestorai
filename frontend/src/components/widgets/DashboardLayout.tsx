'use client';

import React, { useState, Suspense, lazy } from 'react';
import { Project, Task } from '@/types/api';
import { StatsWidget } from './StatsWidget';
import { RecentProjectsWidget } from './RecentProjectsWidget';
import { RecentTasksWidget } from './RecentTasksWidget';
import { QuickActionsWidget } from './QuickActionsWidget';
// Lazy loading de componentes pesados
const ChartsWidget = lazy(() => import('./ChartsWidget').then(module => ({ default: module.default })));
const DraggableDashboard = lazy(() => import('./DraggableDashboard').then(module => ({ default: module.DraggableDashboard })));

interface DashboardLayoutProps {
  stats: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
  };
  projects: Project[];
  tasks: Task[];
  onToggleTaskComplete?: (taskId: number) => void;
}

type LayoutType = 'default' | 'compact' | 'wide' | 'focused' | 'draggable';

export function DashboardLayout({ 
  stats, 
  projects, 
  tasks, 
  onToggleTaskComplete 
}: DashboardLayoutProps) {
  const [layout, setLayout] = useState<LayoutType>('default');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingStats, setUpdatingStats] = useState<string[]>([]);

  const layouts = {
    default: {
      container: 'max-w-7xl',
      stats: 'mb-8',
      actions: 'mb-8',
      content: 'grid grid-cols-1 lg:grid-cols-2 gap-8',
      charts: 'grid grid-cols-1 gap-8 mb-8',
      projectsCol: '',
      tasksCol: '',
      chartsCol: 'col-span-full',
      statsVariant: 'default' as const,
      description: 'Layout estándar con balance entre estadísticas y contenido'
    },
    compact: {
      container: 'max-w-6xl',
      stats: 'mb-6',
      actions: 'mb-6', 
      content: 'grid grid-cols-1 xl:grid-cols-3 gap-6',
      charts: 'grid grid-cols-1 gap-6 mb-6',
      projectsCol: 'xl:col-span-1',
      tasksCol: 'xl:col-span-2',
      chartsCol: 'xl:col-span-3',
      statsVariant: 'compact' as const,
      description: 'Layout compacto con más tareas visibles'
    },
    wide: {
      container: 'max-w-full px-8',
      stats: 'mb-10',
      actions: 'mb-10',
      content: 'grid grid-cols-1 2xl:grid-cols-3 gap-10',
      charts: 'grid grid-cols-1 gap-10 mb-10',
      projectsCol: '',
      tasksCol: '',
      chartsCol: 'col-span-full',
      statsVariant: 'wide' as const,
      description: 'Layout amplio que usa todo el ancho disponible'
    },
    focused: {
      container: 'max-w-5xl',
      stats: 'mb-4',
      actions: 'mb-4',
      content: 'grid grid-cols-1 gap-6',
      charts: 'grid grid-cols-1 gap-6 mb-6',
      projectsCol: '',
      tasksCol: '',
      chartsCol: '',
      statsVariant: 'default' as const,
      description: 'Layout enfocado en una columna para mejor concentración'
    },
    draggable: {
      container: 'max-w-full',
      stats: 'mb-0',
      actions: 'mb-0',
      content: 'grid grid-cols-1 gap-0',
      charts: 'grid grid-cols-1 gap-0 mb-0',
      projectsCol: '',
      tasksCol: '',
      chartsCol: '',
      statsVariant: 'default' as const,
      description: 'Layout personalizable con drag & drop de widgets'
    }
  };

  const currentLayout = layouts[layout];

  const handleToggleTaskComplete = async (taskId: number) => {
    if (onToggleTaskComplete) {
      setIsUpdating(true);
      setUpdatingStats(['completedTasks', 'pendingTasks']);
      
      try {
        await onToggleTaskComplete(taskId);
      } finally {
        // Mantener el estado de actualización por un momento para que se vea el efecto
        setTimeout(() => {
          setIsUpdating(false);
          setUpdatingStats([]);
        }, 800);
      }
    }
  };

  // Si es el layout personalizable, renderizar el DraggableDashboard
    if (layout === 'draggable') {
      return (
        <div className={`${currentLayout.container} mx-auto py-6 sm:px-6 lg:px-8`}>
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          }>
            <DraggableDashboard
              stats={stats}
              projects={projects}
              tasks={tasks}
              onToggleTaskComplete={onToggleTaskComplete}
              onLayoutChange={setLayout}
            />
          </Suspense>
        </div>
      );
    }

  return (
    <div className={`${currentLayout.container} mx-auto py-6 sm:px-6 lg:px-8`}>
      {/* Layout Controls */}
      <div className="px-4 sm:px-0 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Dashboard</h1>
            <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>Resumen de tus proyectos y tareas</p>
          </div>
          
          {/* Layout Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Layout:</span>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value as LayoutType)}
                className="px-3 py-1 text-sm border rounded-md"
                style={{ 
                  backgroundColor: 'var(--input)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)'
                }}
              >
                <option value="default">Predeterminado</option>
                <option value="compact">Compacto</option>
                <option value="wide">Amplio</option>
                <option value="focused">Enfocado</option>
                <option value="draggable">Personalizable</option>
              </select>
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {currentLayout.description}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Widget */}
      <div className={`px-4 sm:px-0 ${currentLayout.stats}`}>
        <StatsWidget 
          stats={stats} 
          variant={currentLayout.statsVariant} 
          isUpdating={isUpdating}
          updatingStats={updatingStats}
        />
      </div>

      {/* Quick Actions Widget */}
      <div className={`px-4 sm:px-0 ${currentLayout.actions}`}>
        <QuickActionsWidget />
      </div>

      {/* Charts Grid */}
      <div className={`px-4 sm:px-0 ${currentLayout.charts}`}>
        <div className={currentLayout.chartsCol}>
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          }>
            <ChartsWidget variant={currentLayout.chartsCol === 'col-span-full' ? 'wide' : 'default'} />
          </Suspense>
        </div>
      </div>

      {/* Content Grid */}
      <div className={`px-4 sm:px-0 ${currentLayout.content}`}>
        {/* Recent Projects Widget */}
        <div className={currentLayout.projectsCol}>
          <RecentProjectsWidget projects={projects} />
        </div>

        {/* Recent Tasks Widget */}
        <div className={currentLayout.tasksCol}>
          <RecentTasksWidget 
            tasks={tasks} 
            onToggleComplete={handleToggleTaskComplete}
          />
        </div>
      </div>
    </div>
  );
} 
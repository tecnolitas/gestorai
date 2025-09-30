'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { Project, Task } from '@/types/api';
import { StatsWidget } from './StatsWidget';
import { RecentProjectsWidget } from './RecentProjectsWidget';
import { RecentTasksWidget } from './RecentTasksWidget';
import { QuickActionsWidget } from './QuickActionsWidget';
import ChartsWidget from './ChartsWidget';
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DraggableDashboardProps {
  stats: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
  };
  projects: Project[];
  tasks: Task[];
  onToggleTaskComplete?: (taskId: number) => void;
  onLayoutChange?: (layout: string) => void;
}

interface WidgetConfig {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

const defaultLayouts: { [key: string]: Layout[] } = {
  lg: [
    { i: 'stats', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
    { i: 'actions', x: 0, y: 2, w: 12, h: 2, minW: 6, minH: 2 },
    { i: 'charts', x: 0, y: 4, w: 12, h: 4, minW: 6, minH: 3 },
    { i: 'projects', x: 0, y: 8, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'tasks', x: 6, y: 8, w: 6, h: 4, minW: 4, minH: 3 },
  ],
  md: [
    { i: 'stats', x: 0, y: 0, w: 8, h: 2, minW: 4, minH: 2 },
    { i: 'actions', x: 0, y: 2, w: 8, h: 2, minW: 4, minH: 2 },
    { i: 'charts', x: 0, y: 4, w: 8, h: 4, minW: 4, minH: 3 },
    { i: 'projects', x: 0, y: 8, w: 8, h: 4, minW: 4, minH: 3 },
    { i: 'tasks', x: 0, y: 12, w: 8, h: 4, minW: 4, minH: 3 },
  ],
  sm: [
    { i: 'stats', x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: 'actions', x: 0, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
    { i: 'charts', x: 0, y: 4, w: 4, h: 4, minW: 2, minH: 3 },
    { i: 'projects', x: 0, y: 8, w: 4, h: 4, minW: 2, minH: 3 },
    { i: 'tasks', x: 0, y: 12, w: 4, h: 4, minW: 2, minH: 3 },
  ],
  xs: [
    { i: 'stats', x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    { i: 'actions', x: 0, y: 2, w: 2, h: 2, minW: 2, minH: 2 },
    { i: 'charts', x: 0, y: 4, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'projects', x: 0, y: 8, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'tasks', x: 0, y: 12, w: 2, h: 4, minW: 2, minH: 3 },
  ],
};

export function DraggableDashboard({ 
  stats, 
  projects, 
  tasks, 
  onToggleTaskComplete,
  onLayoutChange
}: DraggableDashboardProps) {
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>(defaultLayouts);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingStats, setUpdatingStats] = useState<string[]>([]);

  // Cargar layout guardado del localStorage
  useEffect(() => {
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    if (savedLayouts) {
      try {
        const parsedLayouts = JSON.parse(savedLayouts);
        setLayouts(parsedLayouts);
      } catch (error) {
        console.error('Error loading saved layouts:', error);
      }
    }
  }, []);

  // Guardar layout en localStorage
  const saveLayouts = useCallback((newLayouts: { [key: string]: Layout[] }) => {
    localStorage.setItem('dashboard-layouts', JSON.stringify(newLayouts));
  }, []);

  const handleLayoutChange = (layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    setLayouts(allLayouts);
    saveLayouts(allLayouts);
  };

  const handleToggleTaskComplete = async (taskId: number) => {
    if (onToggleTaskComplete) {
      setIsUpdating(true);
      setUpdatingStats(['completedTasks', 'pendingTasks']);
      
      try {
        await onToggleTaskComplete(taskId);
      } finally {
        setTimeout(() => {
          setIsUpdating(false);
          setUpdatingStats([]);
        }, 800);
      }
    }
  };

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    saveLayouts(defaultLayouts);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'stats':
        return (
          <StatsWidget 
            stats={stats} 
            variant="default" 
            isUpdating={isUpdating}
            updatingStats={updatingStats}
          />
        );
      case 'actions':
        return <QuickActionsWidget />;
      case 'charts':
        return <ChartsWidget variant="wide" />;
      case 'projects':
        return <RecentProjectsWidget projects={projects} />;
      case 'tasks':
        return (
          <RecentTasksWidget 
            tasks={tasks} 
            onToggleComplete={handleToggleTaskComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Controles del Dashboard */}
      <div className="px-4 sm:px-0 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
              Dashboard Personalizable
            </h1>
            <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
              Arrastra y redimensiona los widgets para personalizar tu vista
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {/* Selector de Layout */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Layout:</span>
              <select
                onChange={(e) => onLayoutChange?.(e.target.value)}
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
                <option value="draggable" selected>Personalizable</option>
              </select>
            </div>
            
            {/* Controles del Dashboard Personalizable */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleEditMode}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isEditMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {isEditMode ? (
                  <>
                    <Minimize2 className="h-4 w-4 inline mr-2" />
                    Salir del modo edición
                  </>
                ) : (
                  <>
                    <GripVertical className="h-4 w-4 inline mr-2" />
                    Editar layout
                  </>
                )}
              </button>
              
              <button
                onClick={resetLayout}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <Maximize2 className="h-4 w-4 inline mr-2" />
                Restablecer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 8, sm: 4, xs: 2, xxs: 2 }}
        rowHeight={60}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
        draggableHandle=".drag-handle"
      >
        {/* Stats Widget */}
        <div key="stats" className="widget-container">
          <div className="relative h-full">
            {isEditMode && (
              <div className="drag-handle absolute top-2 right-2 z-10 p-1 bg-white dark:bg-gray-800 rounded shadow-lg cursor-move">
                <GripVertical className="h-4 w-4 text-gray-500" />
              </div>
            )}
            <div className="h-full" style={{ backgroundColor: 'var(--card)' }}>
              {renderWidget('stats')}
            </div>
          </div>
        </div>

        {/* Quick Actions Widget */}
        <div key="actions" className="widget-container">
          <div className="relative h-full">
            {isEditMode && (
              <div className="drag-handle absolute top-2 right-2 z-10 p-1 bg-white dark:bg-gray-800 rounded shadow-lg cursor-move">
                <GripVertical className="h-4 w-4 text-gray-500" />
              </div>
            )}
            <div className="h-full" style={{ backgroundColor: 'var(--card)' }}>
              {renderWidget('actions')}
            </div>
          </div>
        </div>

        {/* Charts Widget */}
        <div key="charts" className="widget-container">
          <div className="relative h-full">
            {isEditMode && (
              <div className="drag-handle absolute top-2 right-2 z-10 p-1 bg-white dark:bg-gray-800 rounded shadow-lg cursor-move">
                <GripVertical className="h-4 w-4 text-gray-500" />
              </div>
            )}
            <div className="h-full" style={{ backgroundColor: 'var(--card)' }}>
              {renderWidget('charts')}
            </div>
          </div>
        </div>

        {/* Recent Projects Widget */}
        <div key="projects" className="widget-container">
          <div className="relative h-full">
            {isEditMode && (
              <div className="drag-handle absolute top-2 right-2 z-10 p-1 bg-white dark:bg-gray-800 rounded shadow-lg cursor-move">
                <GripVertical className="h-4 w-4 text-gray-500" />
              </div>
            )}
            <div className="h-full" style={{ backgroundColor: 'var(--card)' }}>
              {renderWidget('projects')}
            </div>
          </div>
        </div>

        {/* Recent Tasks Widget */}
        <div key="tasks" className="widget-container">
          <div className="relative h-full">
            {isEditMode && (
              <div className="drag-handle absolute top-2 right-2 z-10 p-1 bg-white dark:bg-gray-800 rounded shadow-lg cursor-move">
                <GripVertical className="h-4 w-4 text-gray-500" />
              </div>
            )}
            <div className="h-full" style={{ backgroundColor: 'var(--card)' }}>
              {renderWidget('tasks')}
            </div>
          </div>
        </div>
      </ResponsiveGridLayout>

      <style jsx global>{`
        .react-grid-layout {
          position: relative;
        }
        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top;
        }
        .react-grid-item.cssTransforms {
          transition-property: transform;
        }
        .react-grid-item > .react-resizable-handle {
          position: absolute;
          width: 20px;
          height: 20px;
          bottom: 0;
          right: 0;
          background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNNiA2TDAgNloiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+');
          background-position: bottom right;
          padding: 0 3px 3px 0;
          background-repeat: no-repeat;
          background-origin: content-box;
          box-sizing: border-box;
          cursor: se-resize;
        }
        .react-grid-item.react-grid-placeholder {
          background: rgb(59, 130, 246, 0.1);
          border: 2px dashed rgb(59, 130, 246);
          border-radius: 8px;
          opacity: 0.2;
          transition-duration: 100ms;
          z-index: 2;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          -o-user-select: none;
          user-select: none;
        }
        .react-grid-item.react-draggable-dragging {
          transition: none;
          z-index: 3;
          will-change: transform;
        }
        .react-grid-item.dropping {
          transition: none;
        }
        .react-grid-item.react-draggable-dragging .react-resizable-handle {
          pointer-events: none;
        }
        .widget-container {
          height: 100%;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        .widget-container:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </div>
  );
}

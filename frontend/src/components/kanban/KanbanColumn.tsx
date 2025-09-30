'use client';

import React from 'react';
import {
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '@/types/api';
import { KanbanTask } from './KanbanTask';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  onToggleComplete: (taskId: number) => void;
}

export function KanbanColumn({ id, title, color, tasks, onToggleComplete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  // Droppable adicional para el área vacía
  const { setNodeRef: setEmptyAreaRef, isOver: isOverEmpty } = useDroppable({
    id: `${id}-empty`,
  });

  // Combinar ambos estados de isOver
  const isOverColumn = isOver || isOverEmpty;

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col h-full min-h-[400px] transition-all duration-200 ${
        isOverColumn ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      {/* Column Header */}
      <div className={`p-4 rounded-t-lg ${color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {title}
          </h3>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/50 dark:bg-black/20">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column Content - Zona de drop expandida */}
      <div
        className={`kanban-column flex-1 p-4 rounded-b-lg transition-all duration-200 min-h-[300px] relative ${
          isOverColumn ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
        }`}
        style={{ 
          backgroundColor: isOverColumn ? 'var(--accent)' : 'var(--card)',
          border: isOverColumn ? '2px dashed #3b82f6' : '2px solid transparent'
        }}
      >
        {/* Indicador de drop overlay */}
        {isOverColumn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-pulse">
              Suelta aquí para mover a "{title}"
            </div>
          </div>
        )}
        
        <div className="space-y-3 min-h-[200px]">
          {tasks.length > 0 ? (
            <div className="relative">
              <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                {tasks.map((task) => (
                  <KanbanTask
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                  />
                ))}
              </SortableContext>
              {/* Zona de drop invisible que cubre toda el área */}
              <div 
                ref={setEmptyAreaRef}
                className="absolute inset-0 pointer-events-none"
                style={{ minHeight: '200px' }}
              />
            </div>
          ) : (
            <div 
              ref={setEmptyAreaRef}
              className={`flex items-center justify-center h-32 rounded-lg border-2 border-dashed transition-colors ${
                isOverEmpty 
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              style={{ minHeight: '200px' }}
            >
              <div className="text-center">
                <div className={`text-2xl mb-2 ${isOverEmpty ? 'text-blue-500' : 'text-gray-400'}`}>
                  {isOverEmpty ? '↓' : '+'}
                </div>
                <p className={`text-sm ${isOverEmpty ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {isOverEmpty ? 'Suelta aquí' : 'Arrastra una tarea aquí'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
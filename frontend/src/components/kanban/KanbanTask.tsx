'use client';

import React from 'react';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { Task } from '@/types/api';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { User, Calendar, MoreVertical, GripVertical } from 'lucide-react';
import Link from 'next/link';

interface KanbanTaskProps {
  task: Task;
  onToggleComplete: (taskId: number) => void;
  isDragging?: boolean;
}

export function KanbanTask({ task, onToggleComplete, isDragging = false }: KanbanTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Si es el overlay de drag, no usar los listeners del sortable
  const dragProps = isDragging ? {} : { ...attributes, ...listeners };

  return (
    <div
      ref={setNodeRef}
      {...dragProps}
      className={`p-4 rounded-lg border cursor-move transition-all duration-200 hover:shadow-md hover:scale-[1.02] group ${
        (isDragging || isSortableDragging) 
          ? 'opacity-90 rotate-1 scale-105 shadow-2xl ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/20' 
          : 'hover:border-blue-300 dark:hover:border-blue-600'
      }`}
      style={{
        backgroundColor: (isDragging || isSortableDragging) ? 'var(--accent)' : 'var(--card)',
        borderColor: (isDragging || isSortableDragging) ? 'var(--primary)' : 'var(--border)',
        transform: CSS.Transform.toString(transform),
        transition,
        ...(isDragging && {
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          zIndex: 1000,
        }),
        ...style,
      }}
    >
      {/* Drag Handle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            onClick={(e) => e.stopPropagation()}
          />
          <PriorityBadge priority={task.priority} />
        </div>
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <MoreVertical className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
        </button>
      </div>

      {/* Task Title */}
      <Link href={`/tasks/${task.id}`}>
        <h4 
          className={`font-medium mb-2 line-clamp-2 hover:text-blue-600 transition-colors ${
            task.completed ? 'line-through' : ''
          }`}
          style={{ color: task.completed ? 'var(--muted-foreground)' : 'var(--foreground)' }}
        >
          {task.title}
        </h4>
      </Link>

      {/* Task Description */}
      {task.description && (
        <p 
          className="text-sm mb-3 line-clamp-2"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {task.description}
        </p>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
        <div className="flex items-center space-x-2">
          <User className="h-3 w-3" />
          <span>
            {task.assignee?.first_name || task.assignee?.username || 'Sin asignar'}
          </span>
        </div>
        
        {task.due_date && (
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Project Badge */}
      {task.project && (
        <div className="mt-2">
          <span 
            className="inline-block px-2 py-1 text-xs rounded-full"
            style={{ 
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)'
            }}
          >
            {task.project.name}
          </span>
        </div>
      )}
    </div>
  );
}
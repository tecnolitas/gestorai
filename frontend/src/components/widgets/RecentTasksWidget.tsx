'use client';

import React, { memo } from 'react';
import { Task } from '@/types/api';
import { User, Calendar } from 'lucide-react';

interface RecentTasksWidgetProps {
  tasks: Task[];
  maxItems?: number;
  onToggleComplete?: (taskId: number) => void;
}

export const RecentTasksWidget = memo(function RecentTasksWidget({ tasks, maxItems = 5, onToggleComplete }: RecentTasksWidgetProps) {
  const recentTasks = tasks.slice(0, maxItems);

  return (
    <div className="shadow rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-lg font-medium" style={{ color: 'var(--card-foreground)' }}>
          Tareas Recientes
        </h3>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {recentTasks.map((task) => (
          <div key={task.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleComplete?.(task.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <div>
                  <h4 
                    className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`} 
                    style={{ color: task.completed ? 'var(--muted-foreground)' : 'var(--card-foreground)' }}
                  >
                    {task.title}
                  </h4>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    {task.project?.name || 'Sin proyecto'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {task.assignee?.first_name || task.assignee?.username || 'Sin asignar'}
                </span>
                {task.due_date && (
                  <>
                    <Calendar className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="px-6 py-4 text-center" style={{ color: 'var(--muted-foreground)' }}>
            No hay tareas creadas aún
          </div>
        )}
      </div>
    </div>
  );
}); 
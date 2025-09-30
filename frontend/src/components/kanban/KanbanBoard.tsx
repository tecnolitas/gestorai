'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '@/types/api';
import { KanbanColumn } from './KanbanColumn';
import { KanbanTask } from './KanbanTask';

interface KanbanBoardProps {
  tasks: Task[];
  onToggleComplete: (taskId: number) => void;
  onTaskMove: (taskId: number, newStatus: 'pending' | 'in_progress' | 'completed') => void;
}

type TaskStatus = 'pending' | 'in_progress' | 'completed';

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'pending', title: 'Pendiente', color: 'bg-yellow-100 dark:bg-yellow-900/20' },
  { id: 'in_progress', title: 'En Progreso', color: 'bg-blue-100 dark:bg-blue-900/20' },
  { id: 'completed', title: 'Completada', color: 'bg-green-100 dark:bg-green-900/20' },
];

export function KanbanBoard({ tasks, onToggleComplete, onTaskMove }: KanbanBoardProps) {
  const [taskStatuses, setTaskStatuses] = useState<Record<number, TaskStatus>>({});
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Inicializar estados de tareas basado en su estado de completado
  useEffect(() => {
    const statuses: Record<number, TaskStatus> = {};
    tasks.forEach(task => {
      // Solo establecer el estado si no existe ya
      if (!taskStatuses[task.id]) {
        if (task.completed) {
          // Las tareas completadas van a la columna completed
          statuses[task.id] = 'completed';
        } else {
          // Las tareas no completadas van a pending por defecto
          statuses[task.id] = 'pending';
        }
      }
    });
    
    // Solo actualizar si hay nuevos estados para agregar
    if (Object.keys(statuses).length > 0) {
      setTaskStatuses(prev => ({
        ...prev,
        ...statuses
      }));
    }
  }, [tasks]); // Removemos taskStatuses de las dependencias

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = Number(event.active.id);
    const task = tasks.find(t => t.id === taskId);
    console.log('DragStart - taskId:', taskId, 'task:', task);
    console.log('Available columns:', ['pending', 'in_progress', 'completed']);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    console.log('DragEnd - active.id:', active.id, 'over.id:', over?.id);
    console.log('over.data:', over?.data);

    if (!over) {
      console.log('No drop target');
      return;
    }

    const taskId = Number(active.id);
    const validStatuses = ['pending', 'in_progress', 'completed'];
    
    // Verificar si over.id es directamente un estado de columna
    if (validStatuses.includes(over.id as string)) {
      const newStatus = over.id as TaskStatus;
      console.log('Moving task', taskId, 'to status', newStatus, 'based on column ID');
      handleColumnMove(taskId, newStatus);
      return;
    }

    // Verificar si over.id es un área vacía de columna (formato: "status-empty")
    const emptyAreaMatch = (over.id as string).match(/^(.+)-empty$/);
    if (emptyAreaMatch) {
      const columnStatus = emptyAreaMatch[1];
      if (validStatuses.includes(columnStatus)) {
        const newStatus = columnStatus as TaskStatus;
        console.log('Moving task', taskId, 'to status', newStatus, 'based on empty area');
        handleColumnMove(taskId, newStatus);
        return;
      }
    }

    // Si over.id es un ID de tarea, encontrar la columna padre
    const taskOver = tasks.find(t => t.id === Number(over.id));
    if (taskOver) {
      // Usar el estado de la tarea de destino para determinar la columna
      const targetStatus = taskOver.status as TaskStatus;
      if (targetStatus && validStatuses.includes(targetStatus)) {
        console.log('Moving task', taskId, 'to status', targetStatus, 'based on target task status');
        handleColumnMove(taskId, targetStatus);
      } else {
        console.log('Target task has invalid status:', targetStatus);
      }
    } else {
      console.log('No valid drop target found');
    }
  };

  const handleToggleComplete = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Llamar a la función de actualización primero
    await onToggleComplete(taskId);
    
    // Luego actualizar el estado local basado en el nuevo estado de completado
    updateTaskStatus(taskId, !task.completed);
  };

  // Función para manejar el cambio de estado sin afectar el completado
  const handleStatusChange = (taskId: number, newStatus: TaskStatus) => {
    setTaskStatuses(prev => ({
      ...prev,
      [taskId]: newStatus
    }));
  };

  // Función para actualizar el estado cuando las tareas cambian
  const updateTaskStatus = (taskId: number, isCompleted: boolean) => {
    setTaskStatuses(prev => {
      const currentStatus = prev[taskId];
      
      if (isCompleted) {
        // Si se marca como completada, mover a completed
        return { ...prev, [taskId]: 'completed' };
      } else {
        // Si se desmarca como completada, mover a pending
        return { ...prev, [taskId]: 'pending' };
      }
    });
  };

  // Función para manejar el movimiento de tareas entre columnas
  const handleColumnMove = (taskId: number, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    console.log('handleColumnMove called:', taskId, newStatus);

    // Actualizar el estado local inmediatamente
    setTaskStatuses(prev => ({
      ...prev,
      [taskId]: newStatus
    }));

    // Llamar a onTaskMove para todos los movimientos entre columnas
    onTaskMove(taskId, newStatus);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    const filteredTasks = tasks.filter(task => {
      const taskStatus = taskStatuses[task.id];
      
      if (status === 'completed') {
        // Solo mostrar tareas que estén marcadas como completadas
        return task.completed;
      } else if (status === 'pending') {
        // Mostrar tareas no completadas que estén en pending o sin estado asignado
        return !task.completed && (taskStatus === 'pending' || task.status === 'pending' || !taskStatus);
      } else if (status === 'in_progress') {
        // Mostrar tareas que estén explícitamente en in_progress
        return taskStatus === 'in_progress' || task.status === 'in_progress';
      }
      
      return false;
    });

    return filteredTasks;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            tasks={getTasksByStatus(column.id)}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="transform rotate-2 scale-105">
            <KanbanTask
              task={activeTask}
              onToggleComplete={handleToggleComplete}
              isDragging={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
} 
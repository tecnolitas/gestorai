'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useApiCache } from '@/hooks/useApiCache';
import { apiService } from '@/services/api';
import { Project, Task } from '@/types/api';
import { DashboardLayout } from '@/components/widgets/DashboardLayout';

export default function DashboardPage() {
  // Cache para proyectos (5 minutos)
  const { 
    data: projectsData, 
    loading: projectsLoading, 
    error: projectsError,
    refetch: refetchProjects 
  } = useApiCache('dashboard_projects', () => apiService.getProjects(), { ttl: 5 * 60 * 1000 });

  // Cache para tareas (3 minutos)
  const { 
    data: tasksData, 
    loading: tasksLoading, 
    error: tasksError,
    refetch: refetchTasks 
  } = useApiCache('dashboard_tasks', () => apiService.getTasks(), { ttl: 3 * 60 * 1000 });

  // Cache para estadísticas (2 minutos)
  const { 
    data: statsData, 
    loading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useApiCache('dashboard_stats', async () => {
    const [completedTasksResponse, pendingTasksResponse] = await Promise.all([
      apiService.getCompletedTasks(),
      apiService.getPendingTasks(),
    ]);
    
    return {
      completedTasks: completedTasksResponse.count || 0,
      pendingTasks: pendingTasksResponse.count || 0,
    };
  }, { ttl: 2 * 60 * 1000 });

  // Memoizar datos procesados
  const projects = useMemo(() => projectsData?.results || [], [projectsData]);
  const tasks = useMemo(() => tasksData?.results || [], [tasksData]);
  const stats = useMemo(() => ({
    totalProjects: projectsData?.count || 0,
    totalTasks: tasksData?.count || 0,
    completedTasks: statsData?.completedTasks || 0,
    pendingTasks: statsData?.pendingTasks || 0,
  }), [projectsData, tasksData, statsData]);

  const loading = projectsLoading || tasksLoading || statsLoading;

  const calculateStatsFromTasks = (taskList: Task[]) => {
    const completedTasks = taskList.filter(task => task.completed).length;
    const pendingTasks = taskList.filter(task => !task.completed).length;
    return { completedTasks, pendingTasks };
  };

  const handleToggleTaskComplete = async (taskId: number) => {
    try {
      console.log('🔄 Toggle task completion iniciado para taskId:', taskId);
      
      // Obtener la tarea actual para saber su estado antes del cambio
      const currentTask = tasks.find(task => task.id === taskId);
      const wasCompleted = currentTask?.completed || false;
      
      console.log('📊 Estado actual de la tarea:', { 
        taskId, 
        wasCompleted, 
        currentStats: stats 
      });

      // Realizar el toggle
      const updatedTask = await apiService.toggleTaskComplete(taskId);
      console.log('✅ Toggle completado, nueva tarea:', updatedTask);

      // Actualizar la lista de tareas
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      );
      
      // Actualizar estadísticas de forma optimizada
      setStats(prev => {
        const newCompletedTasks = wasCompleted 
          ? prev.completedTasks - 1 
          : prev.completedTasks + 1;
        const newPendingTasks = wasCompleted 
          ? prev.pendingTasks + 1 
          : prev.pendingTasks - 1;
        
        console.log('📈 Estadísticas actualizadas:', {
          completedTasks: newCompletedTasks,
          pendingTasks: newPendingTasks
        });
        
        return {
          ...prev,
          completedTasks: newCompletedTasks,
          pendingTasks: newPendingTasks,
        };
      });

      // Verificar con el servidor después de un breve delay
      setTimeout(async () => {
        try {
          console.log('🔍 Iniciando verificación del servidor...');
          
          const [completedTasksResponse, pendingTasksResponse] = await Promise.all([
            apiService.getCompletedTasks(),
            apiService.getPendingTasks(),
          ]);
          
          console.log('🔍 Respuestas completas del servidor:', {
            completedTasksResponse,
            pendingTasksResponse
          });
          
          console.log('🔍 Verificación del servidor:', {
            serverCompleted: completedTasksResponse.count,
            serverPending: pendingTasksResponse.count
          });
          
          // Solo actualizar si hay discrepancia
          setStats(prev => {
            if (prev.completedTasks !== completedTasksResponse.count || 
                prev.pendingTasks !== pendingTasksResponse.count) {
              console.log('⚠️ Discrepancia detectada, sincronizando con servidor');
              return {
                ...prev,
                completedTasks: completedTasksResponse.count || 0,
                pendingTasks: pendingTasksResponse.count || 0,
              };
            }
            return prev;
          });
        } catch (error) {
          console.error('❌ Error verificando estadísticas del servidor:', error);
          console.log('🔄 Usando cálculo local como fallback...');
          
          // Como fallback, recalcular desde las tareas locales
          setTasks(currentTasks => {
            const localStats = calculateStatsFromTasks(currentTasks);
            setStats(prev => ({
              ...prev,
              completedTasks: localStats.completedTasks,
              pendingTasks: localStats.pendingTasks,
            }));
            return currentTasks;
          });
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Error toggling task completion:', error);
      // Revertir el cambio en caso de error
      alert('Error al actualizar la tarea. Por favor, intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <Navigation />
        <main id="main-content" role="main" aria-label="Contenido principal del dashboard">
          <DashboardLayout
            stats={stats}
            projects={projects}
            tasks={tasks}
            onToggleTaskComplete={handleToggleTaskComplete}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
} 
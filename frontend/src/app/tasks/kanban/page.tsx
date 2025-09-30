'use client';

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/services/api';
import { Task, Project } from '@/types/api';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Button } from '@/components/ui/Button';
import { Plus, Filter, Search } from 'lucide-react';
import Link from 'next/link';

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksResponse, projectsResponse] = await Promise.all([
          apiService.getTasks(),
          apiService.getProjects(),
        ]);

        setTasks(tasksResponse.results || []);
        setProjects(projectsResponse.results || []);
      } catch (error) {
        console.error('Error fetching kanban data:', error);
        setTasks([]);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleComplete = async (taskId: number) => {
    try {
      const updatedTask = await apiService.toggleTaskComplete(taskId);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      );
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleTaskMove = async (taskId: number, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }

      console.log('handleTaskMove called:', { taskId, newStatus, currentTask: task });

      // Actualizar el estado local inmediatamente para mejor UX
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId ? { 
            ...t, 
            status: newStatus,
            completed: newStatus === 'completed'
          } : t
        )
      );

      // Actualizar en el backend usando updateTask
      const updateData: Partial<Task> = {
        status: newStatus,
        completed: newStatus === 'completed'
      };

      console.log('Sending update to backend:', { taskId, updateData });

      const updatedTask = await apiService.updateTask(taskId, updateData);
      console.log('Backend response:', updatedTask);
      console.log(`Task ${taskId} moved to ${newStatus} and saved to backend`);
      
    } catch (error) {
      console.error('Error moving task:', error);
      // Revertir el cambio local si hay error
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId ? task : t
        )
      );
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesProject = selectedProject === 'all' || 
      task.project?.id?.toString() === selectedProject;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesProject && matchesSearch;
  });

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
        
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  Vista Kanban
                </h1>
                <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
                  Organiza tus tareas con drag & drop
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link href="/tasks/new">
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Nueva Tarea</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                  <input
                    type="text"
                    placeholder="Buscar tareas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                    style={{
                      backgroundColor: 'var(--input)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                  />
                </div>
              </div>

              {/* Project Filter */}
              <div className="sm:w-64">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  style={{
                    backgroundColor: 'var(--input)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  <option value="all">Todos los proyectos</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id.toString()}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <KanbanBoard
            tasks={filteredTasks}
            onToggleComplete={handleToggleComplete}
            onTaskMove={handleTaskMove}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
} 
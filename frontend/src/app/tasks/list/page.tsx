'use client';

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/services/api';
import { Task, Project } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Plus, Search, Filter, Calendar, User, FolderOpen, CheckCircle, Circle } from 'lucide-react';
import Link from 'next/link';

export default function ListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
        console.error('Error fetching list data:', error);
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

  const filteredTasks = tasks.filter(task => {
    const matchesProject = selectedProject === 'all' || 
      task.project?.id?.toString() === selectedProject;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesProject && matchesSearch;
  });

  // Ordenar tareas
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        break;
      case 'due_date':
        aValue = a.due_date ? new Date(a.due_date).getTime() : 0;
        bValue = b.due_date ? new Date(b.due_date).getTime() : 0;
        break;
      case 'completed':
        aValue = a.completed ? 1 : 0;
        bValue = b.completed ? 1 : 0;
        break;
      default:
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Agrupar tareas por proyecto
  const groupedTasks = sortedTasks.reduce((groups, task) => {
    const projectName = task.project?.name || 'Sin proyecto';
    if (!groups[projectName]) {
      groups[projectName] = [];
    }
    groups[projectName].push(task);
    return groups;
  }, {} as Record<string, Task[]>);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
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
        
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  Vista Lista
                </h1>
                <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
                  Tareas organizadas por proyecto
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

          {/* Filters and Sort */}
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
            <div className="flex flex-col lg:flex-row gap-4">
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

              {/* Sort */}
              <div className="sm:w-48">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                  style={{
                    backgroundColor: 'var(--input)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  <option value="created_at-desc">Más recientes</option>
                  <option value="created_at-asc">Más antiguas</option>
                  <option value="title-asc">Título A-Z</option>
                  <option value="title-desc">Título Z-A</option>
                  <option value="priority-desc">Prioridad Alta-Baja</option>
                  <option value="priority-asc">Prioridad Baja-Alta</option>
                  <option value="due_date-asc">Fecha límite próxima</option>
                  <option value="due_date-desc">Fecha límite lejana</option>
                  <option value="completed-asc">Pendientes primero</option>
                  <option value="completed-desc">Completadas primero</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-6">
            {Object.keys(groupedTasks).length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: 'var(--muted-foreground)' }}>
                  No se encontraron tareas con los filtros aplicados
                </p>
              </div>
            ) : (
              Object.entries(groupedTasks).map(([projectName, projectTasks]) => (
                <div key={projectName} className="rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
                  {/* Project Header */}
                  <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
                      <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                        {projectName}
                      </h2>
                      <span className="px-2 py-1 text-sm rounded-full" style={{ 
                        backgroundColor: 'var(--muted)', 
                        color: 'var(--muted-foreground)' 
                      }}>
                        {(projectTasks as Task[]).length} tarea{(projectTasks as Task[]).length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {(projectTasks as Task[]).map((task: Task) => (
                      <div key={task.id} className="p-4 hover:bg-opacity-50 transition-colors" style={{ backgroundColor: 'var(--card)' }}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleToggleComplete(task.id)}
                                className="flex-shrink-0"
                              >
                                {task.completed ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Circle className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
                                )}
                              </button>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className={`text-lg font-medium ${task.completed ? 'line-through' : ''}`} style={{ color: 'var(--foreground)' }}>
                                  {task.title}
                                </h3>
                                <p className="mt-1 text-sm line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
                                  {task.description}
                                </p>
                                
                                <div className="mt-2 flex items-center space-x-4 text-sm">
                                  <div className="flex items-center space-x-1">
                                    <User className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                                    <span style={{ color: 'var(--muted-foreground)' }}>
                                      {task.assignee?.first_name || task.assignee?.username || 'Sin asignar'}
                                    </span>
                                  </div>
                                  
                                  {task.due_date && (
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                                      <span style={{ color: 'var(--muted-foreground)' }}>
                                        {new Date(task.due_date).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 ml-4">
                            <PriorityBadge priority={task.priority} />
                            
                            <div className="flex items-center space-x-2">
                              <Link href={`/tasks/${task.id}`}>
                                <Button variant="secondary" size="sm">
                                  Ver
                                </Button>
                              </Link>
                              <Link href={`/tasks/${task.id}/edit`}>
                                <Button variant="secondary" size="sm">
                                  Editar
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
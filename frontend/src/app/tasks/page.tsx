'use client';

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { useAutoRedirect } from '@/hooks/useAutoRedirect';
import { useDebounce } from '@/hooks/useDebounce';
import { apiService } from '@/services/api';
import { Task, Project, User } from '@/types/api';

// Lazy loading de vistas pesadas
const KanbanView = lazy(() => import('./kanban/page').then(module => ({ default: module.default })));
const CalendarView = lazy(() => import('./calendar/page').then(module => ({ default: module.default })));
const ListView = lazy(() => import('./list/page').then(module => ({ default: module.default })));
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  User,
  FolderOpen,
  CheckCircle,
  Circle,
  ArrowUpDown,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  Eye
} from 'lucide-react';
import Link from 'next/link';

const VIEW_STORAGE_KEY = 'task-view-preference';

export default function TasksPage() {
  const router = useRouter();
  useAutoRedirect(); // Aplicar redirección automática
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    project: 'all',
    assignee: 'all'
  });

  // Debounce para la búsqueda (300ms de delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {

    const fetchData = async () => {
      try {
        const [tasksResponse, projectsResponse] = await Promise.all([
          apiService.getTasks(),
          apiService.getProjects()
        ]);
        
        setTasks(tasksResponse.results || []);
        setProjects(projectsResponse.results || []);
        
        // Extraer usuarios únicos de las tareas
        const uniqueUsers = Array.from(
          new Map(
            tasksResponse.results
              ?.filter(task => task.assignee) // Filtrar tareas sin asignado
              .map(task => [task.assignee.id, task.assignee]) || []
          ).values()
        );
        setUsers(uniqueUsers);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
        setProjects([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleComplete = async (taskId: number) => {
    try {
      const updatedTask = await apiService.toggleTaskComplete(taskId);
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await apiService.deleteTask(taskId);
        setTasks(tasks.filter(task => task.id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'completed' && task.completed) ||
                         (filters.status === 'pending' && !task.completed);
    
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    const matchesProject = filters.project === 'all' || 
                          (task.project && task.project.id.toString() === filters.project) ||
                          (filters.project === 'unassigned' && !task.project);
    const matchesAssignee = filters.assignee === 'all' || 
                           (task.assignee && task.assignee.id.toString() === filters.assignee) ||
                           (filters.assignee === 'unassigned' && !task.assignee);

    return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesAssignee;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue: string | number | Date | null = a[sortBy as keyof Task] as string | number | Date | null;
    let bValue: string | number | Date | null = b[sortBy as keyof Task] as string | number | Date | null;

    if (sortBy === 'project') {
      aValue = a.project ? a.project.name : 'Sin proyecto';
      bValue = b.project ? b.project.name : 'Sin proyecto';
    } else if (sortBy === 'assignee') {
      aValue = a.assignee ? (a.assignee.first_name || a.assignee.username) : 'Sin asignar';
      bValue = b.assignee ? (b.assignee.first_name || b.assignee.username) : 'Sin asignar';
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue && bValue) {
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
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
        
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Tareas</h1>
                <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>Gestiona todas tus tareas y proyectos</p>
              </div>
              <Link href="/tasks/new">
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Nueva Tarea</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="px-4 sm:px-0 mb-6">
            <div className="shadow rounded-lg p-6" style={{ backgroundColor: 'var(--card)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Búsqueda */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                    <Input
                      type="text"
                      placeholder="Buscar tareas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtro de Estado */}
                <div>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    style={{ 
                      borderColor: 'var(--border)', 
                      color: 'var(--foreground)', 
                      backgroundColor: 'var(--input)' 
                    }}
                  >
                    <option value="all" style={{ color: 'var(--foreground)', backgroundColor: 'var(--input)' }}>Todos los estados</option>
                    <option value="pending" style={{ color: 'var(--foreground)', backgroundColor: 'var(--input)' }}>Pendientes</option>
                    <option value="completed" style={{ color: 'var(--foreground)', backgroundColor: 'var(--input)' }}>Completadas</option>
                  </select>
                </div>

                {/* Filtro de Prioridad */}
                <div>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    style={{ 
                      borderColor: 'var(--border)', 
                      color: 'var(--foreground)', 
                      backgroundColor: 'var(--input)' 
                    }}
                  >
                    <option value="all" style={{ color: 'var(--foreground)', backgroundColor: 'var(--input)' }}>Todas las prioridades</option>
                    <option value="high" style={{ color: 'var(--foreground)', backgroundColor: 'var(--input)' }}>Alta</option>
                    <option value="medium" style={{ color: 'var(--foreground)', backgroundColor: 'var(--input)' }}>Media</option>
                    <option value="low" style={{ color: 'var(--foreground)', backgroundColor: 'var(--input)' }}>Baja</option>
                  </select>
                </div>

                {/* Filtro de Proyecto */}
                <div>
                  <select
                    value={filters.project}
                    onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                    className="block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    style={{ 
                      borderColor: 'var(--border)', 
                      color: 'var(--foreground)', 
                      backgroundColor: 'var(--input)' 
                    }}
                  >
                    <option value="all" style={{ color: 'var(--foreground)', backgroundColor: 'var(--input)' }}>Todos los proyectos</option>
                    <option value="unassigned" style={{ color: 'var(--foreground)', backgroundColor: 'var(--input)' }}>Sin proyecto</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id} style={{ color: 'var(--foreground)', backgroundColor: 'var(--input)' }}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                                {/* Filtro de Asignado */}
                <div>
                  <select
                    value={filters.assignee}
                    onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                    className="block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    style={{ 
                      borderColor: 'var(--border)', 
                      color: 'var(--foreground)', 
                      backgroundColor: 'var(--input)' 
                    }}
                  >
                    <option value="all" style={{ color: 'var(--foreground)', backgroundColor: 'var(--input)' }}>Todos los usuarios</option>
                    <option value="unassigned" style={{ color: 'var(--foreground)', backgroundColor: 'var(--input)' }}>Sin asignar</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id} style={{ color: 'var(--foreground)', backgroundColor: 'var(--input)' }}>
                        {user.first_name || user.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Tareas */}
          <div className="px-4 sm:px-0">
            <div className="shadow rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--card)' }}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
                  <thead style={{ backgroundColor: 'var(--muted)' }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                        Estado
                      </th>
                                              <th 
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                          style={{ color: 'var(--muted-foreground)' }}
                          onClick={() => handleSort('title')}
                        >
                        <div className="flex items-center space-x-1">
                          <span>Título</span>
                          {sortBy === 'title' && (
                            sortOrder === 'asc' ? <ArrowUpDown className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4 rotate-180" />
                          )}
                        </div>
                      </th>
                                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                          Descripción
                        </th>
                                                 <th 
                           className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                           style={{ color: 'var(--muted-foreground)' }}
                           onClick={() => handleSort('priority')}
                         >
                           <div className="flex items-center space-x-1">
                             <span>Prioridad</span>
                             {sortBy === 'priority' && (
                               sortOrder === 'asc' ? <ArrowUpDown className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4 rotate-180" />
                             )}
                           </div>
                         </th>
                         <th 
                           className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                           style={{ color: 'var(--muted-foreground)' }}
                           onClick={() => handleSort('project')}
                         >
                           <div className="flex items-center space-x-1">
                             <span>Proyecto</span>
                             {sortBy === 'project' && (
                               sortOrder === 'asc' ? <ArrowUpDown className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4 rotate-180" />
                             )}
                           </div>
                         </th>
                         <th 
                           className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                           style={{ color: 'var(--muted-foreground)' }}
                           onClick={() => handleSort('assignee')}
                         >
                           <div className="flex items-center space-x-1">
                             <span>Asignado</span>
                             {sortBy === 'assignee' && (
                               sortOrder === 'asc' ? <ArrowUpDown className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4 rotate-180" />
                             )}
                           </div>
                         </th>
                         <th 
                           className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                           style={{ color: 'var(--muted-foreground)' }}
                           onClick={() => handleSort('due_date')}
                         >
                          <div className="flex items-center space-x-1">
                            <span>Fecha límite</span>
                            {sortBy === 'due_date' && (
                              sortOrder === 'asc' ? <ArrowUpDown className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4 rotate-180" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                          Acciones
                        </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    {sortedTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700" style={{ backgroundColor: 'var(--card)' }}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleComplete(task.id)}
                            className="hover:text-gray-600"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            {task.completed ? (
                              <CheckSquare className="h-5 w-5 text-green-600" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>
                            {task.completed ? (
                              <span className="line-through" style={{ color: 'var(--muted-foreground)' }}>{task.title}</span>
                            ) : (
                              task.title
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm max-w-xs truncate" style={{ color: 'var(--card-foreground)' }}>
                            {task.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PriorityBadge priority={task.priority} />
                        </td>
                                                                         <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: 'var(--card-foreground)' }}>{task.project ? task.project.name : 'Sin proyecto'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: 'var(--card-foreground)' }}>
                            {task.assignee ? (task.assignee.first_name || task.assignee.username) : 'Sin asignar'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: 'var(--card-foreground)' }}>
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link href={`/tasks/${task.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/tasks/${task.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                                                         <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleDeleteTask(task.id)}
                               className="hover:text-red-800"
                               style={{ color: 'var(--destructive)' }}
                             >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {sortedTasks.length === 0 && (
                <div className="text-center py-12">
                  <div style={{ color: 'var(--muted-foreground)' }}>
                    {searchTerm || Object.values(filters).some(f => f !== 'all') 
                      ? 'No se encontraron tareas con los filtros aplicados'
                      : 'No hay tareas creadas aún'
                    }
                  </div>
                  {searchTerm || Object.values(filters).some(f => f !== 'all') && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearchTerm('');
                        setFilters({
                          status: 'all',
                          priority: 'all',
                          project: 'all',
                          assignee: 'all'
                        });
                      }}
                      className="mt-2"
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
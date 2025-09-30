'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Project, User } from '@/types/api';
import { 
  ArrowLeft, 
  Save,
  X
} from 'lucide-react';
import Link from 'next/link';

const taskSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'El título no puede tener más de 200 caracteres'),
  description: z.string().min(1, 'La descripción es requerida').max(1000, 'La descripción no puede tener más de 1000 caracteres'),
  priority: z.enum(['low', 'medium', 'high']),
  project_id: z.string().optional(),
  assignee_id: z.string().optional(),
  due_date: z.string().optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

export default function NewTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, usersResponse] = await Promise.all([
          apiService.getProjects(),
          apiService.getCurrentUser().then(() => apiService.getTasks()) // Para obtener usuarios de tareas existentes
        ]);
        
        setProjects(projectsResponse.results || []);
        
        // Extraer usuarios únicos de las tareas existentes
        const uniqueUsers = Array.from(
          new Map(
            usersResponse.results
              ?.filter(task => task.assignee)
              .map(task => [task.assignee.id, task.assignee]) || []
          ).values()
        );
        setUsers(uniqueUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: TaskForm) => {
    setLoading(true);
    setError('');
    
    try {
      const taskData = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        project_id: data.project_id ? parseInt(data.project_id) : undefined,
        assignee_id: data.assignee_id ? parseInt(data.assignee_id) : undefined,
        due_date: data.due_date || undefined,
      };

      const newTask = await apiService.createTask(taskData);
      router.push(`/tasks/${newTask.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al crear la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm('¿Estás seguro de que quieres cancelar? Los cambios no se guardarán.')) {
      router.push('/tasks');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver</span>
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Nueva Tarea</h1>
                  <p className="mt-2 text-gray-600">Crea una nueva tarea para organizar tu trabajo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-4 sm:px-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Información de la Tarea</h2>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <Input
                    label="Título de la Tarea"
                    type="text"
                    placeholder="Ej: Implementar funcionalidad de login"
                    {...register('title')}
                    error={errors.title?.message}
                  />
                </div>

                <div>
                  <Textarea
                    label="Descripción"
                    placeholder="Describe los detalles de la tarea..."
                    rows={4}
                    {...register('description')}
                    error={errors.description?.message}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridad
                    </label>
                    <select
                      {...register('priority')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                    {errors.priority && (
                      <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Límite
                    </label>
                    <Input
                      type="datetime-local"
                      {...register('due_date')}
                      error={errors.due_date?.message}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proyecto
                    </label>
                    <select
                      {...register('project_id')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Sin proyecto</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    {errors.project_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.project_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asignar a
                    </label>
                    <select
                      {...register('assignee_id')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Sin asignar</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.first_name || user.username}
                        </option>
                      ))}
                    </select>
                    {errors.assignee_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.assignee_id.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancelar</span>
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Crear Tarea</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
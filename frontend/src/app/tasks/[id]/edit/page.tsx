'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Task, Project, User } from '@/types/api';
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
  completed: z.boolean(),
});

type TaskForm = z.infer<typeof taskSchema>;

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params.id);
  
  const [task, setTask] = useState<Task | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');


  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!taskId) return;
      
      try {
        const [taskData, projectsResponse, usersResponse] = await Promise.all([
          apiService.getTask(taskId),
          apiService.getProjects(),
          apiService.getTasks() // Para obtener usuarios de tareas existentes
        ]);
        
        setTask(taskData);
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

        // Pre-llenar el formulario
        reset({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          project_id: taskData.project?.id?.toString() || '',
          assignee_id: taskData.assignee?.id?.toString() || '',
          due_date: taskData.due_date ? new Date(taskData.due_date).toISOString().slice(0, 16) : '',
          completed: taskData.completed,
        });
      } catch (error) {
        console.error('Error fetching task data:', error);
        router.push('/tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, router, reset]);



  const onSubmit = async (data: TaskForm) => {
    if (!task) return;
    
    console.log('=== INICIO DE ONSUBMIT ===');
    setSaving(true);
    setError('');
    
    try {
      console.log('Preparando datos...');
      const taskData = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        project_id: data.project_id ? parseInt(data.project_id) : undefined,
        assignee_id: data.assignee_id ? parseInt(data.assignee_id) : undefined,
        due_date: data.due_date || undefined,
        completed: data.completed,
      };

      console.log('Datos a enviar:', taskData);
      console.log('Llamando a apiService.updateTask...');
      
      const updatedTask = await apiService.updateTask(task.id, taskData);
      
      console.log('Tarea actualizada exitosamente:', updatedTask);
      console.log('Intentando navegar...');
      
      // Navegar inmediatamente después de la actualización exitosa
      // Usar location.replace para forzar la navegación
      location.replace(`/tasks/${updatedTask.id}`);
      
      console.log('Navegación iniciada');
      
    } catch (err: unknown) {
      console.error('Error al actualizar tarea:', err);
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Error al actualizar la tarea';
      setError(errorMessage);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('¿Estás seguro de que quieres cancelar? Los cambios no se guardarán.')) {
      router.push(`/tasks/${taskId}`);
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

  if (!task) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tarea no encontrada</h2>
            <Link href="/tasks">
              <Button>Volver a Tareas</Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href={`/tasks/${taskId}`}>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver</span>
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Editar Tarea</h1>
                  <p className="mt-2 text-gray-600">Modifica los detalles de la tarea</p>
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
                     <p className="text-sm text-red-600 mb-3">{error}</p>
                     <div className="flex space-x-2">
                       <Button
                         type="button"
                         variant="secondary"
                         size="sm"
                         onClick={() => setError('')}
                       >
                         Intentar de nuevo
                       </Button>
                       <Button
                         type="button"
                         variant="ghost"
                         size="sm"
                         onClick={() => window.location.href = `/tasks/${taskId}`}
                       >
                         Volver a la tarea
                       </Button>
                     </div>
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

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('completed')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Marcar como completada</span>
                  </label>
                  {errors.completed && (
                    <p className="mt-1 text-sm text-red-600">{errors.completed.message}</p>
                  )}
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
                     loading={saving}
                     disabled={saving}
                     className="flex items-center space-x-2"
                   >
                     <Save className="h-4 w-4" />
                     <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
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
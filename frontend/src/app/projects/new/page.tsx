'use client';

import React, { useState } from 'react';
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
import { 
  ArrowLeft, 
  Save,
  X
} from 'lucide-react';
import Link from 'next/link';

const projectSchema = z.object({
  name: z.string().min(1, 'El nombre del proyecto es requerido').max(100, 'El nombre no puede tener más de 100 caracteres'),
  description: z.string().min(1, 'La descripción es requerida').max(500, 'La descripción no puede tener más de 500 caracteres'),
});

type ProjectForm = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    // reset,
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = async (data: ProjectForm) => {
    setLoading(true);
    setError('');
    
    try {
      const newProject = await apiService.createProject(data);
      router.push(`/projects/${newProject.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al crear el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm('¿Estás seguro de que quieres cancelar? Los cambios no se guardarán.')) {
      router.push('/projects');
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
                <Link href="/projects">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver</span>
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Nuevo Proyecto</h1>
                  <p className="mt-2 text-gray-600">Crea un nuevo proyecto para organizar tus tareas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-4 sm:px-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Información del Proyecto</h2>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <Input
                    label="Nombre del Proyecto"
                    type="text"
                    placeholder="Ej: Desarrollo de Aplicación Web"
                    {...register('name')}
                    error={errors.name?.message}
                  />
                </div>

                <div>
                  <Textarea
                    label="Descripción"
                    placeholder="Describe el propósito y objetivos del proyecto..."
                    rows={4}
                    {...register('description')}
                    error={errors.description?.message}
                  />
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
                    <span>Crear Proyecto</span>
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
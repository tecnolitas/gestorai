'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/services/api';
import { Project, Task } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { 
  FolderOpen, 
  CheckSquare, 
  Edit, 
  Trash2, 
  Plus, 
  Calendar,
  User,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const [projectData, tasksData] = await Promise.all([
          apiService.getProject(projectId),
          apiService.getTasks()
        ]);
        
        setProject(projectData);
        setEditForm({
          name: projectData.name,
          description: projectData.description
        });
        
                 // Filtrar tareas que pertenecen a este proyecto
         const projectTasks = tasksData.results.filter(task => task.project?.id === projectId);
        setTasks(projectTasks);
      } catch (error) {
        console.error('Error fetching project data:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, router]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: project?.name || '',
      description: project?.description || ''
    });
    setEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!project) return;
    
    try {
      const updatedProject = await apiService.updateProject(project.id, editForm);
      setProject(updatedProject);
      setEditing(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDelete = async () => {
    if (!project || !confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setDeleting(true);
    try {
      await apiService.deleteProject(project.id);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting project:', error);
      setDeleting(false);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      const updatedTask = await apiService.toggleTaskComplete(taskId);
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error toggling task:', error);
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

  if (!project) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Proyecto no encontrado</h2>
            <Link href="/dashboard">
              <Button>Volver al Dashboard</Button>
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
        
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver</span>
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {editing ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="text-3xl font-bold"
                      />
                    ) : (
                      project.name
                    )}
                  </h1>
                  <p className="mt-2 text-gray-600">
                    {editing ? (
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="mt-2"
                        rows={3}
                      />
                    ) : (
                      project.description
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {editing ? (
                  <>
                    <Button onClick={handleSaveEdit} className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Guardar</span>
                    </Button>
                    <Button variant="secondary" onClick={handleCancelEdit} className="flex items-center space-x-2">
                      <X className="h-4 w-4" />
                      <span>Cancelar</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleEdit} className="flex items-center space-x-2">
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={handleDelete}
                      loading={deleting}
                      className="flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Eliminar</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="px-4 sm:px-0 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <FolderOpen className="h-6 w-6 text-blue-600" />
                                     <div>
                     <p className="text-sm font-medium text-gray-500">Propietario</p>
                     <p className="text-sm text-gray-900">{project.owner?.first_name || project.owner?.username || 'Sin propietario'}</p>
                   </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Creado</p>
                    <p className="text-sm text-gray-900">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckSquare className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tareas</p>
                    <p className="text-sm text-gray-900">{tasks.length} tareas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="px-4 sm:px-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Tareas del Proyecto</h3>
                <Link href={`/tasks/new?project=${project.id}`}>
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Nueva Tarea</span>
                  </Button>
                </Link>
              </div>
              
              <div className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <div key={task.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(task.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <h4 className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {task.assignee?.first_name || task.assignee?.username || 'Sin asignar'}
                          </span>
                        </div>
                        {task.due_date && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <Link href={`/tasks/${task.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="px-6 py-8 text-center">
                    <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tareas</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Comienza creando la primera tarea para este proyecto.
                    </p>
                    <div className="mt-6">
                      <Link href={`/tasks/new?project=${project.id}`}>
                        <Button className="flex items-center space-x-2">
                          <Plus className="h-4 w-4" />
                          <span>Nueva Tarea</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
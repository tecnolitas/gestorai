'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { apiService } from '@/services/api';
import { Task, Comment, TaskHistory } from '@/types/api';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckSquare, 
  Square,
  MessageSquare,
  Clock,
  User,
  Calendar,
  FolderOpen
} from 'lucide-react';
import Link from 'next/link';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params.id);
  
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');

  useEffect(() => {
    const fetchTaskData = async () => {
      if (!taskId) return;
      
      try {
        const [taskData, commentsData, historyData] = await Promise.all([
          apiService.getTask(taskId),
          apiService.getTaskComments(taskId),
          apiService.getTaskHistory(taskId)
        ]);
        
        setTask(taskData);
        setComments(Array.isArray(commentsData) ? commentsData : []);
        setHistory(Array.isArray(historyData) ? historyData : []);
      } catch (error) {
        console.error('Error fetching task data:', error);
        router.push('/tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
  }, [taskId, router]);

  const handleToggleComplete = async () => {
    if (!task) return;
    
    try {
      const updatedTask = await apiService.toggleTaskComplete(task.id);
      setTask(updatedTask);
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await apiService.deleteTask(task.id);
        router.push('/tasks');
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;

    setSubmittingComment(true);
    try {
      const comment = await apiService.createComment(task.id, newComment);
      setComments([comment, ...(Array.isArray(comments) ? comments : [])]);
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
                  <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <PriorityBadge priority={task.priority} />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.completed ? 'Completada' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleComplete}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {task.completed ? (
                    <CheckSquare className="h-6 w-6 text-green-600" />
                  ) : (
                    <Square className="h-6 w-6" />
                  )}
                </button>
                <Link href={`/tasks/${task.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteTask}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 sm:px-0 mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Detalles
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                    activeTab === 'comments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Comentarios ({Array.isArray(comments) ? comments.length : 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>Historial ({Array.isArray(history) ? history.length : 0})</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-0">
            {activeTab === 'details' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Información de la Tarea</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Descripción</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Proyecto</h3>
                      <div className="flex items-center space-x-2">
                        <FolderOpen className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {task.project ? task.project.name : 'Sin proyecto'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Asignado a</h3>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {task.assignee ? (task.assignee.first_name || task.assignee.username) : 'Sin asignar'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Fecha límite</h3>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {task.due_date ? formatDate(task.due_date) : 'Sin fecha límite'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Fecha de creación</h3>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{formatDate(task.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Comentarios</h2>
                </div>
                
                {/* Formulario de nuevo comentario */}
                <div className="p-6 border-b border-gray-200">
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <Textarea
                      label="Nuevo comentario"
                      placeholder="Escribe un comentario..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        loading={submittingComment}
                        disabled={!newComment.trim()}
                      >
                        Agregar Comentario
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Lista de comentarios */}
                <div className="p-6">
                  {!Array.isArray(comments) || comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay comentarios aún</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {comment.user.first_name || comment.user.username}
                                </p>
                                <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 ml-11">
                            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Historial de Cambios</h2>
                </div>
                
                <div className="p-6">
                  {!Array.isArray(history) || history.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay historial de cambios</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((change) => (
                        <div key={change.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {change.user.first_name || change.user.username}
                                </p>
                                <p className="text-xs text-gray-500">{formatDate(change.changed_at)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 ml-11">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Campo:</span> {change.field_name}
                            </p>
                            {change.old_value && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Valor anterior:</span> {change.old_value}
                              </p>
                            )}
                            {change.new_value && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Nuevo valor:</span> {change.new_value}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
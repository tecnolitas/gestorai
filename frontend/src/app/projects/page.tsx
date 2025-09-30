'use client';

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAutoRedirect } from '@/hooks/useAutoRedirect';
import { useAppSettingsContext } from '@/contexts/AppSettingsContext';
import { useDebounce } from '@/hooks/useDebounce';
import { usePaginatedProjects } from '@/hooks/usePaginatedProjects';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { apiService } from '@/services/api';
import { Project } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

// Lazy loading de componentes pesados
const ProjectGrid = lazy(() => import('./components/ProjectGrid').then(module => ({ default: module.ProjectGrid })));
const ProjectList = lazy(() => import('./components/ProjectList').then(module => ({ default: module.ProjectList })));
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Calendar,
  User,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
  useAutoRedirect(); // Aplicar redirección automática
  const { settings, isLoaded } = useAppSettingsContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');

  // Debounce para la búsqueda (300ms de delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Paginación de proyectos con lazy loading
  const {
    projects,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh
  } = usePaginatedProjects({ pageSize: 9, initialLoad: 9 });

  // Infinite scroll
  const { sentinelRef } = useInfiniteScroll(loadMore, hasMore, loadingMore);

  // Detectar vista desde URL o configuración por defecto
  useEffect(() => {
    if (!isLoaded) return;

    // Obtener parámetro de vista de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view') as 'grid' | 'list' | null;
    
    if (viewParam) {
      setCurrentView(viewParam);
    } else {
      // Usar configuración por defecto si no hay parámetro en URL
      setCurrentView(settings.defaultView.projects);
    }
  }, [isLoaded, settings.defaultView.projects]);

  const handleDelete = async (projectId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingId(projectId);
    try {
      await apiService.deleteProject(projectId);
      // Refrescar la lista después de eliminar
      refresh();
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Proyectos</h1>
                <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>Gestiona todos tus proyectos</p>
              </div>
              <Link href="/projects/new">
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Nuevo Proyecto</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 sm:px-0 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <Input
                type="text"
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Projects Grid */}
              <div className="px-4 sm:px-0">
                {filteredProjects.length > 0 ? (
                  <Suspense fallback={
                    <div className="px-4 sm:px-0">
                      <div className="mb-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                      </div>
                      <SkeletonLoader type={currentView === 'list' ? 'list' : 'grid'} count={6} />
                    </div>
                  }>
                    {currentView === 'list' ? (
                      <ProjectList 
                        projects={filteredProjects} 
                        onDelete={handleDelete} 
                        deletingId={deletingId} 
                      />
                    ) : (
                      <ProjectGrid 
                        projects={filteredProjects} 
                        onDelete={handleDelete} 
                        deletingId={deletingId} 
                      />
                    )}
                    
                    {/* Infinite Scroll Sentinel */}
                    {hasMore && (
                      <div ref={sentinelRef} className="py-8">
                        {loadingMore ? (
                          <div className="flex items-center justify-center">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                Cargando más proyectos...
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                              Desplázate hacia abajo para cargar más proyectos
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Indicador de fin de lista */}
                    {!hasMore && projects.length > 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          Has visto todos los proyectos ({projects.length} total)
                        </p>
                      </div>
                    )}
                  </Suspense>
                ) : (
              <div className="text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12" style={{ color: 'var(--muted-foreground)' }} />
                <h3 className="mt-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  {searchTerm ? 'No se encontraron proyectos' : 'No hay proyectos'}
                </h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {searchTerm 
                    ? 'Intenta con otros términos de búsqueda.'
                    : 'Comienza creando tu primer proyecto.'
                  }
                </p>
                {!searchTerm && (
                  <div className="mt-6">
                    <Link href="/projects/new">
                      <Button className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Crear Proyecto</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
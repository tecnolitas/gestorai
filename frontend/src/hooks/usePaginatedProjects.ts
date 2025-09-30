import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types/api';
import { apiService } from '@/services/api';

interface UsePaginatedProjectsOptions {
  pageSize?: number; // Número de proyectos por página
  initialLoad?: number; // Número de proyectos en la carga inicial
}

/**
 * Hook para manejar la paginación de proyectos con lazy loading
 * Carga proyectos en lotes para mejorar la performance
 */
export function usePaginatedProjects(options: UsePaginatedProjectsOptions = {}) {
  const { pageSize = 9, initialLoad = 9 } = options;
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadProjects = useCallback(async (page: number, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      // Simular delay para mostrar el lazy loading
      await new Promise(resolve => setTimeout(resolve, 800));

      const response = await apiService.api.get(`http://localhost:8000/api/projects/?page=${page}&page_size=${pageSize}`);
      const data = response.data;

      if (isInitial) {
        setProjects(data.results || []);
      } else {
        setProjects(prev => [...prev, ...(data.results || [])]);
      }

      // Verificar si hay más páginas
      setHasMore(!!data.next);
      setCurrentPage(page);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al cargar proyectos');
      setError(error);
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pageSize]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadProjects(currentPage + 1, false);
    }
  }, [loadProjects, currentPage, loadingMore, hasMore]);

  const refresh = useCallback(() => {
    setProjects([]);
    setCurrentPage(1);
    setHasMore(true);
    loadProjects(1, true);
  }, [loadProjects]);

  // Cargar proyectos iniciales
  useEffect(() => {
    loadProjects(1, true);
  }, [loadProjects]);

  return {
    projects,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    currentPage,
  };
}

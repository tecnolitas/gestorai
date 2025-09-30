import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number; // Porcentaje de visibilidad (0-1) para activar la carga
  rootMargin?: string; // Margen del root para la intersección
  enabled?: boolean; // Si el infinite scroll está habilitado
}

/**
 * Hook para implementar infinite scroll (carga infinita)
 * Detecta cuando el usuario llega al final de la lista y carga más contenido
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  hasMore: boolean,
  loading: boolean,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 0.1, rootMargin = '100px', enabled = true } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    setIsIntersecting(entry.isIntersecting);
    
    if (entry.isIntersecting && hasMore && !loading && enabled) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, loading, enabled]);

  useEffect(() => {
    if (!enabled) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold, rootMargin, enabled]);

  const setSentinelRef = useCallback((node: HTMLDivElement | null) => {
    sentinelRef.current = node;
    if (observerRef.current && node) {
      observerRef.current.observe(node);
    }
  }, []);

  return {
    sentinelRef: setSentinelRef,
    isIntersecting,
  };
}

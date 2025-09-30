import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface UseApiCacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  enabled?: boolean; // Whether caching is enabled
}

/**
 * Hook personalizado para cache de datos de API
 * Evita re-fetch innecesarios y mejora la performance
 */
export function useApiCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: UseApiCacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, enabled = true } = options; // 5 minutos por defecto
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initializedRef = useRef(false);

  const isExpired = useCallback((entry: CacheEntry<T>) => {
    return Date.now() - entry.timestamp > entry.ttl;
  }, []);

  const getCachedData = useCallback((): T | null => {
    if (!enabled) return null;
    
    try {
      const cached = localStorage.getItem(`api_cache_${key}`);
      if (!cached) return null;
      
      const entry: CacheEntry<T> = JSON.parse(cached);
      
      if (isExpired(entry)) {
        localStorage.removeItem(`api_cache_${key}`);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.warn('Error reading from cache:', error);
      return null;
    }
  }, [key, enabled, isExpired]);

  const setCachedData = useCallback((newData: T) => {
    if (!enabled) return;
    
    try {
      const entry: CacheEntry<T> = {
        data: newData,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(`api_cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Error writing to cache:', error);
    }
  }, [key, enabled, ttl]);

  const fetchData = useCallback(async (force = false) => {
    // Si no es forzado, intentar obtener datos del cache
    if (!force) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      setCachedData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchFn, getCachedData, setCachedData]);

  const invalidateCache = useCallback(() => {
    localStorage.removeItem(`api_cache_${key}`);
  }, [key]);

  const clearCache = useCallback(() => {
    // Limpiar todos los caches de API
    const keys = Object.keys(localStorage).filter(key => key.startsWith('api_cache_'));
    keys.forEach(key => localStorage.removeItem(key));
  }, []);

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    const loadData = async () => {
      // Intentar obtener datos del cache primero
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      setError(null);

      try {
        const result = await fetchFn();
        setData(result);
        setCachedData(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Solo ejecutar una vez al montar

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidateCache,
    clearCache
  };
}
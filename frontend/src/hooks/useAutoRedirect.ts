import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSettingsContext } from '@/contexts/AppSettingsContext';

export function useAutoRedirect() {
  const { settings, isLoaded } = useAppSettingsContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    // Solo aplicar redirección en páginas específicas
    if (pathname === '/tasks') {
      const defaultTasksView = settings.defaultView.tasks;
      
      // Redirigir solo si la vista por defecto no es 'list'
      if (defaultTasksView !== 'list') {
        router.replace(`/tasks/${defaultTasksView}`);
      }
    }
    
    if (pathname === '/projects') {
      const defaultProjectsView = settings.defaultView.projects;
      
      // Redirigir solo si la vista por defecto no es 'grid'
      if (defaultProjectsView !== 'grid') {
        router.replace(`/projects?view=${defaultProjectsView}`);
      }
    }
  }, [isLoaded, settings.defaultView, pathname, router]);
}

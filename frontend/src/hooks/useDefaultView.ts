import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSettingsContext } from '@/contexts/AppSettingsContext';

export function useDefaultView() {
  const { settings, isLoaded } = useAppSettingsContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // Aplicar zona horaria
    if (settings.timezone) {
      // Establecer la zona horaria en el contexto global si es necesario
      document.documentElement.setAttribute('data-timezone', settings.timezone);
    }

    // Aplicar idioma
    if (settings.language) {
      document.documentElement.setAttribute('lang', settings.language);
    }

  }, [settings, isLoaded]);

  // Forzar re-render cuando cambien las configuraciones
  useEffect(() => {
    // Este efecto se ejecuta cada vez que cambian las configuraciones
    // y puede ser usado para notificar a los componentes que escuchan
  }, [settings.defaultView]);

  const redirectToDefaultView = (page: 'dashboard' | 'tasks' | 'projects') => {
    if (!isLoaded) return;

    const defaultViews = settings.defaultView;
    
    switch (page) {
      case 'dashboard':
        // El dashboard ya tiene su propio sistema de layouts, no necesita redirección
        break;
      case 'tasks':
        if (defaultViews.tasks !== 'list') {
          router.push(`/tasks/${defaultViews.tasks}`);
        } else {
          router.push('/tasks');
        }
        break;
      case 'projects':
        if (defaultViews.projects !== 'grid') {
          router.push(`/projects?view=${defaultViews.projects}`);
        } else {
          router.push('/projects');
        }
        break;
    }
  };

  const getDefaultTasksView = () => {
    return settings.defaultView.tasks;
  };

  const getDefaultProjectsView = () => {
    return settings.defaultView.projects;
  };

  const getDefaultDashboardView = () => {
    return settings.defaultView.dashboard;
  };

  return {
    redirectToDefaultView,
    getDefaultTasksView,
    getDefaultProjectsView,
    getDefaultDashboardView,
    isLoaded
  };
}

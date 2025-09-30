'use client';

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useTheme } from 'next-themes';
import { apiService } from '@/services/api';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ChartsWidgetProps {
  variant?: 'default' | 'compact' | 'wide';
  className?: string;
}

interface ChartData {
  tasksCompletedByPeriod: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  };
  projectProgress: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
  priorityDistribution: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
  userActivity: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension: number;
    }[];
  };
}

const ChartsWidget: React.FC<ChartsWidgetProps> = ({ 
  variant = 'default', 
  className = '' 
}) => {
  const { theme } = useTheme();
  const [activeChart, setActiveChart] = useState<'productivity' | 'progress' | 'priority' | 'activity'>('productivity');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  // Colores adaptativos al tema
  const getThemeColors = () => {
    const isDark = theme === 'dark';
    return {
      text: isDark ? '#e5e7eb' : '#374151',
      grid: isDark ? '#374151' : '#e5e7eb',
      background: isDark ? '#1f2937' : '#ffffff',
      primary: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
      purple: '#8b5cf6',
      pink: '#ec4899',
      orange: '#f97316',
    };
  };

  // Configuración común para todos los gráficos
  const getCommonOptions = (title: string) => {
    const colors = getThemeColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: colors.text,
            font: {
              size: 12,
            },
          },
        },
        title: {
          display: true,
          text: title,
          color: colors.text,
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: colors.grid,
          },
          ticks: {
            color: colors.text,
            font: {
              size: 11,
            },
          },
        },
        y: {
          grid: {
            color: colors.grid,
          },
          ticks: {
            color: colors.text,
            font: {
              size: 11,
            },
          },
        },
      },
    };
  };

  // Cargar datos reales del backend
  const loadRealData = async (): Promise<ChartData> => {
    const colors = getThemeColors();
    
    try {
      const [
        tasksCompletedData,
        projectProgressData,
        priorityDistributionData,
        userActivityData
      ] = await Promise.all([
        apiService.getTasksCompletedByPeriod(),
        apiService.getProjectProgress(),
        apiService.getPriorityDistribution(),
        apiService.getUserActivity()
      ]);

      return {
        tasksCompletedByPeriod: {
          ...tasksCompletedData,
          datasets: tasksCompletedData.datasets.map(dataset => ({
            ...dataset,
            backgroundColor: colors.primary,
            borderColor: colors.primary,
            borderWidth: 1,
          }))
        },
        projectProgress: {
          ...projectProgressData,
          datasets: projectProgressData.datasets.map(dataset => ({
            ...dataset,
            backgroundColor: [
              colors.success,
              colors.warning,
              colors.danger,
              colors.info,
              colors.purple,
              colors.pink,
              colors.orange,
            ].slice(0, projectProgressData.labels.length),
            borderColor: [
              colors.success,
              colors.warning,
              colors.danger,
              colors.info,
              colors.purple,
              colors.pink,
              colors.orange,
            ].slice(0, projectProgressData.labels.length),
            borderWidth: 1,
          }))
        },
        priorityDistribution: {
          ...priorityDistributionData,
          datasets: priorityDistributionData.datasets.map(dataset => ({
            ...dataset,
            backgroundColor: [
              colors.danger,
              colors.warning,
              colors.success,
            ],
            borderColor: [
              colors.danger,
              colors.warning,
              colors.success,
            ],
            borderWidth: 2,
          }))
        },
        userActivity: {
          ...userActivityData,
          datasets: userActivityData.datasets.map(dataset => ({
            ...dataset,
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}20`,
            tension: 0.4,
          }))
        },
      };
    } catch (error) {
      console.error('Error cargando datos de gráficos:', error);
      // Fallback a datos simulados en caso de error
      return generateMockData();
    }
  };

  // Datos simulados como fallback
  const generateMockData = (): ChartData => {
    const colors = getThemeColors();
    
    return {
      tasksCompletedByPeriod: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Tareas Completadas',
            data: [12, 19, 8, 15, 22, 18],
            backgroundColor: colors.primary,
            borderColor: colors.primary,
            borderWidth: 1,
          },
        ],
      },
      projectProgress: {
        labels: ['Proyecto A', 'Proyecto B', 'Proyecto C', 'Proyecto D'],
        datasets: [
          {
            label: 'Progreso (%)',
            data: [85, 60, 40, 95],
            backgroundColor: [
              colors.success,
              colors.warning,
              colors.danger,
              colors.info,
            ],
            borderColor: [
              colors.success,
              colors.warning,
              colors.danger,
              colors.info,
            ],
            borderWidth: 1,
          },
        ],
      },
      priorityDistribution: {
        labels: ['Alta', 'Media', 'Baja'],
        datasets: [
          {
            data: [8, 15, 7],
            backgroundColor: [
              colors.danger,
              colors.warning,
              colors.success,
            ],
            borderColor: [
              colors.danger,
              colors.warning,
              colors.success,
            ],
            borderWidth: 2,
          },
        ],
      },
      userActivity: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
          {
            label: 'Tareas Creadas',
            data: [3, 5, 2, 8, 4, 1, 0],
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}20`,
            tension: 0.4,
          },
        ],
      },
    };
  };

  useEffect(() => {
    // Cargar datos reales del backend
    const loadChartData = async () => {
      setLoading(true);
      try {
        const data = await loadRealData();
        setChartData(data);
      } catch (error) {
        console.error('Error cargando datos de gráficos:', error);
        // Fallback a datos simulados
        setChartData(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [theme]);

  const renderChart = () => {
    if (loading || !chartData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    const colors = getThemeColors();

    switch (activeChart) {
      case 'productivity':
        return (
          <div className="h-64">
            <Bar 
              data={chartData.tasksCompletedByPeriod} 
              options={getCommonOptions('Tareas Completadas por Período')}
            />
          </div>
        );
      
      case 'progress':
        return (
          <div className="h-64">
            <Bar 
              data={chartData.projectProgress} 
              options={getCommonOptions('Progreso de Proyectos')}
            />
          </div>
        );
      
      case 'priority':
        return (
          <div className="h-64">
            <Doughnut 
              data={chartData.priorityDistribution} 
              options={{
                ...getCommonOptions('Distribución por Prioridad'),
                plugins: {
                  ...getCommonOptions('').plugins,
                  legend: {
                    ...getCommonOptions('').plugins.legend,
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>
        );
      
      case 'activity':
        return (
          <div className="h-64">
            <Line 
              data={chartData.userActivity} 
              options={getCommonOptions('Actividad por Usuario')}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const getContainerClasses = () => {
    const baseClasses = "bg-card border border-border rounded-lg p-4";
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} col-span-1`;
      case 'wide':
        return `${baseClasses} col-span-2`;
      default:
        return `${baseClasses} col-span-1`;
    }
  };

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
          Gráficos de Productividad
        </h3>
        <div className="flex space-x-1">
          {[
            { key: 'productivity', label: 'Productividad', icon: '📊' },
            { key: 'progress', label: 'Progreso', icon: '📈' },
            { key: 'priority', label: 'Prioridad', icon: '🎯' },
            { key: 'activity', label: 'Actividad', icon: '📅' },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveChart(key as any)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeChart === key
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              title={label}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
      
      {renderChart()}
    </div>
  );
};

export default ChartsWidget;

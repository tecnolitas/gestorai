'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Project, Task } from '@/types/api';
import { ArrowLeft, Home } from 'lucide-react';
import ExportButton from '@/components/ExportButton';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ReportFilters {
  startDate: string;
  endDate: string;
  projectId: string;
  userId: string;
  priority: string;
}

interface ReportData {
  tasksCompleted: number;
  tasksPending: number;
  totalTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  topProjects: Array<{
    id: number;
    name: string;
    completed: number;
    total: number;
    progress: number;
  }>;
  topUsers: Array<{
    id: number;
    name: string;
    completed: number;
    total: number;
    productivity: number;
  }>;
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  monthlyTrend: Array<{
    month: string;
    completed: number;
    created: number;
  }>;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<'overview' | 'tasks' | 'projects' | 'users' | 'temporal'>('overview');
  const [specificReportData, setSpecificReportData] = useState<any>(null);
  
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: '2024-07-01', // Fecha de inicio de nuestros datos
    endDate: '2024-09-30', // Fecha de fin de nuestros datos
    projectId: '',
    userId: '',
    priority: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [projectsData, usersData] = await Promise.all([
        apiService.getProjects(),
        apiService.getCurrentUser() // Por ahora solo el usuario actual
      ]);
      
      setProjects(projectsData.results || []);
      setUsers([usersData]); // Convertir a array para consistencia
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Cargar datos reales del backend
      const [tasksReport, usersReport, projectsReport, temporalData] = await Promise.all([
        apiService.getTasksDetailedReport({
          startDate: filters.startDate,
          endDate: filters.endDate,
          projectId: filters.projectId,
          userId: filters.userId,
          priority: filters.priority
        }),
        apiService.getUserProductivityReport({
          startDate: filters.startDate,
          endDate: filters.endDate,
          projectId: filters.projectId,
          userId: filters.userId
        }),
        apiService.getProjectsReport({
          startDate: filters.startDate,
          endDate: filters.endDate,
          projectId: filters.projectId,
          userId: filters.userId
        }),
        apiService.getTemporalComparison({
          startDate: filters.startDate,
          endDate: filters.endDate,
          projectId: filters.projectId,
          userId: filters.userId,
          priority: filters.priority,
          period: 'monthly'
        })
      ]);

      // Transformar datos del backend al formato esperado por el frontend
      const realData: ReportData = {
        tasksCompleted: tasksReport.taskStats.totalCompleted,
        tasksPending: tasksReport.taskStats.totalPending,
        totalTasks: tasksReport.taskStats.totalCompleted + tasksReport.taskStats.totalPending,
        completionRate: tasksReport.taskStats.completionRate,
        averageCompletionTime: tasksReport.taskStats.averageCompletionTime,
        topProjects: projectsReport.projects.slice(0, 3).map(project => ({
          id: project.id,
          name: project.name,
          completed: project.completedTasks,
          total: project.totalTasks,
          progress: project.progress
        })),
        topUsers: usersReport.users.slice(0, 3).map(user => ({
          id: user.id,
          name: user.firstName || user.username,
          completed: user.completedTasks,
          total: user.totalTasks,
          productivity: user.productivity
        })),
        priorityDistribution: {
          high: tasksReport.taskStats.priorityBreakdown.high.completed + tasksReport.taskStats.priorityBreakdown.high.pending,
          medium: tasksReport.taskStats.priorityBreakdown.medium.completed + tasksReport.taskStats.priorityBreakdown.medium.pending,
          low: tasksReport.taskStats.priorityBreakdown.low.completed + tasksReport.taskStats.priorityBreakdown.low.pending
        },
        monthlyTrend: temporalData.labels.map((label, index) => ({
          month: label,
          completed: temporalData.datasets[1]?.data[index] || 0,
          created: temporalData.datasets[0]?.data[index] || 0
        }))
      };
      
      setReportData(realData);
    } catch (error) {
      console.error('Error cargando datos de reporte:', error);
      // Fallback a datos mock si hay error
      const mockData: ReportData = {
        tasksCompleted: 0,
        tasksPending: 0,
        totalTasks: 0,
        completionRate: 0,
        averageCompletionTime: 0,
        topProjects: [],
        topUsers: [],
        priorityDistribution: { high: 0, medium: 0, low: 0 },
        monthlyTrend: []
      };
      setReportData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '2024-07-01', // Fecha de inicio de nuestros datos
      endDate: '2024-09-30', // Fecha de fin de nuestros datos
      projectId: '',
      userId: '',
      priority: ''
    });
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 sm:px-0 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {/* Breadcrumb Navigation */}
              <div className="flex items-center space-x-2 mb-4">
                <Link 
                  href="/dashboard"
                  className="flex items-center space-x-2 text-sm hover:text-primary transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>/</span>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Reportes
                </span>
              </div>
              
              <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                Reportes de Productividad
              </h1>
              <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
                Análisis detallado de proyectos, tareas y rendimiento del equipo
              </p>
            </div>
            
            {/* Back to Dashboard Button */}
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <button className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver al Dashboard</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="px-4 sm:px-0 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Filtros de Reporte
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Período */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  style={{
                    backgroundColor: 'var(--input)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  style={{
                    backgroundColor: 'var(--input)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>

              {/* Proyecto */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Proyecto
                </label>
                <select
                  value={filters.projectId}
                  onChange={(e) => handleFilterChange('projectId', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  style={{
                    backgroundColor: 'var(--input)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  <option value="">Todos los proyectos</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Usuario */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Usuario
                </label>
                <select
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  style={{
                    backgroundColor: 'var(--input)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  <option value="">Todos los usuarios</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name || user.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Prioridad
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  style={{
                    backgroundColor: 'var(--input)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  <option value="">Todas las prioridades</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                {reportData && (
                  <>
                    <ExportButton
                      data={reportData}
                      filename={`reporte-${activeReport}-${new Date().toISOString().split('T')[0]}`}
                      type="pdf"
                      title={`Reporte de ${activeReport === 'overview' ? 'Resumen General' : 
                              activeReport === 'tasks' ? 'Tareas' :
                              activeReport === 'projects' ? 'Proyectos' :
                              activeReport === 'users' ? 'Usuarios' : 'Comparativas'}`}
                      reportType={activeReport as 'overview' | 'tasks' | 'projects' | 'users' | 'temporal'}
                      specificData={specificReportData}
                    />
                    <ExportButton
                      data={reportData}
                      filename={`reporte-${activeReport}-${new Date().toISOString().split('T')[0]}`}
                      type="excel"
                      title={`Reporte de ${activeReport === 'overview' ? 'Resumen General' : 
                              activeReport === 'tasks' ? 'Tareas' :
                              activeReport === 'projects' ? 'Proyectos' :
                              activeReport === 'users' ? 'Usuarios' : 'Comparativas'}`}
                      reportType={activeReport as 'overview' | 'tasks' | 'projects' | 'users' | 'temporal'}
                      specificData={specificReportData}
                    />
                  </>
                )}
              </div>
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm border rounded-md hover:bg-muted transition-colors"
                style={{
                  backgroundColor: 'var(--muted)',
                  borderColor: 'var(--border)',
                  color: 'var(--muted-foreground)'
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Selector de Reportes */}
        <div className="px-4 sm:px-0 mb-8">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
            {[
              { key: 'overview', label: 'Resumen General', icon: '📊' },
              { key: 'tasks', label: 'Tareas', icon: '✅' },
              { key: 'projects', label: 'Proyectos', icon: '📁' },
              { key: 'users', label: 'Usuarios', icon: '👥' },
              { key: 'temporal', label: 'Comparativas', icon: '📈' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveReport(key as any);
                  setSpecificReportData(null); // Limpiar datos específicos al cambiar de pestaña
                }}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  activeReport === key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido del Reporte */}
        <div className="px-4 sm:px-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {activeReport === 'overview' && reportData && (
                <OverviewReport data={reportData} />
              )}
              {activeReport === 'tasks' && reportData && (
                <TasksReport data={reportData} filters={filters} onDataUpdate={setSpecificReportData} />
              )}
              {activeReport === 'projects' && reportData && (
                <ProjectsReport data={reportData} filters={filters} onDataUpdate={setSpecificReportData} />
              )}
              {activeReport === 'users' && reportData && (
                <UsersReport data={reportData} filters={filters} onDataUpdate={setSpecificReportData} />
              )}
              {activeReport === 'temporal' && (
                <TemporalComparisonReport filters={filters} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componentes de reportes específicos
function OverviewReport({ data }: { data: ReportData }) {
  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Tareas Completadas
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {data.tasksCompleted}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Tasa de Completado
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {data.completionRate}%
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Tiempo Promedio
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {data.averageCompletionTime}d
              </p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600">⏱️</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Total Tareas
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {data.totalTasks}
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600">📋</span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por prioridad */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Distribución por Prioridad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{data.priorityDistribution.high}</div>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Alta Prioridad</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{data.priorityDistribution.medium}</div>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Media Prioridad</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.priorityDistribution.low}</div>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Baja Prioridad</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TasksReport({ data, filters, onDataUpdate }: { data: ReportData; filters: ReportFilters; onDataUpdate: (data: any) => void }) {
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasksReport();
  }, [filters]);

  const loadTasksReport = async () => {
    setLoading(true);
    try {
      const reportData = await apiService.getTasksDetailedReport({
        startDate: filters.startDate,
        endDate: filters.endDate,
        projectId: filters.projectId,
        userId: filters.userId,
        priority: filters.priority
      });
      setTaskDetails(reportData);
      onDataUpdate(reportData);
    } catch (error) {
      console.error('Error cargando reporte de tareas:', error);
      // Fallback a datos simulados
      const fallbackData = {
        taskStats: {
          totalCompleted: 4,
          totalPending: 3,
          averageCompletionTime: 3.5,
          overdueTasks: 2,
          completionRate: 57.1,
          priorityBreakdown: {
            high: { completed: 2, pending: 1, overdue: 1 },
            medium: { completed: 2, pending: 1, overdue: 0 },
            low: { completed: 0, pending: 1, overdue: 1 }
          }
        },
        completedTasks: [
          {
            id: 1,
            title: "Implementar sistema de autenticación",
            project: "Sistema de Gestión - Inversiones",
            assignee: "Administrador",
            priority: "high",
            completed_at: "2025-07-15",
            days_to_complete: 3,
            status: "completed"
          }
        ],
        pendingTasks: [
          {
            id: 5,
            title: "Documentar reportes",
            project: "Sistema de Gestión - Inversiones",
            assignee: "Administrador",
            priority: "medium",
            due_date: "2025-08-02",
            days_overdue: 0,
            status: "pending"
          }
        ]
      };
      setTaskDetails(fallbackData);
      onDataUpdate(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!taskDetails) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--muted-foreground)' }}>No se pudieron cargar los datos del reporte.</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencida';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas de Tareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Tareas Completadas
              </p>
              <p className="text-2xl font-bold text-green-600">
                {taskDetails.taskStats.totalCompleted}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Tareas Pendientes
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {taskDetails.taskStats.totalPending}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Tareas Vencidas
              </p>
              <p className="text-2xl font-bold text-red-600">
                {taskDetails.taskStats.overdueTasks}
              </p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Tiempo Promedio
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {taskDetails.taskStats.averageCompletionTime}d
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600">⏱️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Prioridad */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Distribución por Prioridad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(taskDetails.taskStats.priorityBreakdown).map(([priority, stats]: [string, any]) => (
            <div key={priority} className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getPriorityColor(priority)}`}>
                {getPriorityLabel(priority)}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>Completadas:</span>
                  <span className="font-medium text-green-600">{stats.completed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>Pendientes:</span>
                  <span className="font-medium text-blue-600">{stats.pending}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>Vencidas:</span>
                  <span className="font-medium text-red-600">{stats.overdue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tareas Completadas */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Tareas Completadas ({taskDetails.completedTasks.length})
        </h3>
        <div className="space-y-3">
          {taskDetails.completedTasks.map((task: any) => (
            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>
                    {task.title}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <span>📁 {task.project}</span>
                  <span>👤 {task.assignee}</span>
                  <span>✅ Completada: {task.completed_at}</span>
                  <span>⏱️ {task.days_to_complete} días</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tareas Pendientes y Vencidas */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Tareas Pendientes y Vencidas ({taskDetails.pendingTasks.length})
        </h3>
        <div className="space-y-3">
          {taskDetails.pendingTasks.map((task: any) => (
            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>
                    {task.title}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <span>📁 {task.project}</span>
                  <span>👤 {task.assignee}</span>
                  <span>📅 Vence: {task.due_date}</span>
                  {task.days_overdue > 0 && (
                    <span className="text-red-600 font-medium">
                      ⚠️ {task.days_overdue} días de retraso
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de Productividad */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Resumen de Productividad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3" style={{ color: 'var(--foreground)' }}>
              Tasa de Completado por Prioridad
            </h4>
            <div className="space-y-3">
              {Object.entries(taskDetails.taskStats.priorityBreakdown).map(([priority, stats]: [string, any]) => {
                const total = stats.completed + stats.pending + stats.overdue;
                const completionRate = total > 0 ? Math.round((stats.completed / total) * 100) : 0;
                return (
                  <div key={priority} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {getPriorityLabel(priority)}:
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {completionRate}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3" style={{ color: 'var(--foreground)' }}>
              Métricas Generales
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Tasa de Completado:</span>
                <span className="text-sm font-medium text-green-600">{taskDetails.taskStats.completionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Tiempo Promedio:</span>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{taskDetails.taskStats.averageCompletionTime} días</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Tareas Vencidas:</span>
                <span className="text-sm font-medium text-red-600">{taskDetails.taskStats.overdueTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Total Tareas:</span>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  {taskDetails.taskStats.totalCompleted + taskDetails.taskStats.totalPending}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsReport({ data, filters, onDataUpdate }: { data: ReportData; filters: ReportFilters; onDataUpdate: (data: any) => void }) {
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectData();
  }, [filters]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const reportData = await apiService.getProjectsReport({
        startDate: filters.startDate,
        endDate: filters.endDate,
        projectId: filters.projectId,
        userId: filters.userId
      });
      setProjectData(reportData);
      onDataUpdate(reportData);
    } catch (error) {
      console.error('Error cargando reporte de proyectos:', error);
      // Fallback a datos simulados
      const fallbackData = {
        projects: [
          {
            id: 1,
            name: "Sistema de Gestión - Inversiones",
            description: "Sistema completo de gestión de inversiones",
            status: "on_track",
            statusLabel: "En Progreso",
            totalTasks: 15,
            completedTasks: 8,
            pendingTasks: 7,
            overdueTasks: 2,
            progress: 53.3,
            estimatedHours: 120,
            actualHours: 48,
            avgTimePerTask: 6.0,
            efficiency: 40.0,
            priorityBreakdown: {
              high: { total: 5, completed: 3, pending: 2 },
              medium: { total: 7, completed: 4, pending: 3 },
              low: { total: 3, completed: 1, pending: 2 }
            },
            assignedUsers: ["Administrador", "Maria García"],
            recentTasks: [
              {
                id: 1,
                title: "Implementar autenticación",
                assignee: "Administrador",
                priority: "high",
                status: "completed",
                created_at: "2025-07-15"
              }
            ],
            recentCompleted: 3,
            weeklyCompleted: 1,
            createdAt: "2025-06-01"
          }
        ],
        summary: {
          totalProjects: 1,
          avgProgress: 53.3,
          totalEstimatedHours: 120,
          totalActualHours: 48,
          avgEfficiency: 40.0,
          statusCounts: {
            completed: 0,
            on_track: 1,
            at_risk: 0,
            in_progress: 0,
            planning: 0
          },
          activeProjects: 1
        }
      };
      setProjectData(fallbackData);
      onDataUpdate(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin prioridad';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencida';
      default: return 'Sin estado';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'on_track': return 'text-blue-600 bg-blue-100';
      case 'at_risk': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'planning': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--muted-foreground)' }}>No se pudieron cargar los datos de proyectos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Total Proyectos
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {projectData.summary.totalProjects}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">📁</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Progreso Promedio
              </p>
              <p className="text-2xl font-bold text-green-600">
                {projectData.summary.avgProgress}%
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Proyectos Activos
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {projectData.summary.activeProjects}
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600">⚡</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Horas Estimadas
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {projectData.summary.totalEstimatedHours}h
              </p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600">⏱️</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Eficiencia Promedio
              </p>
              <p className={`text-2xl font-bold ${getEfficiencyColor(projectData.summary.avgEfficiency)}`}>
                {projectData.summary.avgEfficiency}%
              </p>
            </div>
            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Estado */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Distribución por Estado
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {projectData.summary.statusCounts.completed}
            </div>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Completados
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {projectData.summary.statusCounts.on_track}
            </div>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              En Progreso
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {projectData.summary.statusCounts.at_risk}
            </div>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              En Riesgo
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {projectData.summary.statusCounts.in_progress}
            </div>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              En Desarrollo
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {projectData.summary.statusCounts.planning}
            </div>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Planificación
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Proyectos */}
      <div className="space-y-6">
        {projectData.projects.map((project: any) => (
          <div key={project.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                    {project.name}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                    {project.statusLabel}
                  </span>
                </div>
                <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                  {project.description}
                </p>
                <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <span>📅 Creado: {project.createdAt}</span>
                  <span>👥 Usuarios: {project.assignedUsers.join(', ')}</span>
                  <span>✅ Completadas recientes: {project.recentCompleted}</span>
                  <span>📊 Esta semana: {project.weeklyCompleted}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                  {project.progress}%
                </div>
                <div className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                  Progreso
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Métricas del Proyecto */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  {project.totalTasks}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Total Tareas
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {project.completedTasks}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Completadas
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {project.pendingTasks}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Pendientes
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {project.overdueTasks}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Vencidas
                </div>
              </div>
            </div>

            {/* Tiempo y Eficiencia */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  Tiempo Estimado
                </div>
                <div className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  {project.estimatedHours}h
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  Tiempo Real
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {project.actualHours}h
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  Promedio por Tarea
                </div>
                <div className="text-lg font-bold text-green-600">
                  {project.avgTimePerTask}h
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  Eficiencia
                </div>
                <div className={`text-lg font-bold ${getEfficiencyColor(project.efficiency)}`}>
                  {project.efficiency}%
                </div>
              </div>
            </div>

            {/* Distribución por Prioridad */}
            <div className="mb-6">
              <h4 className="font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                Distribución por Prioridad
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(project.priorityBreakdown).map(([priority, data]: [string, any]) => (
                  <div key={priority} className="bg-muted rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                        {getPriorityLabel(priority)}
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {data.total} tareas
                      </span>
                    </div>
                    <div className="space-y-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <div className="flex justify-between">
                        <span>Completadas:</span>
                        <span className="text-green-600">{data.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pendientes:</span>
                        <span className="text-yellow-600">{data.pending}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tareas Recientes */}
            <div>
              <h4 className="font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                Tareas Recientes
              </h4>
              <div className="space-y-2">
                {project.recentTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                          {task.title}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        👤 {task.assignee} • 📅 {task.created_at}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersReport({ data, filters, onDataUpdate }: { data: ReportData; filters: ReportFilters; onDataUpdate: (data: any) => void }) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [filters]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const reportData = await apiService.getUserProductivityReport({
        startDate: filters.startDate,
        endDate: filters.endDate,
        projectId: filters.projectId,
        userId: filters.userId
      });
      setUserData(reportData);
      onDataUpdate(reportData);
    } catch (error) {
      console.error('Error cargando reporte de usuarios:', error);
      // Fallback a datos simulados
      const fallbackData = {
        users: [
          {
            id: 1,
            username: "admin",
            firstName: "Administrador",
            lastName: "",
            email: "admin@example.com",
            totalTasks: 12,
            completedTasks: 8,
            pendingTasks: 4,
            overdueTasks: 1,
            productivity: 66.7,
            estimatedHours: 96,
            actualHours: 48,
            avgTimePerTask: 6.0,
            efficiency: 50.0,
            priorityBreakdown: {
              high: { total: 4, completed: 3, pending: 1 },
              medium: { total: 5, completed: 3, pending: 2 },
              low: { total: 3, completed: 2, pending: 1 }
            },
            projects: ["Sistema de Gestión - Inversiones"],
            recentTasks: [
              {
                id: 1,
                title: "Implementar autenticación",
                project: "Sistema de Gestión - Inversiones",
                priority: "high",
                status: "completed",
                created_at: "2025-07-15"
              }
            ],
            recentCompleted: 3,
            lastActive: "2025-09-07"
          }
        ],
        summary: {
          totalUsers: 1,
          avgProductivity: 66.7,
          totalEstimatedHours: 96,
          totalActualHours: 48,
          avgEfficiency: 50.0,
          activeUsers: 1
        }
      };
      setUserData(fallbackData);
      onDataUpdate(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin prioridad';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencida';
      default: return 'Sin estado';
    }
  };

  const getProductivityColor = (productivity: number) => {
    if (productivity >= 80) return 'text-green-600';
    if (productivity >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--muted-foreground)' }}>No se pudieron cargar los datos de usuarios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Total Usuarios
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {userData.summary.totalUsers}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Productividad Promedio
              </p>
              <p className={`text-2xl font-bold ${getProductivityColor(userData.summary.avgProductivity)}`}>
                {userData.summary.avgProductivity}%
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Usuarios Activos
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {userData.summary.activeUsers}
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600">⚡</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Horas Estimadas
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {userData.summary.totalEstimatedHours}h
              </p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600">⏱️</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Eficiencia Promedio
              </p>
              <p className={`text-2xl font-bold ${getEfficiencyColor(userData.summary.avgEfficiency)}`}>
                {userData.summary.avgEfficiency}%
              </p>
            </div>
            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="space-y-6">
        {userData.users.map((user: any) => (
          <div key={user.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {(user.firstName || user.username).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                      {user.firstName || user.username}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      @{user.username} • {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <span>📅 Última actividad: {user.lastActive}</span>
                  <span>📁 Proyectos: {user.projects.length}</span>
                  <span>✅ Completadas recientes: {user.recentCompleted}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold mb-1 ${getProductivityColor(user.productivity)}`}>
                  {user.productivity}%
                </div>
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Productividad
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${user.productivity}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Métricas del Usuario */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  {user.totalTasks}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Total Tareas
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {user.completedTasks}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Completadas
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {user.pendingTasks}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Pendientes
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {user.overdueTasks}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Vencidas
                </div>
              </div>
            </div>

            {/* Tiempo y Eficiencia */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  Tiempo Estimado
                </div>
                <div className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  {user.estimatedHours}h
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  Tiempo Real
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {user.actualHours}h
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  Eficiencia
                </div>
                <div className={`text-lg font-bold ${getEfficiencyColor(user.efficiency)}`}>
                  {user.efficiency}%
                </div>
              </div>
            </div>

            {/* Distribución por Prioridad */}
            <div className="mb-6">
              <h4 className="font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                Distribución por Prioridad
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(user.priorityBreakdown).map(([priority, data]: [string, any]) => (
                  <div key={priority} className="bg-muted rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                        {getPriorityLabel(priority)}
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {data.total} tareas
                      </span>
                    </div>
                    <div className="space-y-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <div className="flex justify-between">
                        <span>Completadas:</span>
                        <span className="text-green-600">{data.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pendientes:</span>
                        <span className="text-yellow-600">{data.pending}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proyectos y Tareas Recientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                  Proyectos Asignados
                </h4>
                <div className="space-y-2">
                  {user.projects.map((project: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                      <span className="text-sm">📁</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {project}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                  Tareas Recientes
                </h4>
                <div className="space-y-2">
                  {user.recentTasks.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                            {task.title}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                        </div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          📁 {task.project} • 📅 {task.created_at}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TemporalComparisonReport({ filters }: { filters: ReportFilters }) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    loadTemporalData();
  }, [filters, selectedPeriod]);

  const loadTemporalData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getTemporalComparison({
        startDate: filters.startDate,
        endDate: filters.endDate,
        projectId: filters.projectId,
        userId: filters.userId,
        priority: filters.priority,
        period: selectedPeriod
      });
      setChartData(data);
    } catch (error) {
      console.error('Error cargando datos temporales:', error);
      // Fallback a datos simulados
      setChartData({
        period: selectedPeriod,
        labels: selectedPeriod === 'daily' ? 
          ['01/09', '02/09', '03/09', '04/09', '05/09', '06/09', '07/09'] :
          selectedPeriod === 'weekly' ?
          ['Sem 35', 'Sem 36', 'Sem 37', 'Sem 38', 'Sem 39', 'Sem 40'] :
          ['Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'],
        datasets: [
          {
            label: 'Tareas Creadas',
            data: selectedPeriod === 'daily' ? [2, 1, 3, 0, 2, 1, 1] :
                  selectedPeriod === 'weekly' ? [5, 8, 3, 6, 4, 7] :
                  [8, 12, 6, 15, 9, 11],
            type: selectedPeriod === 'daily' ? 'line' : 'bar'
          },
          {
            label: 'Tareas Completadas',
            data: selectedPeriod === 'daily' ? [1, 2, 1, 1, 0, 2, 1] :
                  selectedPeriod === 'weekly' ? [3, 5, 2, 4, 3, 6] :
                  [4, 8, 3, 11, 6, 9],
            type: selectedPeriod === 'daily' ? 'line' : 'bar'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getThemeColors = () => {
    return {
      text: '#374151',
      grid: '#e5e7eb',
      background: '#ffffff',
      primary: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    };
  };

  const getChartOptions = (title: string) => {
    const colors = getThemeColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: colors.text,
            font: { size: 12 },
          },
        },
        title: {
          display: true,
          text: title,
          color: colors.text,
          font: { size: 16, weight: 'bold' as const },
        },
      },
      scales: {
        x: {
          grid: { color: colors.grid },
          ticks: { color: colors.text, font: { size: 11 } },
        },
        y: {
          grid: { color: colors.grid },
          ticks: { color: colors.text, font: { size: 11 } },
        },
      },
    };
  };

  const getChartData = () => {
    if (!chartData) return null;

    const colors = getThemeColors();
    
    return {
      labels: chartData.labels,
      datasets: chartData.datasets.map((dataset: any, index: number) => ({
        ...dataset,
        backgroundColor: index === 0 ? colors.primary : colors.success,
        borderColor: index === 0 ? colors.primary : colors.success,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      }))
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--muted-foreground)' }}>No se pudieron cargar los datos temporales.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de Período */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Comparativas Temporales
        </h3>
        
        <div className="flex items-center space-x-4 mb-6">
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            Período:
          </span>
          <div className="flex space-x-2">
            {[
              { key: 'daily', label: 'Diario', icon: '📅' },
              { key: 'weekly', label: 'Semanal', icon: '📊' },
              { key: 'monthly', label: 'Mensual', icon: '📈' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key as any)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  selectedPeriod === key
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Gráfico Principal */}
        <div className="h-96">
          {chartData.datasets[0]?.type === 'line' ? (
            <Line 
              data={getChartData()!} 
              options={getChartOptions(`Tendencias ${selectedPeriod === 'daily' ? 'Diarias' : selectedPeriod === 'weekly' ? 'Semanales' : 'Mensuales'}`)}
            />
          ) : (
            <Bar 
              data={getChartData()!} 
              options={getChartOptions(`Comparativa ${selectedPeriod === 'daily' ? 'Diaria' : selectedPeriod === 'weekly' ? 'Semanal' : 'Mensual'}`)}
            />
          )}
        </div>
      </div>

      {/* Métricas de Tendencias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Tareas Creadas (Total)
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {chartData.datasets[0]?.data.reduce((a: number, b: number) => a + b, 0) || 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Tareas Completadas (Total)
              </p>
              <p className="text-2xl font-bold text-green-600">
                {chartData.datasets[1]?.data.reduce((a: number, b: number) => a + b, 0) || 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Tasa de Completado
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {(() => {
                  const created = chartData.datasets[0]?.data.reduce((a: number, b: number) => a + b, 0) || 0;
                  const completed = chartData.datasets[1]?.data.reduce((a: number, b: number) => a + b, 0) || 0;
                  return created > 0 ? Math.round((completed / created) * 100) : 0;
                })()}%
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis de Tendencias */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Análisis de Tendencias
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3" style={{ color: 'var(--foreground)' }}>
              Período de Mayor Actividad
            </h4>
            <div className="space-y-2">
              {(() => {
                const createdData = chartData.datasets[0]?.data || [];
                const maxIndex = createdData.indexOf(Math.max(...createdData));
                const period = selectedPeriod === 'daily' ? 'día' : selectedPeriod === 'weekly' ? 'semana' : 'mes';
                return (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {period.charAt(0).toUpperCase() + period.slice(1)} con más tareas creadas:
                    </span>
                    <span className="font-medium text-blue-600">
                      {chartData.labels[maxIndex]} ({createdData[maxIndex]} tareas)
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3" style={{ color: 'var(--foreground)' }}>
              Período de Mayor Productividad
            </h4>
            <div className="space-y-2">
              {(() => {
                const completedData = chartData.datasets[1]?.data || [];
                const maxIndex = completedData.indexOf(Math.max(...completedData));
                const period = selectedPeriod === 'daily' ? 'día' : selectedPeriod === 'weekly' ? 'semana' : 'mes';
                return (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {period.charAt(0).toUpperCase() + period.slice(1)} con más tareas completadas:
                    </span>
                    <span className="font-medium text-green-600">
                      {chartData.labels[maxIndex]} ({completedData[maxIndex]} tareas)
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



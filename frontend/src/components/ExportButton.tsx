'use client';

import React, { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';

interface ExportButtonProps {
  data: any;
  filename: string;
  type: 'pdf' | 'excel';
  title: string;
  reportType: 'overview' | 'tasks' | 'projects' | 'users' | 'temporal';
  specificData?: any; // Datos específicos del reporte (taskDetails, projectDetails, etc.)
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  type,
  title,
  reportType,
  specificData,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Configuración del documento
      doc.setFontSize(20);
      doc.text(title, 20, 20);

      // Agregar fecha de generación
      doc.setFontSize(10);
      doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);

      let yPosition = 50;

      // Función para agregar texto con salto de línea automático
      const addText = (text: string, x: number, y: number, maxWidth: number = 170) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * 5);
      };

      // Exportar datos según el tipo de reporte
      switch (reportType) {
        case 'overview':
          // Reporte de resumen general
          doc.setFontSize(14);
          yPosition = addText('Resumen General', 20, yPosition + 10);
          
          doc.setFontSize(12);
          yPosition = addText(`Total Tareas: ${data.totalTasks}`, 20, yPosition + 5);
          yPosition = addText(`Tareas Completadas: ${data.tasksCompleted}`, 20, yPosition + 5);
          yPosition = addText(`Tareas Pendientes: ${data.tasksPending}`, 20, yPosition + 5);
          yPosition = addText(`Tasa de Completado: ${data.completionRate}%`, 20, yPosition + 5);
          yPosition = addText(`Tiempo Promedio: ${data.averageCompletionTime} días`, 20, yPosition + 5);

          // Distribución por prioridad
          yPosition += 10;
          doc.setFontSize(14);
          yPosition = addText('Distribución por Prioridad', 20, yPosition);
          
          doc.setFontSize(12);
          yPosition = addText(`Alta: ${data.priorityDistribution.high} tareas`, 20, yPosition + 5);
          yPosition = addText(`Media: ${data.priorityDistribution.medium} tareas`, 20, yPosition + 5);
          yPosition = addText(`Baja: ${data.priorityDistribution.low} tareas`, 20, yPosition + 5);
          break;

        case 'tasks':
          // Reporte detallado de tareas
          const taskData = specificData || data;
          if (taskData.taskStats) {
            doc.setFontSize(14);
            yPosition = addText('Estadísticas Detalladas de Tareas', 20, yPosition + 10);
            
            doc.setFontSize(12);
            yPosition = addText(`Total Completadas: ${taskData.taskStats.totalCompleted}`, 20, yPosition + 5);
            yPosition = addText(`Total Pendientes: ${taskData.taskStats.totalPending}`, 20, yPosition + 5);
            yPosition = addText(`Tareas Vencidas: ${taskData.taskStats.overdueTasks}`, 20, yPosition + 5);
            yPosition = addText(`Tasa de Completado: ${taskData.taskStats.completionRate}%`, 20, yPosition + 5);
            yPosition = addText(`Tiempo Promedio: ${taskData.taskStats.averageCompletionTime} días`, 20, yPosition + 5);

            // Desglose por prioridad
            yPosition += 10;
            doc.setFontSize(14);
            yPosition = addText('Desglose por Prioridad', 20, yPosition);
            
            if (taskData.taskStats.priorityBreakdown) {
              doc.setFontSize(12);
              yPosition = addText('Alta Prioridad:', 20, yPosition + 5);
              yPosition = addText(`  Completadas: ${taskData.taskStats.priorityBreakdown.high.completed}`, 30, yPosition + 3);
              yPosition = addText(`  Pendientes: ${taskData.taskStats.priorityBreakdown.high.pending}`, 30, yPosition + 3);
              yPosition = addText(`  Vencidas: ${taskData.taskStats.priorityBreakdown.high.overdue}`, 30, yPosition + 3);
              
              yPosition = addText('Media Prioridad:', 20, yPosition + 5);
              yPosition = addText(`  Completadas: ${taskData.taskStats.priorityBreakdown.medium.completed}`, 30, yPosition + 3);
              yPosition = addText(`  Pendientes: ${taskData.taskStats.priorityBreakdown.medium.pending}`, 30, yPosition + 3);
              yPosition = addText(`  Vencidas: ${taskData.taskStats.priorityBreakdown.medium.overdue}`, 30, yPosition + 3);
              
              yPosition = addText('Baja Prioridad:', 20, yPosition + 5);
              yPosition = addText(`  Completadas: ${taskData.taskStats.priorityBreakdown.low.completed}`, 30, yPosition + 3);
              yPosition = addText(`  Pendientes: ${taskData.taskStats.priorityBreakdown.low.pending}`, 30, yPosition + 3);
              yPosition = addText(`  Vencidas: ${taskData.taskStats.priorityBreakdown.low.overdue}`, 30, yPosition + 3);
            }
          }
          break;

        case 'projects':
          // Reporte de proyectos
          const projectData = specificData || data;
          if (projectData.projects && projectData.projects.length > 0) {
            doc.setFontSize(14);
            yPosition = addText('Reporte de Proyectos', 20, yPosition + 10);
            
            projectData.projects.forEach((project: any, index: number) => {
              if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
              }
              
              doc.setFontSize(12);
              yPosition = addText(`${index + 1}. ${project.name}`, 20, yPosition + 5);
              yPosition = addText(`   Estado: ${project.statusLabel}`, 30, yPosition + 3);
              yPosition = addText(`   Progreso: ${project.progress}%`, 30, yPosition + 3);
              yPosition = addText(`   Tareas Completadas: ${project.completedTasks}`, 30, yPosition + 3);
              yPosition = addText(`   Tareas Pendientes: ${project.pendingTasks}`, 30, yPosition + 3);
              yPosition = addText(`   Horas Estimadas: ${project.estimatedHours}`, 30, yPosition + 3);
              yPosition = addText(`   Horas Reales: ${project.actualHours}`, 30, yPosition + 3);
              yPosition = addText(`   Eficiencia: ${project.efficiency}%`, 30, yPosition + 3);
              yPosition += 5;
            });
          }
          break;

        case 'users':
          // Reporte de usuarios
          const userData = specificData || data;
          if (userData.users && userData.users.length > 0) {
            doc.setFontSize(14);
            yPosition = addText('Reporte de Usuarios', 20, yPosition + 10);
            
            userData.users.forEach((user: any, index: number) => {
              if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
              }
              
              doc.setFontSize(12);
              yPosition = addText(`${index + 1}. ${user.firstName || user.username}`, 20, yPosition + 5);
              yPosition = addText(`   Email: ${user.email}`, 30, yPosition + 3);
              yPosition = addText(`   Tareas Completadas: ${user.completedTasks}`, 30, yPosition + 3);
              yPosition = addText(`   Tareas Pendientes: ${user.pendingTasks}`, 30, yPosition + 3);
              yPosition = addText(`   Productividad: ${user.productivity}%`, 30, yPosition + 3);
              yPosition = addText(`   Eficiencia: ${user.efficiency}%`, 30, yPosition + 3);
              yPosition += 5;
            });
          }
          break;

        case 'temporal':
          // Reporte de comparación temporal
          if (data.labels && data.datasets) {
            doc.setFontSize(14);
            yPosition = addText('Comparación Temporal', 20, yPosition + 10);
            
            doc.setFontSize(12);
            yPosition = addText('Tendencias por Período:', 20, yPosition + 5);
            
            data.labels.forEach((label: string, index: number) => {
              if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
              }
              
              yPosition = addText(`${label}:`, 20, yPosition + 5);
              yPosition = addText(`  Tareas Creadas: ${data.datasets[0]?.data[index] || 0}`, 30, yPosition + 3);
              yPosition = addText(`  Tareas Completadas: ${data.datasets[1]?.data[index] || 0}`, 30, yPosition + 3);
            });
          }
          break;
      }

      // Guardar el PDF
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');

      // Crear workbook
      const workbook = XLSX.utils.book_new();

      // Función para crear hoja de datos
      const createSheet = (data: any[], sheetName: string, headers: string[]) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      };

      // Exportar según el tipo de reporte
      switch (reportType) {
        case 'overview':
          // Hoja de estadísticas generales
          const statsData = [
            { Métrica: 'Total Tareas', Valor: data.totalTasks },
            { Métrica: 'Tareas Completadas', Valor: data.tasksCompleted },
            { Métrica: 'Tareas Pendientes', Valor: data.tasksPending },
            { Métrica: 'Tasa de Completado (%)', Valor: data.completionRate },
            { Métrica: 'Tiempo Promedio (días)', Valor: data.averageCompletionTime }
          ];
          createSheet(statsData, 'Estadísticas', ['Métrica', 'Valor']);

          // Hoja de distribución por prioridad
          const priorityData = [
            { Prioridad: 'Alta', Cantidad: data.priorityDistribution.high },
            { Prioridad: 'Media', Cantidad: data.priorityDistribution.medium },
            { Prioridad: 'Baja', Cantidad: data.priorityDistribution.low }
          ];
          createSheet(priorityData, 'Prioridades', ['Prioridad', 'Cantidad']);
          break;

        case 'tasks':
          const taskDataExcel = specificData || data;
          if (taskDataExcel.taskStats) {
            // Hoja de estadísticas detalladas
            const detailedStats = [
              { Métrica: 'Total Completadas', Valor: taskDataExcel.taskStats.totalCompleted },
              { Métrica: 'Total Pendientes', Valor: taskDataExcel.taskStats.totalPending },
              { Métrica: 'Tareas Vencidas', Valor: taskDataExcel.taskStats.overdueTasks },
              { Métrica: 'Tasa de Completado (%)', Valor: taskDataExcel.taskStats.completionRate },
              { Métrica: 'Tiempo Promedio (días)', Valor: taskDataExcel.taskStats.averageCompletionTime }
            ];
            createSheet(detailedStats, 'Estadísticas Detalladas', ['Métrica', 'Valor']);

            // Hoja de desglose por prioridad
            if (taskDataExcel.taskStats.priorityBreakdown) {
              const breakdownData = [
                { Prioridad: 'Alta', Completadas: taskDataExcel.taskStats.priorityBreakdown.high.completed, Pendientes: taskDataExcel.taskStats.priorityBreakdown.high.pending, Vencidas: taskDataExcel.taskStats.priorityBreakdown.high.overdue },
                { Prioridad: 'Media', Completadas: taskDataExcel.taskStats.priorityBreakdown.medium.completed, Pendientes: taskDataExcel.taskStats.priorityBreakdown.medium.pending, Vencidas: taskDataExcel.taskStats.priorityBreakdown.medium.overdue },
                { Prioridad: 'Baja', Completadas: taskDataExcel.taskStats.priorityBreakdown.low.completed, Pendientes: taskDataExcel.taskStats.priorityBreakdown.low.pending, Vencidas: taskDataExcel.taskStats.priorityBreakdown.low.overdue }
              ];
              createSheet(breakdownData, 'Desglose por Prioridad', ['Prioridad', 'Completadas', 'Pendientes', 'Vencidas']);
            }
          }
          break;

        case 'projects':
          const projectDataExcel = specificData || data;
          if (projectDataExcel.projects && projectDataExcel.projects.length > 0) {
            const projectsData = projectDataExcel.projects.map((project: any) => ({
              Proyecto: project.name,
              Estado: project.statusLabel,
              Progreso: `${project.progress}%`,
              'Tareas Completadas': project.completedTasks,
              'Tareas Pendientes': project.pendingTasks,
              'Horas Estimadas': project.estimatedHours,
              'Horas Reales': project.actualHours,
              'Eficiencia (%)': project.efficiency
            }));
            createSheet(projectsData, 'Proyectos', ['Proyecto', 'Estado', 'Progreso', 'Tareas Completadas', 'Tareas Pendientes', 'Horas Estimadas', 'Horas Reales', 'Eficiencia (%)']);
          }
          break;

        case 'users':
          const userDataExcel = specificData || data;
          if (userDataExcel.users && userDataExcel.users.length > 0) {
            const usersData = userDataExcel.users.map((user: any) => ({
              Usuario: user.firstName || user.username,
              Email: user.email,
              'Tareas Completadas': user.completedTasks,
              'Tareas Pendientes': user.pendingTasks,
              'Productividad (%)': user.productivity,
              'Eficiencia (%)': user.efficiency
            }));
            createSheet(usersData, 'Usuarios', ['Usuario', 'Email', 'Tareas Completadas', 'Tareas Pendientes', 'Productividad (%)', 'Eficiencia (%)']);
          }
          break;

        case 'temporal':
          if (data.labels && data.datasets) {
            const temporalData = data.labels.map((label: string, index: number) => ({
              Período: label,
              'Tareas Creadas': data.datasets[0]?.data[index] || 0,
              'Tareas Completadas': data.datasets[1]?.data[index] || 0
            }));
            createSheet(temporalData, 'Comparación Temporal', ['Período', 'Tareas Creadas', 'Tareas Completadas']);
          }
          break;
      }

      // Guardar el archivo Excel
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
      console.error('Error generando Excel:', error);
      alert('Error al generar el archivo Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (type === 'pdf') {
      exportToPDF();
    } else {
      exportToExcel();
    }
  };

  const getIcon = () => {
    if (type === 'pdf') {
      return <FileText className="h-4 w-4" />;
    } else {
      return <Table className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    if (type === 'pdf') {
      return 'Exportar PDF';
    } else {
      return 'Exportar Excel';
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center space-x-2 px-4 py-2 border rounded-md transition-colors ${
        isExporting
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      } ${className}`}
      style={{
        backgroundColor: isExporting ? 'var(--muted)' : 'var(--background)',
        color: isExporting ? 'var(--muted-foreground)' : 'var(--foreground)',
        borderColor: 'var(--border)'
      }}
    >
      {isExporting ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
      ) : (
        getIcon()
      )}
      <span className="text-sm font-medium">
        {isExporting ? 'Exportando...' : getLabel()}
      </span>
    </button>
  );
};

export default ExportButton;

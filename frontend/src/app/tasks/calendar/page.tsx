'use client';

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/services/api';
import { Task, Project } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Plus, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateSelectArg } from '@fullcalendar/core';

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksResponse, projectsResponse] = await Promise.all([
          apiService.getTasks(),
          apiService.getProjects(),
        ]);

        setTasks(tasksResponse.results || []);
        setProjects(projectsResponse.results || []);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
        setTasks([]);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleComplete = async (taskId: number) => {
    try {
      const updatedTask = await apiService.toggleTaskComplete(taskId);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      );
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesProject = selectedProject === 'all' || 
      task.project?.id?.toString() === selectedProject;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesProject && matchesSearch;
  });

  // Convertir tareas a eventos del calendario
  const calendarEvents = filteredTasks.map(task => ({
    id: task.id.toString(),
    title: task.title,
    start: task.due_date || task.created_at,
    end: task.due_date || task.created_at,
    backgroundColor: task.completed ? '#10b981' : getPriorityColor(task.priority),
    borderColor: task.completed ? '#10b981' : getPriorityColor(task.priority),
    textColor: '#ffffff',
    className: `priority-${task.priority} ${task.completed ? 'completed' : ''}`,
    extendedProps: {
      task: task,
      completed: task.completed,
      priority: task.priority,
      project: task.project?.name || 'Sin proyecto'
    }
  }));

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    const taskId = parseInt(clickInfo.event.id);
    window.open(`/tasks/${taskId}`, '_blank');
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const startDate = selectInfo.startStr;
    const endDate = selectInfo.endStr;
    
    // Redirigir a crear tarea con fechas predefinidas
    const params = new URLSearchParams({
      due_date: startDate,
      start_date: startDate,
      end_date: endDate
    });
    
    window.open(`/tasks/new?${params.toString()}`, '_blank');
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <Navigation />
        
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  Vista Calendario
                </h1>
                <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
                  Visualiza tus tareas en formato calendario
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link href="/tasks/new">
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Nueva Tarea</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                  <input
                    type="text"
                    placeholder="Buscar tareas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                    style={{
                      backgroundColor: 'var(--input)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                  />
                </div>
              </div>

              {/* Project Filter */}
              <div className="sm:w-64">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  style={{
                    backgroundColor: 'var(--input)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  <option value="all">Todos los proyectos</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id.toString()}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--card)' }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView="dayGridMonth"
              editable={false}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={calendarEvents}
              eventClick={handleEventClick}
              select={handleDateSelect}
              height="auto"
              locale="es"
              buttonText={{
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día'
              }}
              dayHeaderFormat={{ weekday: 'long' }}
              titleFormat={{ year: 'numeric', month: 'long' }}
              eventDisplay="block"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false
              }}
            />
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Leyenda
            </h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span style={{ color: 'var(--foreground)' }}>Prioridad Alta</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                <span style={{ color: 'var(--foreground)' }}>Prioridad Media</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                <span style={{ color: 'var(--foreground)' }}>Prioridad Baja / Completada</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppSettingsContext } from '@/contexts/AppSettingsContext';
import { useNotification } from '@/contexts/NotificationContext';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ArrowLeft, Home, Settings, Save, RotateCcw, Globe, Bell, Eye, Monitor, Clock, Languages } from 'lucide-react';

export default function SettingsPage() {
  const {
    settings,
    isLoaded,
    updateSettings,
    updateNotificationSettings,
    updateDefaultView,
    updateDisplaySettings,
    resetSettings
  } = useAppSettingsContext();
  const { showSuccess, showError, showInfo } = useNotification();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'display' | 'views'>('general');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const timezones = [
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
    { value: 'America/Mexico_City', label: 'México (GMT-6)' },
    { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
    { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' },
    { value: 'Europe/London', label: 'Londres (GMT+0)' },
    { value: 'Asia/Tokyo', label: 'Tokio (GMT+9)' },
    { value: 'Australia/Sydney', label: 'Sídney (GMT+10)' },
  ];

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess(
        'Configuración guardada',
        'Tus preferencias se han guardado correctamente',
        4000
      );
    } catch (error) {
      showError(
        'Error al guardar',
        'No se pudo guardar la configuración. Inténtalo de nuevo.',
        5000
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmReset = () => {
    resetSettings();
    setShowConfirmDialog(false);
    showSuccess(
      'Configuración restablecida',
      'Todas las configuraciones han vuelto a los valores por defecto',
      4000
    );
  };

  const handleCancelReset = () => {
    setShowConfirmDialog(false);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
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
                  Configuración
                </span>
              </div>
              
              <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                Configuración de la Aplicación
              </h1>
              <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
                Personaliza tu experiencia y preferencias
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

        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar de Navegación */}
            <div className="lg:col-span-1">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-md transition-colors ${
                    activeTab === 'general' 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-muted'
                  }`}
                  style={activeTab !== 'general' ? { color: 'var(--foreground)' } : {}}
                >
                  <Settings className="h-5 w-5" />
                  <span>General</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-md transition-colors ${
                    activeTab === 'notifications' 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-muted'
                  }`}
                  style={activeTab !== 'notifications' ? { color: 'var(--foreground)' } : {}}
                >
                  <Bell className="h-5 w-5" />
                  <span>Notificaciones</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('display')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-md transition-colors ${
                    activeTab === 'display' 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-muted'
                  }`}
                  style={activeTab !== 'display' ? { color: 'var(--foreground)' } : {}}
                >
                  <Eye className="h-5 w-5" />
                  <span>Pantalla</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('views')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-md transition-colors ${
                    activeTab === 'views' 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-muted'
                  }`}
                  style={activeTab !== 'views' ? { color: 'var(--foreground)' } : {}}
                >
                  <Monitor className="h-5 w-5" />
                  <span>Vistas</span>
                </button>
              </nav>
            </div>

            {/* Contenido Principal */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-lg p-6">
                {/* Pestaña General */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                      Configuración General
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Idioma */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                          <Languages className="h-4 w-4 inline mr-2" />
                          Idioma
                        </label>
                        <select
                          value={settings.language}
                          onChange={(e) => updateSettings({ language: e.target.value as 'es' | 'en' })}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          style={{
                            backgroundColor: 'var(--input)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)'
                          }}
                        >
                          {languages.map(lang => (
                            <option key={lang.value} value={lang.value}>
                              {lang.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Zona Horaria */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                          <Clock className="h-4 w-4 inline mr-2" />
                          Zona Horaria
                        </label>
                        <select
                          value={settings.timezone}
                          onChange={(e) => updateSettings({ timezone: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          style={{
                            backgroundColor: 'var(--input)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)'
                          }}
                        >
                          {timezones.map(tz => (
                            <option key={tz.value} value={tz.value}>
                              {tz.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                          Hora actual: {new Date().toLocaleString('es-ES', { timeZone: settings.timezone })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pestaña Notificaciones */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                      Configuración de Notificaciones
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                            Notificaciones por Email
                          </h3>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            Recibir notificaciones importantes por correo electrónico
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.email}
                            onChange={(e) => updateNotificationSettings({ email: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                            Notificaciones Push
                          </h3>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            Recibir notificaciones en tiempo real en el navegador
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.push}
                            onChange={(e) => updateNotificationSettings({ push: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                            Recordatorios de Tareas
                          </h3>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            Notificaciones cuando las tareas estén próximas a vencer
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.taskReminders}
                            onChange={(e) => updateNotificationSettings({ taskReminders: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                            Actualizaciones de Proyectos
                          </h3>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            Notificaciones cuando se actualicen los proyectos
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.projectUpdates}
                            onChange={(e) => updateNotificationSettings({ projectUpdates: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                            Reportes Semanales
                          </h3>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            Recibir un resumen semanal de tu productividad
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.weeklyReports}
                            onChange={(e) => updateNotificationSettings({ weeklyReports: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pestaña Pantalla */}
                {activeTab === 'display' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                      Configuración de Pantalla
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                          Elementos por Página
                        </label>
                        <select
                          value={settings.display.itemsPerPage}
                          onChange={(e) => updateDisplaySettings({ itemsPerPage: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          style={{
                            backgroundColor: 'var(--input)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)'
                          }}
                        >
                          <option value={5}>5 elementos</option>
                          <option value={10}>10 elementos</option>
                          <option value={25}>25 elementos</option>
                          <option value={50}>50 elementos</option>
                          <option value={100}>100 elementos</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                            Mostrar Tareas Completadas
                          </h3>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            Incluir tareas completadas en las listas por defecto
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.display.showCompletedTasks}
                            onChange={(e) => updateDisplaySettings({ showCompletedTasks: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                            Actualización Automática
                          </h3>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            Actualizar datos automáticamente en segundo plano
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.display.autoRefresh}
                            onChange={(e) => updateDisplaySettings({ autoRefresh: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {settings.display.autoRefresh && (
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                            Intervalo de Actualización (minutos)
                          </label>
                          <select
                            value={settings.display.refreshInterval}
                            onChange={(e) => updateDisplaySettings({ refreshInterval: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-md text-sm"
                            style={{
                              backgroundColor: 'var(--input)',
                              borderColor: 'var(--border)',
                              color: 'var(--foreground)'
                            }}
                          >
                            <option value={1}>1 minuto</option>
                            <option value={5}>5 minutos</option>
                            <option value={10}>10 minutos</option>
                            <option value={15}>15 minutos</option>
                            <option value={30}>30 minutos</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pestaña Vistas */}
                {activeTab === 'views' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                      Vistas por Defecto
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                          Vista del Dashboard
                        </label>
                        <select
                          value={settings.defaultView.dashboard}
                          onChange={(e) => updateDefaultView({ dashboard: e.target.value as 'overview' | 'tasks' | 'projects' })}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          style={{
                            backgroundColor: 'var(--input)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)'
                          }}
                        >
                          <option value="overview">Resumen General</option>
                          <option value="tasks">Enfoque en Tareas</option>
                          <option value="projects">Enfoque en Proyectos</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                          Vista de Tareas
                        </label>
                        <select
                          value={settings.defaultView.tasks}
                          onChange={(e) => updateDefaultView({ tasks: e.target.value as 'list' | 'kanban' | 'calendar' })}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          style={{
                            backgroundColor: 'var(--input)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)'
                          }}
                        >
                          <option value="list">Lista</option>
                          <option value="kanban">Kanban</option>
                          <option value="calendar">Calendario</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                          Vista de Proyectos
                        </label>
                        <select
                          value={settings.defaultView.projects}
                          onChange={(e) => updateDefaultView({ projects: e.target.value as 'grid' | 'list' })}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          style={{
                            backgroundColor: 'var(--input)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)'
                          }}
                        >
                          <option value="grid">Cuadrícula</option>
                          <option value="list">Lista</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="flex justify-between items-center pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-2 px-4 py-2 text-sm border rounded-md hover:bg-muted transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Restablecer</span>
                  </button>
                  
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Restablecer Configuración"
        message="¿Estás seguro de que quieres restablecer todas las configuraciones a los valores por defecto? Esta acción no se puede deshacer."
        confirmText="Restablecer"
        cancelText="Cancelar"
        type="warning"
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
      />
    </div>
  );
}
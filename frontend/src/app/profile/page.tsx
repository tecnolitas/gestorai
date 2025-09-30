'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { apiService } from '@/services/api';
import { ArrowLeft, Home, User, Mail, Calendar, Settings, Eye, EyeOff, Save, Edit3, Camera } from 'lucide-react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
  avatar?: string;
}

interface PersonalStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  productivity: number;
  activeProjects: number;
  averageCompletionTime: number;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfileData();
    loadPersonalStats();
    loadThemePreference();
  }, []);

  const loadProfileData = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setProfile(userData);
      setProfileData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || ''
      });
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalStats = async () => {
    try {
      console.log('🔍 Cargando estadísticas personales...');
      
      // Obtener todas las tareas paginadas
      let allTasks: any[] = [];
      let nextUrl = 'http://localhost:8000/api/tasks/';
      
      while (nextUrl) {
        const response = await apiService.api.get(nextUrl);
        const data = response.data;
        
        if (data.results) {
          allTasks = [...allTasks, ...data.results];
        }
        
        nextUrl = data.next || null;
      }
      
      // Obtener todos los proyectos paginados
      let allProjects: any[] = [];
      nextUrl = 'http://localhost:8000/api/projects/';
      
      while (nextUrl) {
        const response = await apiService.api.get(nextUrl);
        const data = response.data;
        
        if (data.results) {
          allProjects = [...allProjects, ...data.results];
        }
        
        nextUrl = data.next || null;
      }
      
      console.log('📊 Datos obtenidos:', {
        tasks: allTasks.length,
        projects: allProjects.length,
        tasksData: allTasks.slice(0, 3), // Primeras 3 tareas para debug
        projectsData: allProjects.slice(0, 3) // Primeros 3 proyectos para debug
      });
      
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(task => task.completed).length;
      const pendingTasks = allTasks.filter(task => !task.completed).length;
      const overdueTasks = allTasks.filter(task => 
        !task.completed && task.due_date && new Date(task.due_date) < new Date()
      ).length;
      
      const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const activeProjects = allProjects.length; // Todos los proyectos del usuario
      
      // Calcular tiempo promedio de completado (simulado para tareas completadas)
      const completedTasksWithTime = allTasks.filter(task => 
        task.completed && task.created_at
      );
      
      const averageCompletionTime = completedTasksWithTime.length > 0 
        ? Math.round(completedTasksWithTime.reduce((acc, task) => {
            const created = new Date(task.created_at);
            const now = new Date();
            return acc + (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / completedTasksWithTime.length * 10) / 10
        : 0;

      console.log('📈 Estadísticas calculadas:', {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        productivity,
        activeProjects,
        averageCompletionTime
      });

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        productivity,
        activeProjects,
        averageCompletionTime
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const loadThemePreference = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    setTheme(savedTheme);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updatedUser = await apiService.updateProfile(profileData);
      setProfile(updatedUser);
      setEditing(false);
      showSuccess(
        'Perfil actualizado',
        'Tu información personal se ha actualizado correctamente',
        4000
      );
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      showError(
        'Error al actualizar',
        'No se pudo actualizar el perfil. Inténtalo de nuevo.',
        5000
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError(
        'Contraseñas no coinciden',
        'Las contraseñas nuevas no coinciden. Verifica e inténtalo de nuevo.',
        4000
      );
      return;
    }
    
    setSaving(true);
    try {
      await apiService.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showSuccess(
        'Contraseña cambiada',
        'Tu contraseña se ha actualizado correctamente',
        4000
      );
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      showError(
        'Error al cambiar contraseña',
        'No se pudo cambiar la contraseña. Verifica la contraseña actual.',
        5000
      );
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Aplicar tema inmediatamente
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', systemTheme);
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
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
                  Perfil
                </span>
              </div>
              
              <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                Mi Perfil
              </h1>
              <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
                Gestiona tu información personal y preferencias
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información Personal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Avatar y Información Básica */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start space-x-6">
                  <div className="relative">
                    <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
                      {profile?.avatar ? (
                        <img 
                          src={profile.avatar} 
                          alt="Avatar" 
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-blue-600" />
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                        {profile?.first_name} {profile?.last_name}
                      </h2>
                      <button
                        onClick={() => setEditing(!editing)}
                        className="flex items-center space-x-1 px-3 py-1 text-sm border rounded-md hover:bg-muted transition-colors"
                        style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>{editing ? 'Cancelar' : 'Editar'}</span>
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <Mail className="h-4 w-4" />
                        <span>{profile?.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <User className="h-4 w-4" />
                        <span>@{profile?.username}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <Calendar className="h-4 w-4" />
                        <span>Miembro desde {new Date(profile?.date_joined || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario de Edición */}
              {editing && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                    Información Personal
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={profileData.first_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
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
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={profileData.last_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        style={{
                          backgroundColor: 'var(--input)',
                          borderColor: 'var(--border)',
                          color: 'var(--foreground)'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      style={{
                        backgroundColor: 'var(--input)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)'
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-sm border rounded-md hover:bg-muted transition-colors"
                      style={{
                        backgroundColor: 'var(--muted)',
                        borderColor: 'var(--border)',
                        color: 'var(--muted-foreground)'
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saving ? 'Guardando...' : 'Guardar'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Cambio de Contraseña */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                  Cambiar Contraseña
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Contraseña Actual
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border rounded-md text-sm"
                        style={{
                          backgroundColor: 'var(--input)',
                          borderColor: 'var(--border)',
                          color: 'var(--foreground)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
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
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      style={{
                        backgroundColor: 'var(--input)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)'
                      }}
                    />
                  </div>
                  
                  <button
                    onClick={handleChangePassword}
                    disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Estadísticas Personales */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                  Mis Estadísticas
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Tareas Completadas</span>
                    <span className="font-semibold text-green-600">{stats?.completedTasks || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Tareas Pendientes</span>
                    <span className="font-semibold text-yellow-600">{stats?.pendingTasks || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Tareas Vencidas</span>
                    <span className="font-semibold text-red-600">{stats?.overdueTasks || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Productividad</span>
                    <span className="font-semibold text-blue-600">{stats?.productivity || 0}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Proyectos Activos</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{stats?.activeProjects || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Tiempo Promedio</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{stats?.averageCompletionTime || 0}d</span>
                  </div>
                </div>
              </div>

              {/* Preferencias de Tema */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                  Preferencias
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Tema
                    </label>
                    <select
                      value={theme}
                      onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      style={{
                        backgroundColor: 'var(--input)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)'
                      }}
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Oscuro</option>
                      <option value="system">Sistema</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                  Acciones
                </h3>
                
                <div className="space-y-3">
                  <Link href="/reports">
                    <button className="w-full px-4 py-2 text-sm border rounded-md hover:bg-muted transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                      Ver Mis Reportes
                    </button>
                  </Link>
                  
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

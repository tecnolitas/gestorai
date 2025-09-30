'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { ViewSelector } from '@/components/ViewSelector';
import { 
  Home, 
  FolderOpen, 
  CheckSquare, 
  BarChart3,
  Menu, 
  X, 
  LogOut, 
  Sun, 
  Moon,
  User,
  Settings
} from 'lucide-react';

export function Navigation() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isTasksPage = () => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/tasks');
    }
    return false;
  };

  return (
    <nav 
      id="navigation"
      className="border-b" 
      style={{ 
        backgroundColor: 'var(--card)', 
        borderColor: 'var(--border)' 
      }}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                TaskManager
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center space-x-2" aria-label="Ir al dashboard">
                <Home className="h-4 w-4" aria-hidden="true" />
                <span>Dashboard</span>
              </Button>
            </Link>
            
            <Link href="/projects">
              <Button variant="ghost" className="flex items-center space-x-2" aria-label="Ver proyectos">
                <FolderOpen className="h-4 w-4" aria-hidden="true" />
                <span>Proyectos</span>
              </Button>
            </Link>
            
            <Link href="/tasks">
              <Button variant="ghost" className="flex items-center space-x-2" aria-label="Ver tareas">
                <CheckSquare className="h-4 w-4" aria-hidden="true" />
                <span>Tareas</span>
              </Button>
            </Link>
            
            <Link href="/reports">
              <Button variant="ghost" className="flex items-center space-x-2" aria-label="Ver reportes">
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                <span>Reportes</span>
              </Button>
            </Link>

            {/* View Selector - Solo mostrar en páginas de tareas */}
            {isTasksPage() && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  Vista:
                </span>
                <ViewSelector />
              </div>
            )}
          </div>

          {/* Right side - Theme toggle and user menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center space-x-2"
              aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>

            {/* User Menu */}
            <div className="relative group">
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2"
                aria-label="Menú de usuario"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                <span>{user?.first_name || user?.username}</span>
              </Button>
              
              {/* Dropdown Menu */}
              <div 
                className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                role="menu"
                aria-label="Menú de usuario"
              >
                <div className="py-1">
                  <Link href="/profile">
                    <div 
                      className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted transition-colors cursor-pointer" 
                      style={{ color: 'var(--foreground)' }}
                      role="menuitem"
                      tabIndex={0}
                    >
                      <User className="h-4 w-4" aria-hidden="true" />
                      <span>Mi Perfil</span>
                    </div>
                  </Link>
                  <Link href="/settings">
                    <div 
                      className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted transition-colors cursor-pointer" 
                      style={{ color: 'var(--foreground)' }}
                      role="menuitem"
                      tabIndex={0}
                    >
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      <span>Configuración</span>
                    </div>
                  </Link>
                  <div className="border-t" style={{ borderColor: 'var(--border)' }}></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-muted transition-colors text-left"
                    style={{ color: 'var(--foreground)' }}
                    role="menuitem"
                    tabIndex={0}
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </div>


            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="md:hidden"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-col space-y-2">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              
              <Link href="/projects">
                <Button variant="ghost" className="w-full justify-start flex items-center space-x-2">
                  <FolderOpen className="h-4 w-4" />
                  <span>Proyectos</span>
                </Button>
              </Link>
              
              <Link href="/tasks">
                <Button variant="ghost" className="w-full justify-start flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4" />
                  <span>Tareas</span>
                </Button>
              </Link>
              
              <Link href="/reports">
                <Button variant="ghost" className="w-full justify-start flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Reportes</span>
                </Button>
              </Link>
              
              <Link href="/profile">
                <Button variant="ghost" className="w-full justify-start flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Mi Perfil</span>
                </Button>
              </Link>
              
              <Link href="/settings">
                <Button variant="ghost" className="w-full justify-start flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Configuración</span>
                </Button>
              </Link>

              {/* View Selector móvil - Solo mostrar en páginas de tareas */}
              {isTasksPage() && (
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Vista:
                    </span>
                  </div>
                  <ViewSelector className="w-full" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 
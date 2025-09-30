'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Project } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { FolderOpen, Calendar, User, Eye, Edit, Trash2 } from 'lucide-react';

interface ProjectGridProps {
  projects: Project[];
  onDelete: (projectId: number) => void;
  deletingId: number | null;
}

export const ProjectGrid = memo(function ProjectGrid({ 
  projects, 
  onDelete, 
  deletingId 
}: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="group shadow-lg rounded-xl overflow-hidden border transition-all duration-200 hover:shadow-xl hover:scale-[1.02]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          {/* Header con icono y acciones */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FolderOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate" style={{ color: 'var(--card-foreground)' }}>
                    {project.name}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    {project.owner?.first_name || project.owner?.username || 'Sin propietario'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Descripción */}
            <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: 'var(--muted-foreground)' }}>
              {project.description || 'Sin descripción'}
            </p>
          </div>
          
          {/* Footer con fecha y acciones */}
          <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <Calendar className="h-4 w-4" />
                <span>{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              
              {/* Botones de acción */}
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Link href={`/projects/${project.id}`} className="block">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 w-10 p-0 hover:scale-110 transition-all duration-200"
                    title="Ver proyecto"
                  >
                    <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </Button>
                </Link>
                <Link href={`/projects/${project.id}`} className="block">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 w-10 p-0 hover:scale-110 transition-all duration-200"
                    title="Editar proyecto"
                  >
                    <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(project.id)}
                  loading={deletingId === project.id}
                  className="h-10 w-10 p-0 hover:scale-110 transition-all duration-200"
                  title="Eliminar proyecto"
                >
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

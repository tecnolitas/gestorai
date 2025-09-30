'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Project } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { FolderOpen, Calendar, User, Eye, Edit, Trash2 } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  onDelete: (projectId: number) => void;
  deletingId: number | null;
}

export const ProjectList = memo(function ProjectList({ 
  projects, 
  onDelete, 
  deletingId 
}: ProjectListProps) {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="shadow rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--card)' }}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FolderOpen className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-medium" style={{ color: 'var(--card-foreground)' }}>
                    {project.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {project.description || 'Sin descripción'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <User className="h-4 w-4" />
                    <span>
                      {project.owner?.first_name || project.owner?.username || 'Sin propietario'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>Ver</span>
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDelete(project.id)}
                    loading={deletingId === project.id}
                    className="flex items-center space-x-1 hover:text-red-700"
                    style={{ color: 'var(--destructive)' }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

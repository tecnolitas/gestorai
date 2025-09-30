'use client';

import React, { memo } from 'react';
import { Project } from '@/types/api';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface RecentProjectsWidgetProps {
  projects: Project[];
  maxItems?: number;
}

export const RecentProjectsWidget = memo(function RecentProjectsWidget({ projects, maxItems = 5 }: RecentProjectsWidgetProps) {
  const recentProjects = projects.slice(0, maxItems);

  return (
    <div className="shadow rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-lg font-medium" style={{ color: 'var(--card-foreground)' }}>
          Proyectos Recientes
        </h3>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {recentProjects.map((project) => (
          <div key={project.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>
                  {project.name}
                </h4>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {project.description}
                </p>
              </div>
              <Link href={`/projects/${project.id}`}>
                <Button variant="ghost" size="sm">
                  Ver
                </Button>
              </Link>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="px-6 py-4 text-center" style={{ color: 'var(--muted-foreground)' }}>
            No hay proyectos creados aún
          </div>
        )}
      </div>
    </div>
  );
}); 
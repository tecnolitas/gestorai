'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export function QuickActionsWidget() {
  return (
    <div className="flex flex-wrap gap-4">
      <Link href="/projects/new">
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo Proyecto</span>
        </Button>
      </Link>
      <Link href="/tasks/new">
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nueva Tarea</span>
        </Button>
      </Link>
    </div>
  );
} 
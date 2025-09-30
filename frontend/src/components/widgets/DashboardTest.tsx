'use client';

import React, { useState } from 'react';
import { DraggableDashboard } from './DraggableDashboard';

export function DashboardTest() {
  const [showTest, setShowTest] = useState(false);

  const mockStats = {
    totalProjects: 5,
    totalTasks: 25,
    completedTasks: 15,
    pendingTasks: 10,
  };

  const mockProjects = [
    { id: 1, name: 'Proyecto Test 1', description: 'Descripción del proyecto' },
    { id: 2, name: 'Proyecto Test 2', description: 'Descripción del proyecto' },
  ];

  const mockTasks = [
    { id: 1, title: 'Tarea Test 1', completed: false, project: { name: 'Proyecto 1' } },
    { id: 2, title: 'Tarea Test 2', completed: true, project: { name: 'Proyecto 2' } },
  ];

  if (!showTest) {
    return (
      <div className="p-4">
        <button
          onClick={() => setShowTest(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Probar Dashboard Personalizable
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-md mb-4">
        <h3 className="font-bold text-yellow-800">🧪 Modo Prueba - Dashboard Personalizable</h3>
        <p className="text-yellow-700">
          Este es un componente de prueba para verificar la funcionalidad de drag & drop.
          Haz clic en "Editar layout" para poder arrastrar y redimensionar los widgets.
        </p>
        <button
          onClick={() => setShowTest(false)}
          className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
        >
          Cerrar Prueba
        </button>
      </div>
      
      <DraggableDashboard
        stats={mockStats}
        projects={mockProjects}
        tasks={mockTasks}
        onToggleTaskComplete={(id) => console.log('Toggle task:', id)}
        onLayoutChange={(layout) => console.log('Layout changed to:', layout)}
      />
    </div>
  );
}

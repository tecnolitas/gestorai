'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardTest } from '@/components/widgets/DashboardTest';

export default function TestDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <DashboardTest />
        </div>
      </div>
    </ProtectedRoute>
  );
}

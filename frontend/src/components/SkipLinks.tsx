'use client';

import React from 'react';
import Link from 'next/link';

export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <Link 
        href="#main-content" 
        className="absolute top-2 left-2 z-50 px-4 py-2 bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Saltar al contenido principal
      </Link>
      <Link 
        href="#navigation" 
        className="absolute top-2 left-48 z-50 px-4 py-2 bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Saltar a la navegación
      </Link>
    </div>
  );
}

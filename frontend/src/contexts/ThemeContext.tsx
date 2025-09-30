'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function useThemeContext() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
    console.log('ThemeContext mounted. Theme:', theme, 'Resolved:', resolvedTheme, 'IsDark:', isDark);
  }, [theme, resolvedTheme, isDark]);

  const toggleTheme = () => {
    console.log('Toggle theme clicked. Current theme:', theme, 'resolvedTheme:', resolvedTheme, 'isDark:', isDark);
    const newTheme = isDark ? 'light' : 'dark';
    console.log('Setting theme to:', newTheme);
    setTheme(newTheme);
  };

  const ThemeToggle = () => {
    if (!mounted) {
      return (
        <button
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          disabled
        >
          <div className="h-5 w-5 animate-pulse bg-gray-300 dark:bg-gray-600 rounded"></div>
        </button>
      );
    }

    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors ${
          isDark 
            ? 'bg-gray-800 hover:bg-gray-700' 
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
        aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-gray-600" />
        )}
      </button>
    );
  };

  return {
    theme: theme || 'light',
    setTheme,
    isDark,
    toggleTheme,
    ThemeToggle,
    mounted
  };
} 
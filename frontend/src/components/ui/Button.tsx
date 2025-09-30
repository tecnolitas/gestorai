import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'text-white',
    secondary: 'text-gray-900 dark:text-gray-100',
    danger: 'text-white',
    ghost: 'text-gray-700 dark:text-gray-300'
  };

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          ':hover': { backgroundColor: 'var(--primary)' }
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--secondary)',
          color: 'var(--secondary-foreground)',
          ':hover': { backgroundColor: 'var(--secondary)' }
        };
      case 'danger':
        return {
          backgroundColor: 'var(--destructive)',
          color: 'var(--destructive-foreground)',
          ':hover': { backgroundColor: 'var(--destructive)' }
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--foreground)',
          ':hover': { backgroundColor: 'var(--accent)' }
        };
      default:
        return {};
    }
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg'
  };

  const variantStyles = getVariantStyles(variant);
  
  return (
    <button
      className={clsx(
        baseClasses,
        sizes[size],
        className
      )}
      style={variantStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}; 
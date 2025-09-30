import React, { useId } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedby, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
          {label}
          {ariaRequired && <span className="text-red-500 ml-1" aria-label="requerido">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          className
        )}
        style={{
          borderColor: error ? 'var(--destructive)' : 'var(--border)',
          color: 'var(--foreground)',
          backgroundColor: 'var(--input)',
          '::placeholder': { color: 'var(--muted-foreground)' }
        }}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-invalid={ariaInvalid || !!error}
        aria-required={ariaRequired}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm" style={{ color: 'var(--destructive)' }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
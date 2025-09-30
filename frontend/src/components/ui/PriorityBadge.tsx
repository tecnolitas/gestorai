import React from 'react';
import { clsx } from 'clsx';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          label: 'Alta',
          style: {
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            borderColor: 'rgba(239, 68, 68, 0.2)'
          }
        };
      case 'medium':
        return {
          label: 'Media',
          style: {
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            color: '#d97706',
            borderColor: 'rgba(245, 158, 11, 0.2)'
          }
        };
      case 'low':
        return {
          label: 'Baja',
          style: {
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: '#16a34a',
            borderColor: 'rgba(34, 197, 94, 0.2)'
          }
        };
      default:
        return {
          label: 'Media',
          style: {
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            color: '#d97706',
            borderColor: 'rgba(245, 158, 11, 0.2)'
          }
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        className
      )}
      style={config.style}
    >
      {config.label}
    </span>
  );
}; 
// src/components/ui/EmptyState.tsx
import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white border border-borderColor rounded-md ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-gray-50 border border-borderColor text-gray-400 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-textPrimary">{title}</h3>
      <p className="mt-1 text-xs text-textSecondary max-w-sm">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 px-3 py-1.5 text-xs font-semibold text-white bg-brandNavy rounded-md hover:bg-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brandNavy"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

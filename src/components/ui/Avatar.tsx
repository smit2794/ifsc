// src/components/ui/Avatar.tsx
import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  role?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  role,
  className = '',
}) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-brandNavy text-white font-semibold select-none shrink-0 ${sizeClasses} ${className}`}
      title={`${name}${role ? ` (${role})` : ''}`}
      aria-label={name}
    >
      <span>{initials || 'U'}</span>
    </div>
  );
};

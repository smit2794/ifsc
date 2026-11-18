// src/components/ui/Skeleton.tsx
import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'table' | 'ring' | 'button';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  if (variant === 'card') {
    return (
      <div
        className={`bg-white border border-borderColor rounded-md p-4 animate-pulse space-y-3 ${className}`}
        style={{ width, height }}
      >
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="h-2 bg-gray-100 rounded w-full"></div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        className={`bg-white border border-borderColor rounded-md p-4 animate-pulse space-y-2 ${className}`}
        style={{ width, height }}
      >
        <div className="h-6 bg-gray-200 rounded w-full mb-4"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 bg-gray-100 rounded w-full"></div>
        ))}
      </div>
    );
  }

  if (variant === 'ring') {
    return (
      <div
        className={`rounded-full border-4 border-gray-200 animate-pulse ${className}`}
        style={{ width: width || 80, height: height || 80 }}
      />
    );
  }

  return (
    <div
      className={`bg-gray-200 animate-pulse rounded ${className}`}
      style={{
        width: width || '100%',
        height: height || (variant === 'button' ? '32px' : '16px'),
      }}
    />
  );
};

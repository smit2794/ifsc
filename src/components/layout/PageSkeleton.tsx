// src/components/layout/PageSkeleton.tsx
import React from 'react';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6 animate-pulse" aria-busy="true" aria-label="Loading page content">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-48"></div>
        <div className="h-8 bg-gray-200 rounded w-72"></div>
      </div>

      {/* KPI Row skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white border border-borderColor rounded-md p-4 space-y-3">
            <div className="h-3.5 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>

      {/* Content panel skeleton */}
      <div className="bg-white border border-borderColor rounded-md p-6 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-36"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
          <div className="h-4 bg-gray-100 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

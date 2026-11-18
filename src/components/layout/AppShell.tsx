// src/components/layout/AppShell.tsx
import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { PageSkeleton } from './PageSkeleton';
import { FloatingAIAssistant } from './FloatingAIAssistant';
import { useScrollToTop } from '../../hooks/useScrollToTop';

export const AppShell: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useScrollToTop();

  return (
    <div className="min-h-screen bg-bgPage text-textPrimary flex">
      {/* Sidebar navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main layout container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'pl-16' : 'pl-60'
        }`}
      >
        {/* Sticky TopBar */}
        <TopBar sidebarCollapsed={sidebarCollapsed} />

        {/* Page Content area */}
        <main className="flex-1 mt-16 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto" id="main-content">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>

        {/* Global Floating AI Copilot Assistant */}
        <FloatingAIAssistant />
      </div>
    </div>
  );
};

// src/components/ui/Tabs.tsx
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface TabItem {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  paramKey?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab = tabs[0]?.value,
  paramKey = 'tab',
  className = '',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get(paramKey) || defaultTab;

  // Invalid tab fallback to defaultTab
  useEffect(() => {
    const tabParam = searchParams.get(paramKey);
    if (tabParam && !tabs.some((t) => t.value === tabParam)) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set(paramKey, defaultTab);
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, paramKey, tabs, defaultTab, setSearchParams]);

  const handleTabClick = (val: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(paramKey, val);
    setSearchParams(nextParams);
  };

  return (
    <div className={`border-b border-borderColor overflow-x-auto ${className}`}>
      <nav className="flex space-x-4 min-w-max" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.value;
          const Icon = tab.icon;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabClick(tab.value)}
              className={`flex items-center gap-2 py-2.5 px-1 border-b-2 font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-brandNavy ${
                isActive
                  ? 'border-brandNavy text-brandNavy'
                  : 'border-transparent text-textSecondary hover:text-textPrimary hover:border-gray-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brandNavy' : 'text-gray-400'}`} />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums font-bold ${
                    isActive ? 'bg-blue-100 text-brandNavy' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

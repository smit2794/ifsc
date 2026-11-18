// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  BookOpenCheck,
  Users,
  Briefcase,
  ShieldCheck,
  AlertTriangle,
  Server,
  MessageSquareWarning,
  FileText,
  Archive,
  Sparkles,
  Cpu,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Component,
} from 'lucide-react';
import { buildLink } from '../../utils/buildLink';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export interface NavItem {
  number: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { number: '01', label: 'Command Centre', path: '/', icon: LayoutDashboard },
  { number: '02', label: 'Today / Tasks', path: '/tasks', icon: CheckSquare },
  { number: '03', label: 'Obligations', path: '/obligations', icon: BookOpenCheck },
  { number: '04', label: 'Governance & People', path: '/governance', icon: Users },
  { number: '05', label: 'Client & Case Workspace', path: '/clients', icon: Briefcase },
  { number: '06', label: 'Operational Controls', path: '/controls', icon: ShieldCheck },
  { number: '07', label: 'Incidents', path: '/incidents', icon: AlertTriangle },
  { number: '08', label: 'Cyber & Vendors', path: '/cyber-vendors', icon: Server },
  { number: '09', label: 'Complaints', path: '/complaints', icon: MessageSquareWarning },
  { number: '10', label: 'Reports & Calendar', path: '/reports', icon: FileText },
  { number: '11', label: 'Audit Evidence Room', path: '/evidence', icon: Archive },
  { number: '12', label: 'AI Investigations', path: '/ai', icon: Sparkles },
  { number: '13', label: 'System Integrations', path: '/integrations', icon: Cpu },
  { number: '14', label: 'Admin & Policies', path: '/admin', icon: Settings },
  { number: '15', label: 'Metrics & History', path: '/metrics', icon: BarChart3 },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 bg-white border-r border-borderColor z-30 transition-all duration-200 flex flex-col ${
        collapsed ? 'w-16' : 'w-60'
      }`}
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-borderColor justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-brandNavy text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-teal-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-brandNavy truncate">
                IFSC TrustOps
              </span>
              <span className="text-[10px] text-textSecondary uppercase tracking-wider font-medium truncate">
                Governance & Control
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-textPrimary transition-colors focus:outline-none focus:ring-2 focus:ring-brandNavy"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" aria-label="Sidebar Menu">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const targetLink = buildLink(item.path);

          return (
            <NavLink
              key={item.path}
              to={targetLink}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-all group focus:outline-none focus:ring-2 focus:ring-brandNavy ${
                  isActive
                    ? 'bg-brandNavy text-white shadow-sm'
                    : 'text-textSecondary hover:bg-gray-100 hover:text-textPrimary'
                }`
              }
              title={collapsed ? `${item.number} ${item.label}` : undefined}
              aria-label={`${item.number} ${item.label}`}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-teal-300' : 'text-gray-500 group-hover:text-brandNavy'
                    }`}
                  />
                  {!collapsed && (
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`text-[10px] font-mono shrink-0 ${
                          isActive ? 'text-teal-200' : 'text-gray-400'
                        }`}
                      >
                        {item.number}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Institution info & Component Gallery shortcut */}
      {!collapsed ? (
        <div className="p-3 border-t border-borderColor bg-gray-50 text-[11px] text-textSecondary shrink-0 space-y-2">
          <div>
            <p className="font-semibold text-textPrimary truncate">
              Meridian Securities IFSC
            </p>
            <p className="truncate text-gray-500">GIFT City, Gandhinagar</p>
          </div>
          {/* Temporary development link - removed before Phase 9 */}
          <Link
            to={buildLink('/_components')}
            className="flex items-center gap-1.5 pt-1.5 border-t border-borderColor/80 text-[10px] text-brandNavy font-semibold hover:underline"
          >
            <Component className="w-3.5 h-3.5" />
            <span>Component Gallery (Dev)</span>
          </Link>
        </div>
      ) : (
        <div className="p-2 border-t border-borderColor flex justify-center">
          <Link
            to={buildLink('/_components')}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-brandNavy"
            title="Component Gallery (Dev)"
            aria-label="Component Gallery"
          >
            <Component className="w-4 h-4" />
          </Link>
        </div>
      )}
    </aside>
  );
};

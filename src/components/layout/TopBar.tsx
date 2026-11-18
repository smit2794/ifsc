// src/components/layout/TopBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  User,
  Shield,
  Building2,
} from 'lucide-react';
import { buildLink } from '../../utils/buildLink';
import { formatTimeIST } from '../../utils/dateHelpers';
import { useTicker } from '../../hooks/useTicker';
import { UniversalSearch } from './UniversalSearch';
import {
  useCurrentUser,
  useNotifications,
  useIntegrations,
  useAppStore,
} from '../../store';
import { NotificationItem } from '../../types';

interface TopBarProps {
  sidebarCollapsed: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ sidebarCollapsed }) => {
  useTicker(); // keeps live freshness updated
  const [searchOpen, setSearchOpen] = useState(false);
  const [freshnessOpen, setFreshnessOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const currentUser = useCurrentUser();
  const notifications = useNotifications();
  const integrations = useIntegrations();
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);

  const freshnessRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (freshnessRef.current && !freshnessRef.current.contains(event.target as Node)) {
        setFreshnessOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const now = new Date();

  const getNotificationLink = (n: NotificationItem) => {
    switch (n.targetType) {
      case 'CONTROLS':
        return buildLink('/controls', n.targetParams || (n.targetId ? { control: n.targetId } : undefined));
      case 'INCIDENTS':
        return n.targetId ? buildLink(`/incidents/${n.targetId}`) : buildLink('/incidents');
      case 'INTEGRATIONS':
        return buildLink('/integrations', n.targetParams);
      case 'OBLIGATIONS':
        return buildLink('/obligations', n.targetParams || (n.targetId ? { obligation: n.targetId } : undefined));
      case 'CYBER_VENDORS':
        return buildLink('/cyber-vendors', n.targetParams);
      case 'AI':
        return buildLink('/ai', n.targetParams);
      default:
        return buildLink('/');
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white border-b border-borderColor z-20 transition-all duration-200 flex items-center justify-between px-4 sm:px-6 ${
        sidebarCollapsed ? 'left-16' : 'left-60'
      }`}
      aria-label="Top Header"
    >
      {/* Left: Institution and status badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brandNavy hidden sm:inline shrink-0" />
          <span className="font-semibold text-xs sm:text-sm text-textPrimary tracking-tight truncate max-w-[200px] sm:max-w-none">
            Meridian Securities IFSC Limited
          </span>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-brandNavy border border-blue-200 shrink-0">
          Broker Dealer
        </span>
      </div>

      {/* Center: Universal Search Shell */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="w-full relative flex items-center justify-between pl-9 pr-3 py-1.5 bg-bgPage hover:bg-gray-100/80 border border-borderColor rounded-md text-xs text-textSecondary transition-all text-left shadow-2xs"
          aria-label="Open universal search (Cmd+K)"
        >
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <span>Search controls, obligations, cases, incidents, evidence...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold text-textSecondary bg-white border border-borderColor px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Data Freshness Indicator */}
        <div className="relative" ref={freshnessRef}>
          <button
            type="button"
            onClick={() => setFreshnessOpen(!freshnessOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-gray-100 text-textSecondary text-xs transition-colors border border-borderColor focus:outline-none focus:ring-2 focus:ring-brandNavy"
            aria-expanded={freshnessOpen}
            aria-label="Data Freshness status"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline font-medium text-[11px]">Feeds Active</span>
            <Activity className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Freshness Popover */}
          {freshnessOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-modal border border-borderColor p-3 text-xs z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-borderColor">
                <span className="font-semibold text-textPrimary">Connector Freshness</span>
                <span className="text-[10px] text-textSecondary tabular-nums">
                  {formatTimeIST(now)}
                </span>
              </div>
              <ul className="space-y-2 mb-3">
                {integrations.slice(0, 5).map((conn) => (
                  <li key={conn.id} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-textSecondary">
                      {conn.status === 'HEALTHY' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span className="truncate max-w-[150px]">{conn.name}</span>
                    </span>
                    <span
                      className={`text-[10px] font-medium ${
                        conn.status === 'HEALTHY'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {conn.status}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to={buildLink('/integrations')}
                onClick={() => setFreshnessOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 text-center text-xs font-medium text-brandNavy bg-blue-50 hover:bg-blue-100 rounded transition-colors"
              >
                <span>Manage System Integrations</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-textPrimary transition-colors relative focus:outline-none focus:ring-2 focus:ring-brandNavy"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-modal border border-borderColor p-3 text-xs z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-borderColor">
                <span className="font-semibold text-textPrimary">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllNotificationsRead()}
                    className="text-[11px] text-brandNavy font-medium hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    to={getNotificationLink(notif)}
                    onClick={() => setNotificationsOpen(false)}
                    className={`block p-2 rounded border transition-all ${
                      notif.read
                        ? 'bg-white border-transparent hover:bg-gray-50'
                        : 'bg-blue-50/40 border-blue-100 hover:bg-blue-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className={`font-medium ${notif.read ? 'text-textPrimary' : 'text-brandNavy'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brandNavy shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-textSecondary mt-0.5">{notif.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Chip Menu */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-md hover:bg-gray-100 transition-colors border border-transparent hover:border-borderColor focus:outline-none focus:ring-2 focus:ring-brandNavy"
            aria-expanded={userMenuOpen}
            aria-label="User Profile menu"
          >
            <div className="w-7 h-7 rounded-full bg-brandNavy text-white flex items-center justify-center font-semibold text-xs shrink-0">
              {currentUser.avatarInitials}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-semibold text-textPrimary leading-none">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-textSecondary leading-none mt-1">
                {currentUser.role}
              </p>
            </div>
          </button>

          {/* User Profile Card Popover */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-modal border border-borderColor p-4 text-xs z-50">
              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-borderColor">
                <div className="w-10 h-10 rounded-full bg-brandNavy text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {currentUser.avatarInitials}
                </div>
                <div>
                  <h4 className="font-bold text-textPrimary text-sm">{currentUser.name}</h4>
                  <p className="text-textSecondary text-xs">{currentUser.role}</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                    <Shield className="w-3 h-3" /> IFSC Registered
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-[11px] text-textSecondary">
                <div>
                  <span className="font-medium text-textPrimary">Institution: </span>
                  Meridian Securities IFSC Limited
                </div>
                <div>
                  <span className="font-medium text-textPrimary">Jurisdiction: </span>
                  GIFT IFSC, Gandhinagar
                </div>
                <div>
                  <span className="font-medium text-textPrimary">Authority Scope: </span>
                  Compliance & Regulatory Assurance
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-borderColor flex gap-2">
                <Link
                  to={buildLink('/admin')}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex-1 py-1.5 text-center text-xs font-medium text-brandNavy bg-gray-50 hover:bg-gray-100 rounded border border-borderColor transition-colors"
                >
                  <User className="w-3 h-3 inline mr-1" />
                  Preferences
                </Link>
                <Link
                  to={buildLink('/governance', { tab: 'officers' })}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex-1 py-1.5 text-center text-xs font-medium text-brandNavy bg-gray-50 hover:bg-gray-100 rounded border border-borderColor transition-colors"
                >
                  Profile
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Universal Search Modal (Cmd+K) */}
      <UniversalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

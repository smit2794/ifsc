// src/components/ui/DetailDrawer.tsx
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { buildLink } from '../../utils/buildLink';

interface DetailDrawerProps {
  paramKey: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
  footer?: React.ReactNode;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  paramKey,
  title,
  subtitle,
  children,
  width = 'w-full sm:max-w-md lg:max-w-lg',
  footer,
}) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);

  const isOpen = Boolean(searchParams.get(paramKey));

  const handleClose = () => {
    const nextParams: Record<string, string | null> = {};
    searchParams.forEach((val, key) => {
      nextParams[key] = val;
    });
    nextParams[paramKey] = null; // remove only this parameter
    navigate(buildLink(location.pathname, nextParams), { replace: true });
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 overflow-hidden bg-black/25 backdrop-blur-[1px] animate-in fade-in duration-150"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className={`fixed inset-y-0 right-0 ${width} bg-white border-l border-borderColor shadow-modal flex flex-col z-50 animate-in slide-in-from-right duration-200`}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-borderColor flex items-center justify-between shrink-0 bg-gray-50/50">
          <div>
            <h3 className="text-sm font-bold text-textPrimary">{title}</h3>
            {subtitle && (
              <p className="text-[11px] text-textSecondary mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brandNavy"
            aria-label="Close detail drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs text-textPrimary space-y-4">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-4 border-t border-borderColor bg-gray-50 flex items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

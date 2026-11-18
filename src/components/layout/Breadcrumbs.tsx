// src/components/layout/Breadcrumbs.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { buildLink } from '../../utils/buildLink';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const ROUTE_LABELS: Record<string, string> = {
  '': 'Command Centre',
  'tasks': 'Tasks & Today',
  'obligations': 'Obligations',
  'governance': 'Governance & People',
  'clients': 'Client & Case Workspace',
  'cases': 'Cases',
  'controls': 'Operational Controls',
  'incidents': 'Incidents',
  'cyber-vendors': 'Cyber & Vendors',
  'complaints': 'Complaints',
  'reports': 'Reports & Calendar',
  'evidence': 'Audit Evidence Room',
  'ai': 'AI Investigations',
  'integrations': 'System Integrations',
  'admin': 'Admin & Policies',
  'metrics': 'Metrics & History',
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const location = useLocation();

  const generatedItems = React.useMemo(() => {
    if (items && items.length > 0) return items;

    const segments = location.pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [
      { label: 'Command Centre', path: buildLink('/') },
    ];

    let currentPath = '';
    segments.forEach((seg, idx) => {
      currentPath += `/${seg}`;
      const isLast = idx === segments.length - 1;
      const label = ROUTE_LABELS[seg] || seg.toUpperCase();
      crumbs.push({
        label,
        path: isLast ? undefined : buildLink(currentPath),
      });
    });

    return crumbs;
  }, [items, location.pathname]);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-textSecondary mb-3">
      <ol className="flex items-center space-x-1.5 flex-wrap">
        {generatedItems.map((crumb, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === generatedItems.length - 1;

          return (
            <li key={idx} className="flex items-center space-x-1.5">
              {!isFirst && (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden="true" />
              )}
              {isFirst && (
                <Home className="w-3.5 h-3.5 mr-1 text-gray-500 inline shrink-0" aria-hidden="true" />
              )}
              {crumb.path && !isLast ? (
                <Link
                  to={crumb.path}
                  className="hover:text-brandNavy transition-colors font-medium hover:underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-textPrimary font-semibold" aria-current={isLast ? 'page' : undefined}>
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

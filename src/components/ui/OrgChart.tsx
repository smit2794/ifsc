// src/components/ui/OrgChart.tsx
import React from 'react';
import { User, Shield } from 'lucide-react';

export interface OrgNode {
  id: string;
  name: string;
  role: string;
  department: string;
  isOfficer?: boolean;
  officerRole?: string;
  children?: OrgNode[];
}

interface OrgChartProps {
  data: OrgNode;
  onNodeClick?: (node: OrgNode) => void;
  className?: string;
}

const OrgTreeNode: React.FC<{
  node: OrgNode;
  onNodeClick?: (node: OrgNode) => void;
}> = ({ node, onNodeClick }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        onClick={() => onNodeClick?.(node)}
        className="w-56 p-3 bg-white border border-borderColor rounded-md shadow-card hover:border-brandNavy hover:shadow-md cursor-pointer transition-all text-center z-10"
      >
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <div className="w-6 h-6 rounded-full bg-blue-50 text-brandNavy flex items-center justify-center shrink-0">
            {node.isOfficer ? <Shield className="w-3.5 h-3.5 text-teal-600" /> : <User className="w-3.5 h-3.5" />}
          </div>
          <span className="font-bold text-xs text-textPrimary truncate">{node.name}</span>
        </div>
        <p className="text-[11px] font-semibold text-brandNavy truncate">{node.role}</p>
        <p className="text-[10px] text-textSecondary truncate">{node.department}</p>
        {node.officerRole && (
          <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
            {node.officerRole}
          </span>
        )}
      </div>

      {/* Children branches */}
      {node.children && node.children.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-4 bg-gray-300" />
          <div className="flex gap-4 relative pt-2">
            {node.children.length > 1 && (
              <div className="absolute top-2 left-28 right-28 h-0.5 bg-gray-300" />
            )}
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center relative">
                <div className="w-0.5 h-2 bg-gray-300" />
                <OrgTreeNode node={child} onNodeClick={onNodeClick} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const OrgChart: React.FC<OrgChartProps> = ({ data, onNodeClick, className = '' }) => {
  return (
    <div className={`p-4 bg-gray-50/50 border border-borderColor rounded-md overflow-x-auto ${className}`}>
      <div className="min-w-max flex justify-center py-4">
        <OrgTreeNode node={data} onNodeClick={onNodeClick} />
      </div>
    </div>
  );
};

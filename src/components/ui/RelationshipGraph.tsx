// src/components/ui/RelationshipGraph.tsx
import React, { useState, useRef } from 'react';
import { ShieldCheck, BookOpen, Layers, Cpu, Archive, AlertCircle, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

export type NodeKind = 'REGULATION' | 'OBLIGATION' | 'CONTROL' | 'SYSTEM' | 'EVIDENCE' | 'CASE';

export interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  status?: string;
  description?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

interface RelationshipGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
  className?: string;
}

const KIND_COLORS: Record<NodeKind, { bg: string; border: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  REGULATION: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', icon: BookOpen },
  OBLIGATION: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', icon: Layers },
  CONTROL: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', icon: ShieldCheck },
  SYSTEM: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', icon: Cpu },
  EVIDENCE: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-800', icon: Archive },
  CASE: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-800', icon: AlertCircle },
};

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({
  nodes,
  edges,
  onNodeClick,
  className = '',
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Zoom and Pan states
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialPanX: number; initialPanY: number }>({
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
  });

  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 1.8));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.6));
  const handleResetZoomPan = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag when clicking background or moving
    if ((e.target as HTMLElement).closest('.interactive-node')) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    setPan({
      x: dragStartRef.current.initialPanX + deltaX,
      y: dragStartRef.current.initialPanY + deltaY,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleSelect = (node: GraphNode) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  };

  // Group nodes by kind for clean layout lanes
  const columns: NodeKind[] = ['REGULATION', 'OBLIGATION', 'CONTROL', 'SYSTEM', 'EVIDENCE', 'CASE'];

  return (
    <div className={`p-4 bg-white border border-borderColor rounded-md shadow-card space-y-4 ${className}`}>
      {/* Top Header & Zoom/Pan Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-borderColor text-[11px]">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-textPrimary">Entity Lineage:</span>
          {columns.map((kind) => {
            const cfg = KIND_COLORS[kind];
            const Icon = cfg.icon;
            return (
              <span
                key={kind}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${cfg.bg} ${cfg.border} ${cfg.text} font-medium`}
              >
                <Icon className="w-3 h-3" />
                <span>{kind}</span>
              </span>
            );
          })}
        </div>

        {/* Zoom & Pan Toolbar */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-borderColor rounded p-1">
          <span className="text-[10px] text-textSecondary flex items-center gap-1 px-1 font-mono">
            <Move className="w-3 h-3" /> Drag to Pan
          </span>
          <div className="h-3 w-px bg-borderColor" />
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 hover:bg-gray-200 rounded text-gray-700 transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono px-1 font-semibold text-textPrimary min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 hover:bg-gray-200 rounded text-gray-700 transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoomPan}
            className="p-1 hover:bg-gray-200 rounded text-gray-700 transition-colors ml-0.5"
            title="Reset Zoom & Pan"
            aria-label="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Pan & Zoom Canvas */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`overflow-hidden border border-borderColor rounded-md bg-slate-50/50 p-4 relative min-h-[320px] select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="grid grid-cols-6 gap-3 min-w-[960px] text-xs"
        >
          {columns.map((kind) => {
            const laneNodes = nodes.filter((n) => n.kind === kind);
            const cfg = KIND_COLORS[kind];

            return (
              <div key={kind} className="space-y-2">
                <div className={`p-2 rounded font-bold text-center border ${cfg.bg} ${cfg.border} ${cfg.text} uppercase tracking-wider text-[10px]`}>
                  {kind} ({laneNodes.length})
                </div>

                <div className="space-y-2 min-h-[200px] p-1.5 bg-white/80 rounded border border-borderColor/60 shadow-inner">
                  {laneNodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const Icon = cfg.icon;

                    return (
                      <div
                        key={node.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(node);
                        }}
                        className={`interactive-node p-2.5 rounded border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-brandNavy ring-2 ring-brandNavy shadow-sm'
                            : 'bg-white border-borderColor hover:border-gray-400 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
                          <span className="font-bold text-textPrimary truncate">{node.id}</span>
                        </div>
                        <p className="text-[11px] text-textSecondary line-clamp-2 leading-snug">
                          {node.label}
                        </p>
                        {node.status && (
                          <span className="inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">
                            {node.status}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connected Edges info if a node is selected */}
      {selectedNode && (
        <div className="p-3 bg-blue-50/40 border border-blue-200 rounded text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold text-brandNavy">Selected Lineage Node: </span>
            <span className="font-semibold text-textPrimary">{selectedNode.id}</span> — {selectedNode.label}
          </div>
          <div className="text-[11px] text-textSecondary">
            {edges.filter((e) => e.from === selectedNode.id || e.to === selectedNode.id).length} direct relationships mapped
          </div>
        </div>
      )}
    </div>
  );
};

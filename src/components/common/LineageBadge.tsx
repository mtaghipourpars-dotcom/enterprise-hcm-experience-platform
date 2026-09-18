// ============================================================================
// Lineage Badge Component
// Interactive pill displaying Service Code, Domain, and SAP Source Tables
// Allows clicking to view the 8-tier Traceability Pipeline or Lineage modal
// ============================================================================

import React from 'react';
import { Database, GitCommit, ShieldCheck } from 'lucide-react';

interface LineageBadgeProps {
  serviceCode: string;
  sapSources?: string[];
  canonicalEntity?: string;
  onClick?: (serviceCode: string) => void;
  className?: string;
}

export const LineageBadge: React.FC<LineageBadgeProps> = ({
  serviceCode,
  sapSources = [],
  canonicalEntity,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(serviceCode);
      }}
      title={`Traceability Lineage: ${serviceCode} → Click to inspect 8-tier chain`}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono font-medium bg-slate-800/90 text-blue-300 border border-slate-700 hover:bg-slate-700 hover:border-blue-500 transition-all cursor-pointer shadow-sm ${className}`}
    >
      <GitCommit className="w-3 h-3 text-blue-400" />
      <span className="font-semibold text-slate-200">{serviceCode}</span>
      {sapSources.length > 0 && (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60">
          <Database className="w-2.5 h-2.5 text-blue-400" />
          {sapSources.slice(0, 2).join(', ')}
          {sapSources.length > 2 && ` +${sapSources.length - 2}`}
        </span>
      )}
    </button>
  );
};

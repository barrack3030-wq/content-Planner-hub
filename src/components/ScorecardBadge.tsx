import React from 'react';
import { ContentStatus, WeeklyOverallStatus } from '../types/content';

interface StatusBadgeProps {
  status: ContentStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyles = () => {
    switch (status) {
      case 'Published':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Ready':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Production':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Planned':
        return 'text-slate-700 bg-slate-100 border-slate-200';
      case 'Idea':
      default:
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium border rounded ${pad} ${getStyles()}`}>
      {status}
    </span>
  );
};

export const OverallStatusBadge: React.FC<{ status: WeeklyOverallStatus }> = ({ status }) => {
  switch (status) {
    case 'Complete':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          Complete
        </span>
      );
    case 'On Track':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          On Track
        </span>
      );
    case 'Needs Attention':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
          Needs Attention
        </span>
      );
    case 'Missing':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <span className="w-2 h-2 rounded-full bg-rose-600"></span>
          Missing Targets
        </span>
      );
  }
};

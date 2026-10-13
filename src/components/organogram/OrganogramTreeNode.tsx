import React, { useState, useEffect } from 'react';
import { OrganogramNode } from '../../utils/organogramTreeEngine';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Building2,
  Users,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface OrganogramTreeNodeProps {
  node: OrganogramNode;
  isRoot?: boolean;
  onSelectNode: (node: OrganogramNode) => void;
  matchedIds: Set<string>;
  ancestorIdsToExpand: Set<string>;
  globalExpandedState?: boolean | null; // null = custom local state, true = expand all, false = collapse all
}

export const OrganogramTreeNode: React.FC<OrganogramTreeNodeProps> = ({
  node,
  isRoot = false,
  onSelectNode,
  matchedIds,
  ancestorIdsToExpand,
  globalExpandedState
}) => {
  // Default expanded state: root and department directors are expanded by default
  const defaultIsExpanded = isRoot || node.role === 'director' || node.role === 'general_manager' || node.role === 'traffic_manager';
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultIsExpanded);

  // Sync when ancestor search requires expanding
  useEffect(() => {
    if (ancestorIdsToExpand.has(node.id)) {
      setIsExpanded(true);
    }
  }, [ancestorIdsToExpand, node.id]);

  // Sync when global expand/collapse all is triggered
  useEffect(() => {
    if (globalExpandedState !== null && globalExpandedState !== undefined) {
      setIsExpanded(globalExpandedState);
    }
  }, [globalExpandedState]);

  const hasChildren = node.children && node.children.length > 0;
  const isSearchMatch = matchedIds.has(node.id);

  // Department color themes
  const departmentTheme = {
    executive: {
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      border: 'border-amber-500/40 hover:border-amber-500',
      avatarBg: 'bg-amber-500/20 text-amber-300 ring-amber-500/40',
      label: 'EXECUTIVE DIRECTORY'
    },
    client_services: {
      badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      border: 'border-sky-500/30 hover:border-sky-400',
      avatarBg: 'bg-sky-500/20 text-sky-300 ring-sky-500/40',
      label: 'CLIENT SERVICES'
    },
    creative: {
      badge: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
      border: 'border-violet-500/30 hover:border-violet-400',
      avatarBg: 'bg-violet-500/20 text-violet-300 ring-violet-500/40',
      label: 'CREATIVE STUDIO'
    },
    traffic: {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      border: 'border-emerald-500/30 hover:border-emerald-400',
      avatarBg: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/40',
      label: 'TRAFFIC & OPERATIONS'
    }
  }[node.department] || {
    badge: 'bg-brand/10 text-brand border-brand/30',
    border: 'border-border hover:border-brand',
    avatarBg: 'bg-brand/20 text-brand ring-brand/40',
    label: 'AGENCY'
  };

  return (
    <div className="flex flex-col items-center">
      {/* Node Card Container */}
      <div
        className={`relative z-10 w-[270px] sm:w-[290px] bg-surface rounded-2xl border shadow-sm transition-all duration-200 select-none ${
          departmentTheme.border
        } ${
          isSearchMatch
            ? 'ring-2 ring-brand shadow-lg scale-102 bg-surface-elevated'
            : 'hover:shadow-md hover:-translate-y-0.5'
        }`}
      >
        {/* Card Header & Department Pill */}
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-border/50">
          <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${departmentTheme.badge}`}>
            {departmentTheme.label}
          </span>
          <span className="text-[10px] font-mono text-text-tertiary uppercase">
            {node.seniority.replace('_', ' ')}
          </span>
        </div>

        {/* Card Body - Click to Inspect in Slide-Over Drawer */}
        <div
          onClick={() => onSelectNode(node)}
          className="p-3.5 space-y-2.5 cursor-pointer group"
          title="Click to inspect reporting line & workload profile"
        >
          {/* Identity & Avatar */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ring-1 shrink-0 ${departmentTheme.avatarBg}`}
            >
              {node.avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-text-primary group-hover:text-brand transition-colors truncate">
                {node.name}
              </h4>
              <p className="text-xs text-text-secondary truncate mt-0.5">
                {node.jobTitle}
              </p>
            </div>
          </div>

          {/* 40-Hour Capacity Baseline Progress Meter */}
          <div className="bg-surface-elevated border border-border/60 rounded-xl p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-text-tertiary flex items-center gap-1">
                <Clock className="w-3 h-3 text-text-tertiary" />
                <span>40h Baseline:</span>
              </span>
              <span className={`font-bold ${node.hasOvertime ? 'text-red-400' : 'text-text-primary'}`}>
                {node.weeklyLoggedHours}h / 40.0h
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border/40 flex">
              <div
                className={`h-full transition-all ${
                  node.hasOvertime
                    ? 'bg-red-500'
                    : node.utilizationPercentage >= 85
                    ? 'bg-amber-500'
                    : 'bg-brand'
                }`}
                style={{ width: `${Math.min(100, node.utilizationPercentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary">
              <span>{node.utilizationPercentage}% capacity load</span>
              {node.hasOvertime && (
                <span className="text-red-400 font-bold">
                  +{node.overtimeHours}h OT
                </span>
              )}
            </div>
          </div>

          {/* Tags & Active Alerts Bar */}
          <div className="flex items-center justify-between gap-1.5 flex-wrap pt-0.5">
            {node.primaryDiscipline ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-elevated border border-border/70 text-text-secondary truncate max-w-[170px]">
                {node.primaryDiscipline.replace('_', ' ')}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-text-tertiary">
                Team Member
              </span>
            )}

            {node.hasVarianceAlert && (
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1"
                title={`${node.activeAlertsCount} active variance alerts`}
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>Variance</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Footer: Direct Reports Toggle (if manager/lead with subordinates) */}
        {hasChildren && (
          <div className="border-t border-border/50 px-3 py-1.5 bg-surface-elevated/40 rounded-b-2xl flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-1.5 py-1 text-xs font-mono font-bold text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-brand" />
                  <span>Collapse ({node.directReportsCount} reports)</span>
                </>
              ) : (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
                  <span>Expand ({node.directReportsCount} reports)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Child Subtree with Connecting Stems */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center w-full">
          {/* Vertical stem descending from parent card */}
          <div className="w-px h-6 bg-border" />

          {/* Branch container */}
          <div className="relative flex justify-center pt-6">
            {/* Horizontal crossbar connecting siblings if >1 children */}
            {node.children.length > 1 && (
              <div
                className="absolute top-0 h-px bg-border"
                style={{
                  left: 'calc(50% / var(--children-count, 2))',
                  right: 'calc(50% / var(--children-count, 2))'
                }}
              />
            )}

            {/* Sibling Columns */}
            <div className="flex items-start gap-8 sm:gap-12">
              {node.children.map((child, idx) => (
                <div key={child.id} className="relative flex flex-col items-center">
                  {/* Vertical stem dropping down into child card */}
                  <div className="w-px h-6 bg-border -mt-6" />

                  {/* Horizontal line segment above this specific child */}
                  {node.children.length > 1 && (
                    <div
                      className={`absolute -top-6 h-px bg-border ${
                        idx === 0
                          ? 'left-1/2 right-0'
                          : idx === node.children.length - 1
                          ? 'left-0 right-1/2'
                          : 'left-0 right-0'
                      }`}
                    />
                  )}

                  <OrganogramTreeNode
                    node={child}
                    onSelectNode={onSelectNode}
                    matchedIds={matchedIds}
                    ancestorIdsToExpand={ancestorIdsToExpand}
                    globalExpandedState={globalExpandedState}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

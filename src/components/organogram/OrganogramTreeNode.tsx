import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OrganogramNode } from '../../utils/organogramTreeEngine';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  AlertTriangle,
  Briefcase,
  Users,
  Crown
} from 'lucide-react';

export type OrganogramCardSize = 'sm' | 'md' | 'lg';

interface OrganogramTreeNodeProps {
  node: OrganogramNode;
  isRoot?: boolean;
  onSelectNode: (node: OrganogramNode) => void;
  matchedIds: Set<string>;
  ancestorIdsToExpand: Set<string>;
  globalExpandedState?: boolean | null; // null = custom local state, true = expand all, false = collapse all
  cardSize?: OrganogramCardSize;
}

// Department thematic color definitions according to user specification:
// 1. Creative = Yellow (#EAB308)
// 2. Traffic & Operations (previously yellow) = Pinkish colour in the signal theme (#F43F5E)
// 3. Client Services = Sky Blue (#0284C7)
// 4. Executive = Royal Violet (#8B5CF6)
export const getDepartmentTheme = (department: string) => {
  switch (department) {
    case 'creative':
      return {
        color: '#EAB308', // Yellow
        badge: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
        border: 'border-yellow-400/40 hover:border-yellow-400',
        avatarBg: 'bg-yellow-400/15 text-yellow-400 ring-yellow-400/40',
        label: 'CREATIVE STUDIO'
      };
    case 'traffic':
      return {
        color: '#F43F5E', // Pinkish colour in the signal theme (Coral Rose #F43F5E)
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        border: 'border-rose-500/40 hover:border-rose-400',
        avatarBg: 'bg-rose-500/15 text-rose-400 ring-rose-500/40',
        label: 'TRAFFIC & OPERATIONS'
      };
    case 'client_services':
      return {
        color: '#0284C7', // Sky Blue
        badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        border: 'border-sky-500/40 hover:border-sky-400',
        avatarBg: 'bg-sky-500/15 text-sky-400 ring-sky-500/40',
        label: 'CLIENT SERVICES'
      };
    case 'executive':
    default:
      return {
        color: '#8B5CF6', // Royal Violet
        badge: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
        border: 'border-violet-500/40 hover:border-violet-400',
        avatarBg: 'bg-violet-500/15 text-violet-400 ring-violet-500/40',
        label: 'EXECUTIVE APEX'
      };
  }
};

export const OrganogramTreeNode: React.FC<OrganogramTreeNodeProps> = ({
  node,
  isRoot = false,
  onSelectNode,
  matchedIds,
  ancestorIdsToExpand,
  globalExpandedState,
  cardSize = 'md'
}) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  // Interactive Cursor-Following Radial Halo
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Default expanded state: root and department directors/managers are expanded by default
  const defaultIsExpanded =
    isRoot ||
    node.role === 'director' ||
    node.role === 'general_manager' ||
    node.role === 'traffic_manager';
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

  // Department thematic color scheme
  const departmentTheme = getDepartmentTheme(node.department);

  // View-responsive card sizing styles (Mobile, Tablet, PC Desktop)
  const sizeStyles = {
    sm: {
      cardWidth: 'w-[205px] sm:w-[215px]',
      padding: 'p-2.5',
      headerPadding: 'px-2.5 pt-2 pb-1.5',
      avatarSize: 'w-8 h-8 text-[11px]',
      nameSize: 'text-xs',
      titleSize: 'text-[10px]',
      meterPadding: 'p-1.5',
      columnPadding: 'px-2 sm:px-3'
    },
    md: {
      cardWidth: 'w-[235px] sm:w-[245px]',
      padding: 'p-3',
      headerPadding: 'px-3 pt-2.5 pb-2',
      avatarSize: 'w-9 h-9 text-xs',
      nameSize: 'text-xs sm:text-[13px]',
      titleSize: 'text-[11px]',
      meterPadding: 'p-2',
      columnPadding: 'px-3 sm:px-4'
    },
    lg: {
      cardWidth: 'w-[260px] sm:w-[275px]',
      padding: 'p-3.5',
      headerPadding: 'px-3.5 pt-3 pb-2',
      avatarSize: 'w-10 h-10 text-sm',
      nameSize: 'text-sm',
      titleSize: 'text-xs',
      meterPadding: 'p-2.5',
      columnPadding: 'px-4 sm:px-5'
    }
  }[cardSize];

  return (
    <div className="relative flex flex-col items-center">
      {/* Node Card */}
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative overflow-hidden ${sizeStyles.cardWidth} rounded-2xl border bg-surface transition-all duration-200 shadow-sm ${
          departmentTheme.border
        } ${
          isSearchMatch
            ? 'ring-2 shadow-lg z-20'
            : isRoot
            ? 'shadow-md z-10'
            : 'hover:shadow-md'
        }`}
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: departmentTheme.color,
          ...(isSearchMatch ? { ringColor: departmentTheme.color } : {})
        }}
      >
        {/* Interactive Cursor-Following Radial Halo around the mouse */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200 z-0"
          style={{
            opacity: isHovered ? (isDark ? 0.12 : 0.08) : 0,
            background: `radial-gradient(240px circle at ${mousePos.x}px ${mousePos.y}px, ${departmentTheme.color}, transparent 70%)`
          }}
        />

        {/* Card Header: Department Badge & Seniority */}
        <div className={`relative z-10 flex items-center justify-between border-b border-border/50 ${sizeStyles.headerPadding}`}>
          <div className="flex items-center gap-1.5">
            {isRoot ? (
              <Crown className="w-3.5 h-3.5" style={{ color: departmentTheme.color }} />
            ) : null}
            <span
              className={`text-[9px] sm:text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-bold ${departmentTheme.badge}`}
            >
              {departmentTheme.label}
            </span>
          </div>
          <span className="text-[10px] font-mono text-text-tertiary uppercase shrink-0 pl-1">
            {node.seniority.replace('_', ' ')}
          </span>
        </div>

        {/* Card Body - Click to Inspect in Slide-Over Drawer */}
        <div
          onClick={() => onSelectNode(node)}
          className={`relative z-10 ${sizeStyles.padding} space-y-2 cursor-pointer group`}
          title="Click to inspect reporting line & workload profile"
        >
          {/* Identity & Avatar */}
          <div className="flex items-center gap-2.5">
            <div
              className={`${sizeStyles.avatarSize} rounded-xl flex items-center justify-center font-bold ring-1 shrink-0 ${departmentTheme.avatarBg}`}
            >
              {node.avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <h4
                className={`${sizeStyles.nameSize} font-bold text-text-primary transition-colors truncate`}
                style={{
                  '--hover-color': departmentTheme.color
                } as React.CSSProperties}
              >
                {node.name}
              </h4>
              <p className={`${sizeStyles.titleSize} text-text-secondary truncate mt-0.5 font-medium`}>
                {node.jobTitle}
              </p>
            </div>
          </div>

          {/* DISCIPLINE TAGS: Only client services are supposed to have discipline tags */}
          {node.department === 'client_services' && node.primaryDiscipline && (
            <div className="pt-0.5">
              <span
                className="inline-flex items-center text-[9px] font-mono px-2 py-0.5 rounded-md border font-semibold truncate max-w-full"
                style={{
                  backgroundColor: `${departmentTheme.color}15`,
                  color: departmentTheme.color,
                  borderColor: `${departmentTheme.color}35`
                }}
                title={`Discipline: ${node.primaryDiscipline.replace(/_/g, ' ')}`}
              >
                {node.primaryDiscipline.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {/* 40-Hour Capacity Baseline Progress Meter - All elements use department colour */}
          <div className={`bg-surface-elevated border border-border/60 rounded-xl ${sizeStyles.meterPadding} space-y-1`}>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
              <span className="flex items-center gap-1" style={{ color: departmentTheme.color }}>
                <Clock className="w-3 h-3" style={{ color: departmentTheme.color }} />
                <span>40h Base:</span>
              </span>
              <span className={`font-bold ${node.hasOvertime ? 'text-red-400' : 'text-text-primary'}`}>
                {node.weeklyLoggedHours}h / 40h
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-border/40 flex">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, node.utilizationPercentage)}%`,
                  backgroundColor: node.hasOvertime ? '#EF4444' : departmentTheme.color
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono">
              <span style={{ color: departmentTheme.color }}>
                {node.utilizationPercentage}% load
              </span>
              {node.hasOvertime ? (
                <span className="text-red-400 font-bold">
                  +{node.overtimeHours}h OT
                </span>
              ) : (
                <span className="text-text-tertiary font-medium">Standard</span>
              )}
            </div>
          </div>

          {/* Deliverables Count & Active Alerts */}
          <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
            <span className="flex items-center gap-1 truncate" style={{ color: departmentTheme.color }}>
              <Briefcase className="w-3 h-3 shrink-0" style={{ color: departmentTheme.color }} />
              <span>{node.assignedAccountsCount} Job{node.assignedAccountsCount === 1 ? '' : 's'}</span>
            </span>

            {node.hasVarianceAlert && (
              <span
                className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1 shrink-0"
                title={`${node.activeAlertsCount} active variance alert(s)`}
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>Variance</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Footer: Direct Reports Toggle (if manager/lead with subordinates) */}
        {hasChildren ? (
          <div className="relative z-10 border-t border-border/50 px-2.5 py-1 bg-surface-elevated/40 rounded-b-2xl flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-colors cursor-pointer"
              style={{
                color: departmentTheme.color
              }}
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: departmentTheme.color }} />
                  <span>Collapse ({node.directReportsCount} reports)</span>
                </>
              ) : (
                <>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: departmentTheme.color }} />
                  <span>Expand ({node.directReportsCount} reports)</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="relative z-10 border-t border-border/40 px-3 py-1 bg-surface-elevated/20 rounded-b-2xl flex items-center justify-between text-[10px] font-mono">
            <span className="text-text-tertiary">Direct Contributor</span>
            <span
              onClick={() => onSelectNode(node)}
              className="font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
              style={{ color: departmentTheme.color }}
            >
              Dossier →
            </span>
          </div>
        )}
      </div>

      {/* Child Subtree with Perfectly Connected Unbroken Lines */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center w-full">
          {/* 1. Vertical trunk line dropping straight down from parent card */}
          <div
            className="w-[2px] h-7 shrink-0"
            style={{
              backgroundColor: departmentTheme.color,
              opacity: 0.8
            }}
          />

          {/* 2. Sibling row container */}
          <div className="relative flex justify-center items-start">
            {node.children.map((child, idx) => {
              const childTheme = getDepartmentTheme(child.department);
              const isFirst = idx === 0;
              const isLast = idx === node.children.length - 1;
              const isSingleChild = node.children.length === 1;

              return (
                <div
                  key={child.id}
                  className={`relative flex flex-col items-center ${sizeStyles.columnPadding}`}
                >
                  {/* Seamless horizontal busbar line running across all sibling columns at top-0 */}
                  {!isSingleChild && (
                    <div
                      className={`absolute top-0 h-[2px] z-0 ${
                        isFirst
                          ? 'left-1/2 right-0'
                          : isLast
                          ? 'left-0 right-1/2'
                          : 'left-0 right-0'
                      }`}
                      style={{
                        backgroundColor: '#64748B',
                        opacity: 0.6
                      }}
                    />
                  )}

                  {/* Vertical drop stem dropping straight down from horizontal busbar into child card */}
                  <div
                    className="w-[2px] h-7 shrink-0 z-10"
                    style={{
                      backgroundColor: childTheme.color,
                      opacity: 0.85
                    }}
                  />

                  {/* Child Node Component */}
                  <OrganogramTreeNode
                    node={child}
                    onSelectNode={onSelectNode}
                    matchedIds={matchedIds}
                    ancestorIdsToExpand={ancestorIdsToExpand}
                    globalExpandedState={globalExpandedState}
                    cardSize={cardSize}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

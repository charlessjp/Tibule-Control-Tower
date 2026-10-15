import React, { useState, useMemo } from 'react';
import { OrganogramNode } from '../../utils/organogramTreeEngine';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Clock,
  Layers
} from 'lucide-react';

interface ExecutiveHierarchyMatrixProps {
  rootNode: OrganogramNode;
  onSelectNode: (node: OrganogramNode) => void;
  matchedIds: Set<string>;
  departmentFilter: string;
}

interface TieredPractitioner {
  node: OrganogramNode;
  managerId: string | null;
  managerName: string | null;
  tierLevel: 1 | 2 | 3 | 4 | 5;
  tierLabel: string;
}

// Individual Practitioner Card with interactive cursor-following radial halo
const MatrixPractitionerCard: React.FC<{
  item: TieredPractitioner;
  isSearchMatch: boolean;
  deptColor: string;
  onSelectNode: (node: OrganogramNode) => void;
  isDark: boolean;
}> = ({ item, isSearchMatch, deptColor, onSelectNode, isDark }) => {
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

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelectNode(item.node)}
      className={`relative overflow-hidden rounded-2xl border p-3.5 bg-surface transition-all duration-150 cursor-pointer shadow-xs ${
        isSearchMatch
          ? 'ring-2 ring-brand'
          : 'hover:border-border-subtle hover:bg-surface-elevated'
      }`}
      style={{
        borderLeftWidth: '3.5px',
        borderLeftColor: deptColor
      }}
      title="Click to view dossier profile & reporting line"
    >
      {/* Interactive Cursor-Following Radial Halo around the mouse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200 z-0"
        style={{
          opacity: isHovered ? (isDark ? 0.12 : 0.08) : 0,
          background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, ${deptColor}, transparent 70%)`
        }}
      />

      {/* Top Row: Tier Level & Department */}
      <div className="relative z-10 flex items-center justify-between pb-2 border-b border-border/40 text-[10px] font-mono">
        <span
          className="font-bold uppercase tracking-wider"
          style={{ color: deptColor }}
        >
          {item.node.department.replace('_', ' ')}
        </span>
        <span className="text-text-tertiary">
          {item.node.seniority.replace('_', ' ')}
        </span>
      </div>

      {/* Member Body */}
      <div className="relative z-10 pt-2.5 space-y-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
            style={{
              backgroundColor: `color-mix(in srgb, ${deptColor} 15%, transparent)`,
              color: deptColor
            }}
          >
            {item.node.avatarInitials}
          </div>
          <div className="min-w-0 flex-1">
            <h4
              className="text-xs sm:text-sm font-bold text-text-primary transition-colors truncate"
              style={{ '--hover-color': deptColor } as React.CSSProperties}
            >
              {item.node.name}
            </h4>
            <p className="text-[11px] text-text-secondary truncate mt-0.5">
              {item.node.jobTitle}
            </p>
          </div>
        </div>

        {/* Discipline Tag: ONLY for Client Services */}
        {item.node.department === 'client_services' && item.node.primaryDiscipline && (
          <div className="pt-0.5">
            <span
              className="inline-flex items-center text-[9px] font-mono px-2 py-0.5 rounded-md border font-semibold truncate max-w-full"
              style={{
                backgroundColor: `${deptColor}15`,
                color: deptColor,
                borderColor: `${deptColor}35`
              }}
            >
              {item.node.primaryDiscipline.replace(/_/g, ' ')}
            </span>
          </div>
        )}

        {/* 40h Progress Bar */}
        <div className="p-2 rounded-xl bg-surface-elevated border border-border/50 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="flex items-center gap-1" style={{ color: deptColor }}>
              <Clock className="w-3 h-3" style={{ color: deptColor }} />
              <span>40h:</span>
            </span>
            <span className={`font-bold ${item.node.hasOvertime ? 'text-red-400' : 'text-text-primary'}`}>
              {item.node.weeklyLoggedHours}h / 40h
            </span>
          </div>
          <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-border/30">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, item.node.utilizationPercentage)}%`,
                backgroundColor: item.node.hasOvertime ? '#EF4444' : deptColor
              }}
            />
          </div>
        </div>

        {/* Manager Reference / Direct Reports */}
        <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary pt-0.5">
          <span className="truncate max-w-[130px]" style={{ color: item.managerName ? undefined : deptColor }}>
            {item.managerName ? `Mgr: ${item.managerName.split(' ')[0]}` : 'Apex GM'}
          </span>
          {item.node.directReportsCount > 0 ? (
            <span className="font-medium" style={{ color: deptColor }}>
              {item.node.directReportsCount} Report{item.node.directReportsCount === 1 ? '' : 's'}
            </span>
          ) : (
            <span className="text-text-tertiary">Direct</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const ExecutiveHierarchyMatrix: React.FC<ExecutiveHierarchyMatrixProps> = ({
  rootNode,
  onSelectNode,
  matchedIds,
  departmentFilter
}) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  // Flatten the tree into an array of practitioners with parent pointers and calculated tiers
  const { practitioners } = useMemo(() => {
    const list: TieredPractitioner[] = [];
    const map = new Map<string, TieredPractitioner>();

    function traverse(node: OrganogramNode, manager: OrganogramNode | null, depth: number) {
      let tierLevel: 1 | 2 | 3 | 4 | 5 = 4;
      let tierLabel = 'L4 · Practitioner';

      if (depth === 1) {
        tierLevel = 1;
        tierLabel = 'L1 · Executive Apex';
      } else if (node.role === 'director' || node.role === 'traffic_manager' || depth === 2) {
        tierLevel = 2;
        tierLabel = 'L2 · Department Director';
      } else if (
        node.role === 'team_lead' ||
        node.seniority === 'lead' ||
        node.seniority === 'associate_director' ||
        node.seniority === 'art_director' ||
        depth === 3
      ) {
        tierLevel = 3;
        tierLabel = 'L3 · Squad Lead / Supervisor';
      } else if (
        node.seniority === 'junior' ||
        node.jobTitle.toLowerCase().includes('nsp') ||
        node.jobTitle.toLowerCase().includes('nss')
      ) {
        tierLevel = 5;
        tierLabel = 'L5 · NSS / Junior Specialist';
      } else {
        tierLevel = 4;
        tierLabel = 'L4 · Execution Specialist';
      }

      const item: TieredPractitioner = {
        node,
        managerId: manager ? manager.id : null,
        managerName: manager ? manager.name : null,
        tierLevel,
        tierLabel
      };

      list.push(item);
      map.set(node.id, item);

      for (const child of node.children) {
        traverse(child, node, depth + 1);
      }
    }

    traverse(rootNode, null, 1);
    return { practitioners: list, byId: map };
  }, [rootNode]);

  // Filter practitioners by department if filter is active
  const filteredPractitioners = useMemo(() => {
    if (departmentFilter === 'all') return practitioners;
    return practitioners.filter(
      (p) => p.node.department === departmentFilter || p.tierLevel === 1 // always keep apex
    );
  }, [practitioners, departmentFilter]);

  // Group practitioners by Tier Level
  const tier1 = filteredPractitioners.filter((p) => p.tierLevel === 1);
  const tier2 = filteredPractitioners.filter((p) => p.tierLevel === 2);
  const tier3 = filteredPractitioners.filter((p) => p.tierLevel === 3);
  const tier4 = filteredPractitioners.filter((p) => p.tierLevel === 4);
  const tier5 = filteredPractitioners.filter((p) => p.tierLevel === 5);

  const tiers = [
    {
      level: 1,
      title: 'Tier 1 · Executive Apex Leadership',
      desc: 'Agency governance, partner oversight & strategic allocation',
      items: tier1
    },
    {
      level: 2,
      title: 'Tier 2 · Department Directors & Operations Leads',
      desc: 'Pillar accountability, SLA control & cross-squad review',
      items: tier2
    },
    {
      level: 3,
      title: 'Tier 3 · Squad Leads & Discipline Leads',
      desc: 'Account execution leads, Art Direction & tactical supervision',
      items: tier3
    },
    {
      level: 4,
      title: 'Tier 4 · Execution Specialists & Account Managers',
      desc: 'Core hands-on design, copy craft, campaign management & dispatch',
      items: tier4
    },
    {
      level: 5,
      title: 'Tier 5 · Junior Practitioners & National Service Support',
      desc: 'Intake coordination, visual production assistance & foundation craft',
      items: tier5
    }
  ].filter((t) => t.items.length > 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 select-none">
      {/* Tiered Rows */}
      <div className="space-y-6">
        {tiers.map((tier) => (
          <div key={tier.level} className="space-y-3">
            {/* Tier Header Banner */}
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-surface-elevated text-brand border border-border">
                  <Layers className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-text-primary tracking-tight">
                    {tier.title}
                  </h3>
                  <p className="text-[11px] text-text-tertiary">
                    {tier.desc}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-text-tertiary">
                {tier.items.length} Practitioner{tier.items.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Practitioner Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {tier.items.map((item) => {
                const isSearchMatch = matchedIds.has(item.node.id);

                // Department styling: Creative=Yellow, Traffic=Signal Pink, Client Services=Sky Blue, Executive=Royal Violet
                const deptColor = {
                  client_services: '#0284c7', // Sky Blue
                  creative: '#eab308', // Yellow
                  traffic: '#f43f5e', // Signal Pink (Coral Rose)
                  executive: '#8b5cf6' // Royal Violet
                }[item.node.department] || 'var(--color-brand)';

                return (
                  <MatrixPractitionerCard
                    key={item.node.id}
                    item={item}
                    isSearchMatch={isSearchMatch}
                    deptColor={deptColor}
                    onSelectNode={onSelectNode}
                    isDark={isDark}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

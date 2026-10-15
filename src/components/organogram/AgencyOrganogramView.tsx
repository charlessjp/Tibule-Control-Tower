import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  buildOrganogramTree,
  filterOrganogramTree,
  searchOrganogramTree,
  OrganogramNode,
  OrganogramDepartmentFilter
} from '../../utils/organogramTreeEngine';
import { OrganogramTreeNode, OrganogramCardSize, getDepartmentTheme } from './OrganogramTreeNode';
import { ExecutiveHierarchyMatrix } from './ExecutiveHierarchyMatrix';
import { OrganogramDetailDrawer } from './OrganogramDetailDrawer';
import {
  Network,
  Search,
  X,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
  Building2,
  Layers,
  Users,
  ShieldCheck,
  RotateCcw,
  Clock,
  Sparkles,
  LayoutGrid,
  Columns,
  Monitor,
  Tablet,
  Smartphone,
  AlertTriangle,
  MoveHorizontal
} from 'lucide-react';

type OrganogramViewMode = 'lateral_tree' | 'tiered_matrix';
type DevicePreset = 'pc' | 'tablet' | 'mobile' | 'custom';

export const AgencyOrganogramView: React.FC = () => {
  const {
    users,
    timesheetEntries,
    discrepancyAlerts,
    disciplineAssignments,
    jobs
  } = useApp();

  const [departmentFilter, setDepartmentFilter] = useState<OrganogramDepartmentFilter>('all');
  const [viewMode, setViewMode] = useState<OrganogramViewMode>('lateral_tree');
  const [cardSize, setCardSize] = useState<OrganogramCardSize>('md');
  const [devicePreset, setDevicePreset] = useState<DevicePreset>('pc');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [selectedNode, setSelectedNode] = useState<OrganogramNode | null>(null);
  const [globalExpandedState, setGlobalExpandedState] = useState<boolean | null>(null);

  // Active agency practitioners (strictly excluding platform admin as instructed)
  const activeAgencyUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.role !== 'admin' &&
        u.id !== 'usr-tariq-afriq' &&
        !(u.jobTitle?.toLowerCase().includes('admin') && !u.jobTitle?.toLowerCase().includes('client'))
    );
  }, [users]);

  // 1. Build root organogram tree from active users data
  const rawRootNode = useMemo(() => {
    return buildOrganogramTree(
      activeAgencyUsers,
      timesheetEntries,
      discrepancyAlerts,
      disciplineAssignments,
      jobs
    );
  }, [activeAgencyUsers, timesheetEntries, discrepancyAlerts, disciplineAssignments, jobs]);

  // 2. Filter tree by active department
  const filteredRootNode = useMemo(() => {
    if (!rawRootNode) return null;
    return filterOrganogramTree(rawRootNode, departmentFilter);
  }, [rawRootNode, departmentFilter]);

  // 3. Search matched node IDs and their ancestor branches
  const { matchedIds, ancestorIdsToExpand } = useMemo(() => {
    if (!filteredRootNode) {
      return { matchedIds: new Set<string>(), ancestorIdsToExpand: new Set<string>() };
    }
    return searchOrganogramTree(filteredRootNode, searchQuery);
  }, [filteredRootNode, searchQuery]);

  // Device Responsive Presets
  const applyDevicePreset = (preset: DevicePreset) => {
    setDevicePreset(preset);
    if (preset === 'pc') {
      setZoomLevel(1.0);
      setCardSize('md');
    } else if (preset === 'tablet') {
      setZoomLevel(0.8);
      setCardSize('md');
    } else if (preset === 'mobile') {
      setZoomLevel(0.65);
      setCardSize('sm');
    }
  };

  // Zoom helpers
  const handleZoomIn = () => {
    setDevicePreset('custom');
    setZoomLevel((z) => Math.min(1.4, Math.round((z + 0.1) * 10) / 10));
  };
  const handleZoomOut = () => {
    setDevicePreset('custom');
    setZoomLevel((z) => Math.max(0.4, Math.round((z - 0.1) * 10) / 10));
  };
  const handleResetZoom = () => {
    setDevicePreset('pc');
    setZoomLevel(1.0);
    setCardSize('md');
  };

  // Smart Auto-Fit: computes optimal scale based on window width and department
  const handleAutoFit = () => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    let targetScale = 1.0;

    if (departmentFilter !== 'all') {
      if (width < 640) targetScale = 0.7;
      else if (width < 1024) targetScale = 0.85;
      else targetScale = 1.0;
    } else {
      if (width < 640) targetScale = 0.5;
      else if (width < 1024) targetScale = 0.7;
      else if (width < 1440) targetScale = 0.85;
      else targetScale = 1.0;
    }

    setDevicePreset('custom');
    setZoomLevel(targetScale);
  };

  const handleExpandAll = () => setGlobalExpandedState(true);
  const handleCollapseAll = () => setGlobalExpandedState(false);

  // Department counts (excluding platform admin)
  const csCount = activeAgencyUsers.filter(
    (u) => u.department === 'client_services' || u.teamId === 'team-client-service'
  ).length;
  const creativeCount = activeAgencyUsers.filter(
    (u) => u.department === 'creative' || u.teamId === 'team-creative'
  ).length;
  const trafficCount = activeAgencyUsers.filter(
    (u) => u.department === 'traffic' || u.teamId === 'team-ops'
  ).length;

  // Aggregate health metrics
  const totalCapacityBaseline = activeAgencyUsers.length * 40;
  const totalOvertimeCount = activeAgencyUsers.filter((u) => {
    const userHours = timesheetEntries
      .filter((e) => e.userId === u.id)
      .reduce((sum, e) => sum + e.hours, 0);
    return userHours > 40;
  }).length;
  const openAlertsCount = discrepancyAlerts.filter((a) => a.status !== 'reconciled').length;

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* 1. View Header with Live Agency Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand/10 text-brand">
              <Network className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
              Agency Organogram Directory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Lateral hierarchical tree connecting Leadership, Client Services, Creative Studio, and Traffic & Operations.
          </p>
        </div>

        {/* Agency Health & Organogram KPI Ribbon */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* Total Staff */}
          <div className="bg-surface border border-border rounded-xl px-3.5 py-2 flex items-center gap-2.5 shrink-0 shadow-xs">
            <Users className="w-4 h-4 text-brand shrink-0" />
            <div>
              <span className="text-[10px] font-mono uppercase text-text-tertiary block">
                Total Headcount
              </span>
              <span className="text-sm font-bold text-text-primary font-mono">
                {rawRootNode?.totalSubtreeHeadcount || activeAgencyUsers.length} Members
              </span>
            </div>
          </div>

          {/* Weekly Capacity */}
          <div className="bg-surface border border-border rounded-xl px-3.5 py-2 flex items-center gap-2.5 shrink-0 shadow-xs">
            <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <span className="text-[10px] font-mono uppercase text-text-tertiary block">
                Capacity Baseline
              </span>
              <span className="text-sm font-bold text-text-primary font-mono">
                {totalCapacityBaseline}.0h / wk
              </span>
            </div>
          </div>

          {/* Overtime Watch */}
          <div className="bg-surface border border-border rounded-xl px-3.5 py-2 flex items-center gap-2.5 shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="text-[10px] font-mono uppercase text-text-tertiary block">
                Overtime Watch
              </span>
              <span className={`text-sm font-bold font-mono ${totalOvertimeCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {totalOvertimeCount} Staff &gt; 40h
              </span>
            </div>
          </div>

          {/* Variance Alerts */}
          <div className="bg-surface border border-border rounded-xl px-3.5 py-2 flex items-center gap-2.5 shrink-0 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="text-[10px] font-mono uppercase text-text-tertiary block">
                Active Variances
              </span>
              <span className={`text-sm font-bold font-mono ${openAlertsCount > 0 ? 'text-amber-400' : 'text-text-primary'}`}>
                {openAlertsCount} Alerts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Control Bar */}
      <div className="bg-surface border border-border rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        {/* Row 1: View Presentation Mode + Device Responsive Presets */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/60">
          {/* Organogram Presentation Mode (Lateral Tree as Primary, Tiered Matrix) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-elevated border border-border overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={() => setViewMode('lateral_tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                viewMode === 'lateral_tree'
                  ? 'bg-surface text-brand font-bold shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Lateral branching tree structure"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Lateral Tree (Primary)</span>
            </button>

            <button
              onClick={() => setViewMode('tiered_matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                viewMode === 'tiered_matrix'
                  ? 'bg-surface text-brand font-bold shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Seniority & governance matrix"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tiered Matrix</span>
            </button>
          </div>

          {/* Device Responsive Sizing & Search Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Responsive Device Presets */}
            {viewMode === 'lateral_tree' && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-elevated border border-border text-xs font-mono">
                <button
                  onClick={() => applyDevicePreset('pc')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    devicePreset === 'pc'
                      ? 'bg-surface text-text-primary font-bold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="PC Desktop View (100% scale, medium cards)"
                >
                  <Monitor className="w-3 h-3" />
                  <span>PC</span>
                </button>

                <button
                  onClick={() => applyDevicePreset('tablet')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    devicePreset === 'tablet'
                      ? 'bg-surface text-text-primary font-bold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Tablet View (80% scale)"
                >
                  <Tablet className="w-3 h-3" />
                  <span>Tablet</span>
                </button>

                <button
                  onClick={() => applyDevicePreset('mobile')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    devicePreset === 'mobile'
                      ? 'bg-surface text-text-primary font-bold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Mobile View (65% scale, compact cards)"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
              </div>
            )}

            {/* Card Size Selector (sm / md / lg) */}
            {viewMode === 'lateral_tree' && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-elevated border border-border text-xs font-mono">
                <button
                  onClick={() => setCardSize('sm')}
                  className={`px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    cardSize === 'sm' ? 'bg-surface text-text-primary font-bold shadow-xs' : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Compact card size"
                >
                  S
                </button>
                <button
                  onClick={() => setCardSize('md')}
                  className={`px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    cardSize === 'md' ? 'bg-surface text-text-primary font-bold shadow-xs' : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Standard card size"
                >
                  M
                </button>
                <button
                  onClick={() => setCardSize('lg')}
                  className={`px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    cardSize === 'lg' ? 'bg-surface text-text-primary font-bold shadow-xs' : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Large comfortable card size"
                >
                  L
                </button>
              </div>
            )}

            {/* Search Box */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search practitioner, role..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs text-text-primary focus:outline-hidden focus:border-brand font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Department Filter Tabs + Subtree & Zoom Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          {/* Department Tabs: Distinct colors (Creative=Yellow, Traffic=Signal Pink, Client Services=Sky Blue) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => {
                setDepartmentFilter('all');
                setGlobalExpandedState(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                departmentFilter === 'all'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-surface-elevated text-text-secondary hover:text-text-primary border border-border'
              }`}
            >
              All Agency ({activeAgencyUsers.length})
            </button>

            {/* Client Services - Sky Blue (#0284C7) */}
            <button
              onClick={() => {
                setDepartmentFilter('client_services');
                setGlobalExpandedState(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                departmentFilter === 'client_services'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-surface-elevated text-text-secondary hover:text-sky-400 border border-border'
              }`}
            >
              Client Services ({csCount})
            </button>

            {/* Creative Studio - Yellow (#EAB308) */}
            <button
              onClick={() => {
                setDepartmentFilter('creative');
                setGlobalExpandedState(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                departmentFilter === 'creative'
                  ? 'bg-yellow-500 text-slate-950 font-black shadow-xs'
                  : 'bg-surface-elevated text-text-secondary hover:text-yellow-400 border border-border'
              }`}
            >
              Creative Studio ({creativeCount})
            </button>

            {/* Traffic & Operations - Signal Pink / Rose (#F43F5E) */}
            <button
              onClick={() => {
                setDepartmentFilter('traffic');
                setGlobalExpandedState(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                departmentFilter === 'traffic'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-surface-elevated text-text-secondary hover:text-rose-400 border border-border'
              }`}
            >
              Traffic &amp; Operations ({trafficCount})
            </button>
          </div>

          {/* Subtree Expand/Collapse and Zoom Actions */}
          <div className="flex items-center gap-3 text-xs font-mono text-text-secondary flex-wrap">
            {viewMode !== 'tiered_matrix' && (
              <div className="flex items-center gap-1.5">
                <span className="text-text-tertiary text-[11px]">Subtrees:</span>
                <button
                  onClick={handleExpandAll}
                  className="px-2 py-1 rounded-lg bg-surface-elevated border border-border hover:text-text-primary text-[11px] font-semibold cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  onClick={handleCollapseAll}
                  className="px-2 py-1 rounded-lg bg-surface-elevated border border-border hover:text-text-primary text-[11px] font-semibold cursor-pointer"
                >
                  Collapse
                </button>
              </div>
            )}

            {viewMode === 'lateral_tree' && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-border">
                <span className="text-text-tertiary text-[11px] mr-1">
                  Scale: {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1.5 rounded-lg bg-surface-elevated border border-border hover:text-text-primary cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleAutoFit}
                  title="Auto-Fit Entire Tree to Screen Width"
                  className="px-2 py-1 rounded-lg bg-surface-elevated border border-border hover:text-text-primary cursor-pointer text-[11px] font-bold text-brand"
                >
                  Fit
                </button>
                <button
                  onClick={handleResetZoom}
                  title="Reset to 100%"
                  className="px-2 py-1 rounded-lg bg-surface-elevated border border-border hover:text-text-primary cursor-pointer text-[11px] font-bold"
                >
                  100%
                </button>
                <button
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1.5 rounded-lg bg-surface-elevated border border-border hover:text-text-primary cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Organogram Main Viewport (Zero Leftmost Truncation) */}
      {filteredRootNode ? (
        <>
          {/* PRIMARY VIEW: RESPONSIVE LATERAL ORGANOGRAM TREE */}
          {viewMode === 'lateral_tree' && (
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-8 shadow-xs overflow-x-auto min-h-[620px] transition-all">
              {/* min-w-max and mx-auto ensure the tree centers when small, but starts cleanly at padding-left when wide without clipping left cards */}
              <div
                className="min-w-max mx-auto px-6 sm:px-16 py-4 flex flex-col items-center origin-top transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <OrganogramTreeNode
                  node={filteredRootNode}
                  isRoot={true}
                  onSelectNode={(node) => setSelectedNode(node)}
                  matchedIds={matchedIds}
                  ancestorIdsToExpand={ancestorIdsToExpand}
                  globalExpandedState={globalExpandedState}
                  cardSize={cardSize}
                />
              </div>
            </div>
          )}

          {/* TIERED MATRIX VIEW */}
          {viewMode === 'tiered_matrix' && (
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-8 shadow-xs">
              <ExecutiveHierarchyMatrix
                rootNode={filteredRootNode}
                onSelectNode={(node) => setSelectedNode(node)}
                matchedIds={matchedIds}
                departmentFilter={departmentFilter}
              />
            </div>
          )}
        </>
      ) : (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-tertiary">
          <Network className="w-8 h-8 opacity-40 mx-auto mb-2" />
          <p className="text-sm font-medium">No team members match the selected filter.</p>
        </div>
      )}

      {/* 4. Slide-Over Detail Drawer */}
      <OrganogramDetailDrawer
        selectedNode={selectedNode}
        rootNode={rawRootNode}
        onClose={() => setSelectedNode(null)}
        onSelectNode={(node) => setSelectedNode(node)}
      />
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  buildOrganogramTree,
  filterOrganogramTree,
  searchOrganogramTree,
  OrganogramNode,
  OrganogramDepartmentFilter
} from '../../utils/organogramTreeEngine';
import { OrganogramTreeNode } from './OrganogramTreeNode';
import { OrganogramDetailDrawer } from './OrganogramDetailDrawer';
import {
  Network,
  Search,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Building2,
  Layers,
  Users,
  ShieldCheck,
  RotateCcw,
  Clock
} from 'lucide-react';

export const AgencyOrganogramView: React.FC = () => {
  const {
    users,
    timesheetEntries,
    discrepancyAlerts,
    disciplineAssignments,
    jobs
  } = useApp();

  const [departmentFilter, setDepartmentFilter] = useState<OrganogramDepartmentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [selectedNode, setSelectedNode] = useState<OrganogramNode | null>(null);
  const [globalExpandedState, setGlobalExpandedState] = useState<boolean | null>(null);

  // 1. Build root organogram tree from live data
  const rawRootNode = useMemo(() => {
    return buildOrganogramTree(
      users,
      timesheetEntries,
      discrepancyAlerts,
      disciplineAssignments,
      jobs
    );
  }, [users, timesheetEntries, discrepancyAlerts, disciplineAssignments, jobs]);

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

  // Zoom helpers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(1.3, Math.round((z + 0.1) * 10) / 10));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.6, Math.round((z - 0.1) * 10) / 10));
  const handleResetZoom = () => setZoomLevel(1.0);

  const handleExpandAll = () => setGlobalExpandedState(true);
  const handleCollapseAll = () => setGlobalExpandedState(false);

  // Department counts
  const csCount = users.filter((u) => u.department === 'client_services' || u.teamId === 'team-client-service').length;
  const creativeCount = users.filter((u) => u.department === 'creative' || u.teamId === 'team-creative').length;
  const trafficCount = users.filter((u) => u.department === 'traffic' || u.teamId === 'team-ops').length;

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* 1. View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-tertiary mb-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-brand)' }} />
            <span>Tibule Governance</span>
            <span>•</span>
            <span>General Manager Apex Structure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Agency Organogram Directory
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-3xl">
            Interactive top-down reporting tree anchored at General Manager Marcus Sterling, mapping chain-of-command across Client Services, Creative, and Traffic with live 40-hour capacity meters.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-surface border border-border rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-mono">
            <Users className="w-4 h-4 text-brand" />
            <span className="font-bold text-text-primary">{users.length}</span>
            <span className="text-text-tertiary">Active Practitioners</span>
          </div>
        </div>
      </div>

      {/* 2. Controls Toolbar: Department Filters, Search & Canvas Controls */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs no-scrollbar">
            <button
              onClick={() => {
                setDepartmentFilter('all');
                setGlobalExpandedState(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                departmentFilter === 'all'
                  ? 'bg-brand text-brand-contrast shadow-xs'
                  : 'bg-surface-elevated text-text-secondary hover:text-text-primary border border-border'
              }`}
            >
              All Agency ({users.length})
            </button>

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

            <button
              onClick={() => {
                setDepartmentFilter('creative');
                setGlobalExpandedState(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                departmentFilter === 'creative'
                  ? 'bg-violet-500 text-white shadow-xs'
                  : 'bg-surface-elevated text-text-secondary hover:text-violet-400 border border-border'
              }`}
            >
              Creative Studio ({creativeCount})
            </button>

            <button
              onClick={() => {
                setDepartmentFilter('traffic');
                setGlobalExpandedState(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                departmentFilter === 'traffic'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-surface-elevated text-text-secondary hover:text-emerald-400 border border-border'
              }`}
            >
              Traffic &amp; Operations ({trafficCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search practitioner, role, discipline..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-border bg-surface-elevated text-text-primary text-xs focus:outline-none focus:border-brand"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Canvas Zoom & Branch Expansion Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs font-mono text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="text-text-tertiary text-[11px]">Branches:</span>
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
              Collapse Subtrees
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-text-tertiary text-[11px] mr-1">Zoom: {Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 rounded-lg bg-surface-elevated border border-border hover:text-text-primary cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset Zoom (100%)"
              className="p-1.5 rounded-lg bg-surface-elevated border border-border hover:text-text-primary cursor-pointer text-[11px] font-bold"
            >
              Fit
            </button>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 rounded-lg bg-surface-elevated border border-border hover:text-text-primary cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Organogram Tree Canvas Viewport */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-10 shadow-xs overflow-auto min-h-[620px] flex justify-center">
        {filteredRootNode ? (
          <div
            className="transition-transform duration-200 origin-top flex flex-col items-center py-4"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <OrganogramTreeNode
              node={filteredRootNode}
              isRoot={true}
              onSelectNode={(node) => setSelectedNode(node)}
              matchedIds={matchedIds}
              ancestorIdsToExpand={ancestorIdsToExpand}
              globalExpandedState={globalExpandedState}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-text-tertiary">
            <Network className="w-8 h-8 opacity-40 mb-2" />
            <p className="text-xs">No team members match the selected filter.</p>
          </div>
        )}
      </div>

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

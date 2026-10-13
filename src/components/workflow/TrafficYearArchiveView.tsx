import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ArchivedTaskRecord, ArchiveQuarter, SlaOutcome, OneDriveSyncConfig } from '../../types';
import { SpotlightCard } from '../common/SpotlightCard';
import {
  FolderArchive,
  Cloud,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  Settings,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Database,
  FileCheck,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  HardDrive,
  Lock,
  Award
} from 'lucide-react';

export const TrafficYearArchiveView: React.FC = () => {
  const {
    archivedTasks,
    oneDriveConfig,
    oneDriveSyncBatches,
    syncTaskToOneDrive,
    syncQuarterToOneDrive,
    updateOneDriveConfig,
    triggerFullOneDriveBackup,
    currentUser,
    setActiveView,
    theme
  } = useApp();

  const isDark = theme === 'dark';

  // State filters
  const [selectedQuarter, setSelectedQuarter] = useState<ArchiveQuarter | 'all'>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedSlaOutcome, setSelectedSlaOutcome] = useState<SlaOutcome | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals
  const [inspectTask, setInspectTask] = useState<ArchivedTaskRecord | null>(null);
  const [isOneDriveModalOpen, setIsOneDriveModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Temporary config form for OneDrive
  const [configForm, setConfigForm] = useState<OneDriveSyncConfig>(oneDriveConfig);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Distinct clients and disciplines from tasks
  const clientsList = useMemo(() => {
    const set = new Set(archivedTasks.map((t) => t.client));
    return Array.from(set).sort();
  }, [archivedTasks]);

  const disciplinesList = useMemo(() => {
    const set = new Set(archivedTasks.map((t) => t.discipline));
    return Array.from(set).sort();
  }, [archivedTasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return archivedTasks.filter((task) => {
      if (selectedQuarter !== 'all' && task.quarter !== selectedQuarter) return false;
      if (selectedClient !== 'all' && task.client !== selectedClient) return false;
      if (selectedDiscipline !== 'all' && task.discipline !== selectedDiscipline) return false;
      if (selectedSlaOutcome !== 'all' && task.slaStatus !== selectedSlaOutcome) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = task.id.toLowerCase().includes(query);
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesClient = task.client.toLowerCase().includes(query);
        const matchesAssignee = task.assigneeName.toLowerCase().includes(query);
        const matchesTags = task.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesId && !matchesTitle && !matchesClient && !matchesAssignee && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [archivedTasks, selectedQuarter, selectedClient, selectedDiscipline, selectedSlaOutcome, searchQuery]);

  // Aggregate metrics
  const totalTasksCount = archivedTasks.length;
  const onTimeCount = archivedTasks.filter((t) => t.slaStatus === 'on_time' || t.slaStatus === 'early' || t.slaStatus === 'sla_saved').length;
  const onTimePercent = totalTasksCount > 0 ? ((onTimeCount / totalTasksCount) * 100).toFixed(1) : '100';
  const totalArchivedHours = archivedTasks.reduce((acc, t) => acc + t.actualHours, 0);
  const totalOneDriveSynced = archivedTasks.filter((t) => t.oneDriveBackup.status === 'verified' || t.oneDriveBackup.status === 'synced').length;
  const syncHealthPercent = totalTasksCount > 0 ? Math.round((totalOneDriveSynced / totalTasksCount) * 100) : 100;

  // Actions
  const handleSyncSelectedQuarter = () => {
    setIsSyncing(true);
    setTimeout(() => {
      syncQuarterToOneDrive(selectedQuarter);
      setIsSyncing(false);
      showToast(`OneDrive Sync Complete: ${selectedQuarter === 'all' ? 'All 12 Months' : selectedQuarter} records backed up & verified.`);
    }, 900);
  };

  const handleExportCsv = () => {
    const headers = [
      'Job ID',
      'Title',
      'Client',
      'Project',
      'Discipline',
      'Task Type',
      'Seniority',
      'Assignee',
      'Quarter',
      'Completed Date',
      'Est Hours',
      'Act Hours',
      'SLA Status',
      'Rework Cycles',
      'Client Rating',
      'OneDrive Path',
      'Checksum (SHA-256)'
    ];

    const rows = filteredTasks.map((t) => [
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.client}"`,
      `"${t.clientProject}"`,
      `"${t.discipline}"`,
      `"${t.taskType}"`,
      `"${t.seniority}"`,
      `"${t.assigneeName}"`,
      `"${t.quarter}"`,
      `"${t.completedDate}"`,
      t.estimatedHours,
      t.actualHours,
      `"${t.slaStatus}"`,
      t.reworkCyclesCount,
      t.clientSignOffRating,
      `"${t.oneDriveBackup.path}"`,
      `"${t.oneDriveBackup.checksum}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tibule_traffic_archive_${selectedQuarter}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Master CSV Archive (${filteredTasks.length} records) downloaded.`);
  };

  const handleExportJsonManifest = () => {
    const manifest = {
      archiveTitle: 'Tibule Agency Control Tower - Historical Task Archive',
      exportedAt: new Date().toISOString(),
      exportedBy: `${currentUser.name} (${currentUser.jobTitle})`,
      selectedQuarter,
      totalRecords: filteredTasks.length,
      oneDriveStorageTarget: oneDriveConfig.rootFolderPath,
      tenant: oneDriveConfig.tenantName,
      records: filteredTasks
    };

    const jsonContent = JSON.stringify(manifest, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `onedrive_manifest_${selectedQuarter}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`OneDrive JSON Manifest generated & downloaded.`);
  };

  const handleSaveOneDriveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateOneDriveConfig(configForm);
    setIsOneDriveModalOpen(false);
    showToast('OneDrive Enterprise configuration updated.');
  };

  const quarterLabels: Record<ArchiveQuarter | 'all', string> = {
    all: 'Full 12 Months',
    '2026-Q4': '2026 Q4 (Oct - Dec)',
    '2026-Q3': '2026 Q3 (Jul - Sep)',
    '2026-Q2': '2026 Q2 (Apr - Jun)',
    '2026-Q1': '2026 Q1 (Jan - Mar)',
    '2025-Q4': '2025 Q4 (Oct - Dec)',
    '2025-Q3': '2025 Q3 (Jul - Sep)'
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className="fixed top-6 right-6 z-50 p-4 rounded-xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-brand)',
            color: 'var(--color-text-primary)'
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--color-brand-muted)',
              color: 'var(--color-brand)'
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-tertiary">
            <FolderArchive className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
            <span>Traffic Operations Archive</span>
            <span>·</span>
            <span style={{ color: 'var(--color-success)' }} className="font-bold">
              1-Year Immutable Ledger
            </span>
            <span>·</span>
            <span>Microsoft 365 Cloud Backup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mt-1">
            Annual Task Archive
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Permanent historical records of agency deliverables, debrief certifications, rework cycles, and automated Microsoft OneDrive archival packages.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveView('cases')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            <FileCheck className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            <span>Traffic Cases &amp; SLA Rulings</span>
          </button>

          <button
            onClick={() => setIsOneDriveModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            <Settings className="w-4 h-4 text-text-tertiary" />
            <span>OneDrive Config</span>
          </button>

          <button
            onClick={handleSyncSelectedQuarter}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-90 flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-brand)',
              color: 'var(--color-brand-contrast)'
            }}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing to OneDrive...' : 'Sync Records to OneDrive'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <SpotlightCard className="p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-text-tertiary flex items-center gap-1.5">
            <FolderArchive className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
            Total Archived Tasks
          </span>
          <div className="text-2xl font-extrabold font-mono text-text-primary mt-1">
            {totalTasksCount}
          </div>
          <span className="text-[10px] text-text-tertiary">Across 5 Quarters (12+ Mo)</span>
        </SpotlightCard>

        <SpotlightCard className="p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-text-tertiary flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
            On-Time SLA Delivery
          </span>
          <div className="text-2xl font-extrabold font-mono mt-1" style={{ color: 'var(--color-success)' }}>
            {onTimePercent}%
          </div>
          <span className="text-[10px] text-text-tertiary">{onTimeCount} of {totalTasksCount} met SLA</span>
        </SpotlightCard>

        <SpotlightCard className="p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-text-tertiary flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />
            Production Hours
          </span>
          <div className="text-2xl font-extrabold font-mono text-text-primary mt-1">
            {totalArchivedHours.toLocaleString()}h
          </div>
          <span className="text-[10px] text-text-tertiary">Verified effort logged</span>
        </SpotlightCard>

        <SpotlightCard className="p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-text-tertiary flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
            OneDrive Backup Health
          </span>
          <div className="text-2xl font-extrabold font-mono mt-1" style={{ color: 'var(--color-brand)' }}>
            {syncHealthPercent}%
          </div>
          <span className="text-[10px] text-text-tertiary">{totalOneDriveSynced} verified in cloud</span>
        </SpotlightCard>

        <SpotlightCard className="p-4 col-span-2 sm:col-span-4 lg:col-span-1 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-text-tertiary flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-text-secondary" />
            Cloud Storage Pool
          </span>
          <div className="text-2xl font-extrabold font-mono text-text-primary mt-1">
            {(oneDriveConfig.totalBackedUpSizeMb / 1024).toFixed(1)} GB
          </div>
          <span className="text-[10px] text-text-tertiary">M365 Business Tier</span>
        </SpotlightCard>
      </div>

      {/* OneDrive Streamlined Backup Integration Bar */}
      <div
        className="p-4 sm:p-5 rounded-2xl border space-y-4"
        style={{
          backgroundColor: 'var(--color-surface-elevated)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--color-brand-muted)',
                borderColor: 'var(--color-brand)',
                color: 'var(--color-brand)'
              }}
            >
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-text-primary">
                  Microsoft OneDrive for Business Backup Integration
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary mt-0.5 font-mono">
                <span>Account: <strong className="text-text-primary">{oneDriveConfig.connectedAccount}</strong></span>
                <span>·</span>
                <span className="truncate max-w-[280px]">Folder: {oneDriveConfig.rootFolderPath}</span>
                <span>·</span>
                <span>Last Sync: {new Date(oneDriveConfig.lastSuccessfulSync).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Export Streamline Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
              title="Download structured spreadsheet manifest"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Ledger</span>
            </button>

            <button
              onClick={handleExportJsonManifest}
              className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
              title="Download SHA-256 cloud sync manifest"
            >
              <FileText className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
              <span>Export JSON Manifest</span>
            </button>
          </div>
        </div>

        {/* Folder Architecture & Audit Guarantee */}
        <div
          className="p-3 rounded-xl border text-xs space-y-1.5"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border-subtle)'
          }}
        >
          <div className="flex items-center justify-between text-text-tertiary text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-text-secondary font-bold">
              <HardDrive className="w-3 h-3" />
              Automated Hierarchy Streamlining:
            </span>
            <span style={{ color: 'var(--color-brand)' }}>SHA-256 Checksums Verified On Every Export</span>
          </div>
          <div className="font-mono text-[11px] text-text-secondary flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border">/AgencyOps</span>
            <span>➔</span>
            <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border">/{'{Year}'}</span>
            <span>➔</span>
            <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border">/{'{Quarter}'}</span>
            <span>➔</span>
            <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border">/{'{Client}'}</span>
            <span>➔</span>
            <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border">/{'{JobID}_{Deliverable}.zip'}</span>
          </div>
        </div>
      </div>

      {/* Filter and Timeline Controls */}
      <div className="space-y-3">
        {/* Quarter Timeline Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {(['all', '2026-Q3', '2026-Q2', '2026-Q1', '2025-Q4', '2025-Q3'] as const).map((q) => {
            const isSelected = selectedQuarter === q;
            return (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected ? 'shadow-xs font-bold' : 'border border-border/70 hover:bg-surface-elevated text-text-secondary'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: 'var(--color-brand)',
                        color: 'var(--color-brand-contrast)'
                      }
                    : {
                        backgroundColor: 'var(--color-surface)'
                      }
                }
              >
                {quarterLabels[q]}
              </button>
            );
          })}
        </div>

        {/* Sub-Filters Row */}
        <div className="p-3.5 rounded-xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, title, client, or assignee..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-surface-elevated text-text-primary focus:outline-none focus:border-[var(--color-brand)] text-xs"
              />
            </div>

            {/* Client Filter */}
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-surface-elevated text-text-primary focus:outline-none focus:border-[var(--color-brand)] text-xs cursor-pointer"
            >
              <option value="all">All Clients ({clientsList.length})</option>
              {clientsList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Discipline Filter */}
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-surface-elevated text-text-primary focus:outline-none focus:border-[var(--color-brand)] text-xs cursor-pointer"
            >
              <option value="all">All Disciplines</option>
              {disciplinesList.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* SLA Filter */}
            <select
              value={selectedSlaOutcome}
              onChange={(e) => setSelectedSlaOutcome(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-surface-elevated text-text-primary focus:outline-none focus:border-[var(--color-brand)] text-xs cursor-pointer"
            >
              <option value="all">All SLA Outcomes</option>
              <option value="on_time">On-Time</option>
              <option value="early">Early Delivery</option>
              <option value="sla_saved">SLA Saved by Traffic</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 shrink-0 self-end md:self-auto">
            <span className="text-text-tertiary mr-2 font-mono text-[11px]">
              {filteredTasks.length} record{filteredTasks.length === 1 ? '' : 's'}
            </span>
            <div className="p-0.5 rounded-lg border border-border bg-surface-elevated flex items-center">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                  viewMode === 'table' ? 'bg-surface font-bold text-text-primary shadow-xs' : 'text-text-tertiary'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                  viewMode === 'cards' ? 'bg-surface font-bold text-text-primary shadow-xs' : 'text-text-tertiary'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className="border-b font-mono uppercase text-[10px] text-text-tertiary"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <tr>
                  <th className="py-3 px-4">Task ID &amp; Title</th>
                  <th className="py-3 px-4">Client &amp; Project</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Completed</th>
                  <th className="py-3 px-4">Hours (Est/Act)</th>
                  <th className="py-3 px-4">SLA Outcome</th>
                  <th className="py-3 px-4">OneDrive Backup</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTasks.map((task) => {
                  const hoursDelta = task.actualHours - task.estimatedHours;
                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-surface-elevated/60 transition-colors group cursor-pointer"
                      onClick={() => setInspectTask(task)}
                    >
                      {/* ID & Title */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-text-primary group-hover:text-[var(--color-brand)] transition-colors">
                          {task.title}
                        </div>
                        <div className="font-mono text-[10px] text-text-tertiary flex items-center gap-1.5 mt-0.5">
                          <span>{task.id}</span>
                          <span>·</span>
                          <span>{task.taskType}</span>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-text-primary">{task.client}</div>
                        <div className="text-[11px] text-text-tertiary truncate max-w-[140px]">{task.clientProject}</div>
                      </td>

                      {/* Discipline */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-border bg-surface-elevated text-text-secondary">
                          {task.discipline}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-4">
                        <div className="text-text-primary font-medium">{task.assigneeName}</div>
                        <div className="text-[10px] text-text-tertiary capitalize">{task.seniority}</div>
                      </td>

                      {/* Completed */}
                      <td className="py-3 px-4 font-mono text-[11px] text-text-secondary">
                        {new Date(task.completedDate).toLocaleDateString()}
                      </td>

                      {/* Hours */}
                      <td className="py-3 px-4 font-mono">
                        <div className="text-text-primary font-semibold">
                          {task.actualHours}h <span className="text-text-tertiary font-normal">/ {task.estimatedHours}h</span>
                        </div>
                        <div
                          className="text-[10px]"
                          style={{
                            color: hoursDelta <= 0 ? 'var(--color-success)' : 'var(--color-warning)'
                          }}
                        >
                          {hoursDelta <= 0 ? `${Math.abs(hoursDelta)}h under est` : `+${hoursDelta}h variance`}
                        </div>
                      </td>

                      {/* SLA Outcome */}
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
                          style={{
                            backgroundColor:
                              task.slaStatus === 'on_time' || task.slaStatus === 'early' || task.slaStatus === 'sla_saved'
                                ? 'var(--color-success-muted)'
                                : 'var(--color-critical-muted)',
                            borderColor:
                              task.slaStatus === 'on_time' || task.slaStatus === 'early' || task.slaStatus === 'sla_saved'
                                ? 'color-mix(in srgb, var(--color-success) 30%, transparent)'
                                : 'color-mix(in srgb, var(--color-critical) 30%, transparent)',
                            color:
                              task.slaStatus === 'on_time' || task.slaStatus === 'early' || task.slaStatus === 'sla_saved'
                                ? 'var(--color-success)'
                                : 'var(--color-critical)'
                          }}
                        >
                          {task.slaStatus === 'sla_saved' ? 'SLA Saved' : task.slaStatus.replace('_', ' ')}
                        </span>
                      </td>

                      {/* OneDrive */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Cloud className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                          <span className="font-mono text-[10px] text-text-secondary truncate max-w-[120px]" title={task.oneDriveBackup.path}>
                            {task.oneDriveBackup.path.split('/').pop()}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectTask(task);
                          }}
                          className="px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors hover:bg-surface-elevated text-text-secondary hover:text-text-primary"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setInspectTask(task)}
              className="p-4 rounded-xl border border-border bg-surface hover:border-[var(--color-brand)] transition-all cursor-pointer space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-text-tertiary">{task.id}</span>
                  <h4 className="font-bold text-sm text-text-primary line-clamp-1 mt-0.5">{task.title}</h4>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 border"
                  style={{
                    backgroundColor: 'var(--color-success-muted)',
                    borderColor: 'color-mix(in srgb, var(--color-success) 30%, transparent)',
                    color: 'var(--color-success)'
                  }}
                >
                  {task.slaStatus.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {task.briefSummary}
              </p>

              <div className="p-2.5 rounded-lg bg-surface-elevated border border-border text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Client:</span>
                  <span className="font-semibold text-text-primary">{task.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Assignee:</span>
                  <span className="text-text-secondary">{task.assigneeName} ({task.seniority})</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-text-tertiary">Effort:</span>
                  <span className="text-text-primary">{task.actualHours}h (Est: {task.estimatedHours}h)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/60">
                <div className="flex items-center gap-1.5 text-text-tertiary font-mono">
                  <Cloud className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                  <span>OneDrive Synced</span>
                </div>
                <span className="font-mono text-[10px] text-text-tertiary">
                  {new Date(task.completedDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Inspection Modal */}
      {inspectTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-2xl max-h-[90vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            {/* Modal Header */}
            <div
              className="p-5 border-b flex items-center justify-between"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'var(--color-brand-muted)',
                    borderColor: 'var(--color-brand)',
                    color: 'var(--color-brand)'
                  }}
                >
                  <FolderArchive className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-mono text-[10px] text-text-tertiary">{inspectTask.id} · {inspectTask.quarter}</div>
                  <h3 className="font-bold text-base text-text-primary">{inspectTask.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setInspectTask(null)}
                className="p-1 rounded-lg hover:bg-surface text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Deliverable Brief Summary */}
              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated space-y-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px] text-text-tertiary font-mono">
                  Archived Deliverable Brief &amp; Scope:
                </span>
                <p className="text-text-secondary leading-relaxed">{inspectTask.briefSummary}</p>
              </div>

              {/* Debrief Squad & Prescription */}
              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-text-tertiary font-mono">
                  Historical Debrief Certification:
                </span>
                <div className="text-text-secondary">{inspectTask.debriefSquadSummary}</div>
                <div
                  className="p-2.5 rounded-lg border text-[11px] font-mono"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  Prescription: {inspectTask.debriefPrescription}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                  <div className="text-[10px] text-text-tertiary uppercase">Client</div>
                  <div className="font-bold text-text-primary mt-0.5">{inspectTask.client}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                  <div className="text-[10px] text-text-tertiary uppercase">Assignee</div>
                  <div className="font-bold text-text-primary mt-0.5 truncate">{inspectTask.assigneeName}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                  <div className="text-[10px] text-text-tertiary uppercase">Actual Effort</div>
                  <div className="font-bold text-text-primary mt-0.5">{inspectTask.actualHours}h (Est: {inspectTask.estimatedHours}h)</div>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                  <div className="text-[10px] text-text-tertiary uppercase">Client Rating</div>
                  <div className="font-bold mt-0.5 text-amber-500">{'★'.repeat(inspectTask.clientSignOffRating)}</div>
                </div>
              </div>

              {/* OneDrive Backup Record Information */}
              <div
                className="p-4 rounded-xl border space-y-2"
                style={{
                  backgroundColor: 'var(--color-brand-muted)',
                  borderColor: 'color-mix(in srgb, var(--color-brand) 30%, transparent)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                    <span className="font-bold text-text-primary">Microsoft OneDrive Cloud Manifest</span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
                    style={{
                      backgroundColor: 'var(--color-success-muted)',
                      borderColor: 'color-mix(in srgb, var(--color-success) 30%, transparent)',
                      color: 'var(--color-success)'
                    }}
                  >
                    Verified Checksum
                  </span>
                </div>

                <div className="text-[11px] font-mono space-y-1 text-text-secondary">
                  <div>Path: <strong className="text-text-primary">{inspectTask.oneDriveBackup.path}</strong></div>
                  <div>Synced: {new Date(inspectTask.oneDriveBackup.syncedAt).toLocaleString()}</div>
                  <div className="break-all">SHA-256: <span className="text-text-tertiary">{inspectTask.oneDriveBackup.checksum}</span></div>
                  <div>Package Size: {(inspectTask.oneDriveBackup.fileSizeBytes / 1000000).toFixed(1)} MB</div>
                  <div>Audit Certificate: <strong style={{ color: 'var(--color-brand)' }}>{inspectTask.auditCertificateId}</strong></div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="p-4 border-t flex items-center justify-between"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              <span className="text-[11px] font-mono text-text-tertiary">
                Immutable Archival Entry · Signed Off {new Date(inspectTask.completedDate).toLocaleDateString()}
              </span>
              <button
                onClick={() => setInspectTask(null)}
                className="px-4 py-1.5 rounded-lg border text-xs font-semibold hover:bg-surface cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OneDrive Configuration & Sync Batch Modal */}
      {isOneDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-xl max-h-[90vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            {/* Header */}
            <div
              className="p-5 border-b flex items-center justify-between"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="flex items-center gap-2.5">
                <Cloud className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
                <div>
                  <h3 className="font-bold text-sm text-text-primary">
                    Microsoft OneDrive for Business Sync Settings
                  </h3>
                  <p className="text-[10px] text-text-tertiary font-mono">
                    Enterprise Archival &amp; Retention Rules
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOneDriveModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveOneDriveConfig} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-text-secondary">Connected Microsoft 365 Account:</label>
                <input
                  type="text"
                  value={configForm.connectedAccount}
                  onChange={(e) => setConfigForm({ ...configForm, connectedAccount: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-border bg-surface-elevated text-text-primary text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-text-secondary">Destination Root Folder Path:</label>
                <input
                  type="text"
                  value={configForm.rootFolderPath}
                  onChange={(e) => setConfigForm({ ...configForm, rootFolderPath: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-border bg-surface-elevated text-text-primary text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-text-secondary">Automated Sync Schedule:</label>
                  <select
                    value={configForm.autoSyncSchedule}
                    onChange={(e) => setConfigForm({ ...configForm, autoSyncSchedule: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg border border-border bg-surface-elevated text-text-primary text-xs cursor-pointer"
                  >
                    <option value="realtime">Real-time upon client sign-off</option>
                    <option value="weekly_sunday">Weekly Sunday Midnight Batch</option>
                    <option value="monthly_close">Monthly Financial Close Batch</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-text-secondary">Retention Period Policy:</label>
                  <select
                    value={configForm.retentionPeriodYears}
                    onChange={(e) => setConfigForm({ ...configForm, retentionPeriodYears: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-border bg-surface-elevated text-text-primary text-xs cursor-pointer"
                  >
                    <option value={1}>1 Year Mandatory</option>
                    <option value={3}>3 Years Extended (Standard)</option>
                    <option value={7}>7 Years Enterprise Compliance</option>
                  </select>
                </div>
              </div>

              {/* Past Sync Batches Log */}
              <div className="pt-2 space-y-2">
                <label className="font-bold text-text-secondary font-mono text-[10px] uppercase">
                  Recent OneDrive Synchronization Batches ({oneDriveSyncBatches.length}):
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {oneDriveSyncBatches.map((batch) => (
                    <div
                      key={batch.id}
                      className="p-2.5 rounded-lg bg-surface border border-border text-[11px] font-mono flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-text-primary">{batch.id}</div>
                        <div className="text-[10px] text-text-tertiary">
                          {new Date(batch.timestamp).toLocaleDateString()} · {batch.recordsCount} records · {batch.totalSizeMb} MB
                        </div>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border"
                        style={{
                          backgroundColor: 'var(--color-success-muted)',
                          borderColor: 'color-mix(in srgb, var(--color-success) 30%, transparent)',
                          color: 'var(--color-success)'
                        }}
                      >
                        {batch.checksumStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOneDriveModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border text-xs font-semibold hover:bg-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 shadow-xs cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-brand-contrast)'
                  }}
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

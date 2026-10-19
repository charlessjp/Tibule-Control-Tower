import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { HomeDateFilterBar } from '../common/HomeDateFilterBar';
import { VisualAnalyticsWidget } from '../deliverables/VisualAnalyticsWidget';
import { CSCommandCentreView } from './CSCommandCentreView';
import { CSAccountWorkbenchView } from './CSAccountWorkbenchView';
import { CSDeliveryWorkbenchView } from './CSDeliveryWorkbenchView';
import { CSDisciplineCapacityView } from './CSDisciplineCapacityView';
import { CSTwoDimensionsView } from './CSTwoDimensionsView';
import { CSNSSProgressionView } from './CSNSSProgressionView';
import { CSTimesheetsAuditView } from './CSTimesheetsAuditView';
import { CSBriefIntakeModal } from './CSBriefIntakeModal';
import { CSRevertResolutionModal } from './CSRevertResolutionModal';
import {
  isJobInCalendarPeriod,
  isArchivedInCalendarPeriod
} from '../../utils/calendarPeriodFilter';
import {
  Building2,
  Layers,
  Users,
  ShieldCheck,
  CheckSquare,
  GraduationCap,
  GitCommit,
  Plus,
  BarChart3,
  RotateCcw,
  Clock,
  Network
} from 'lucide-react';

export type CSTabKey =
  | 'command_centre'
  | 'timesheets_audit'
  | 'account_workbench'
  | 'delivery_workbench'
  | 'discipline_capacity'
  | 'two_dimensions'
  | 'nss_progression';

export const ClientServiceHubView: React.FC = () => {
  const {
    jobs,
    users,
    brands,
    currentUser,
    setActiveView,
    homeCalendarPeriod,
    setHomeCalendarPeriod,
    homeCustomDateRange,
    setHomeCustomDateRange,
    archivedTasks,
    discrepancyAlerts
  } = useApp();

  // Smart default tab based on user's confirmed position in hierarchy
  const initialTab = useMemo<CSTabKey>(() => {
    const title = currentUser.jobTitle.toLowerCase();
    const role = currentUser.role;

    if (role === 'director' || title.includes('director') || role === 'general_manager' || role === 'admin') {
      return 'command_centre';
    }
    if (title.includes('senior account manager') || title.includes('account manager')) {
      return 'account_workbench';
    }
    if (title.includes('account executive')) {
      return 'delivery_workbench';
    }
    if (title.includes('nss') || title.includes('intern') || currentUser.seniority === 'nss_intern') {
      return 'nss_progression';
    }
    return 'timesheets_audit';
  }, [currentUser]);

  const [activeTab, setActiveTab] = useState<CSTabKey>(initialTab);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [revertModalJob, setRevertModalJob] = useState<any | null>(null);

  // Scoped deliverables to active operating calendar period
  const clientJobs = useMemo(() => {
    return jobs.filter((j) => {
      return (
        j.teamId === 'team-client-service' ||
        j.discipline === 'Client Services' ||
        brands.some((b) => b.id === j.brandId)
      );
    });
  }, [jobs, brands]);

  const periodClientJobs = useMemo(() => {
    return clientJobs.filter((j) =>
      isJobInCalendarPeriod(j, homeCalendarPeriod, homeCustomDateRange)
    );
  }, [clientJobs, homeCalendarPeriod, homeCustomDateRange]);

  const periodArchivedClient = useMemo(() => {
    return (archivedTasks || []).filter((t) =>
      isArchivedInCalendarPeriod(t, homeCalendarPeriod, homeCustomDateRange)
    );
  }, [archivedTasks, homeCalendarPeriod, homeCustomDateRange]);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-tertiary mb-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-brand)' }} />
            <span>Client Services Operating Model</span>
            <span>•</span>
            <span>Director → Senior AM → AM → AE → Intern/NSS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Client Services Command &amp; Capacity Tower
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-3xl">
            Governing the confirmed operating hierarchy (Dimension A) alongside the 7 confirmed functional execution capabilities (Dimension B) with a universal 40-hour capacity baseline, daily activity timesheets, and automated discrepancy audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveView('organogram')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-border bg-surface text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <Network className="w-4 h-4 text-brand" />
            <span>Organogram Directory</span>
          </button>

          <button
            onClick={() => setIsBriefModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-brand)',
              color: 'var(--color-brand-contrast)'
            }}
          >
            <Plus className="w-4 h-4" />
            <span>New Client Brief</span>
          </button>
        </div>
      </div>

      {/* 2. Unified Calendar Operating Window Filter Bar */}
      <HomeDateFilterBar
        period={homeCalendarPeriod}
        onPeriodChange={setHomeCalendarPeriod}
        customRange={homeCustomDateRange}
        onCustomRangeChange={setHomeCustomDateRange}
        matchedCount={periodClientJobs.length}
        archivedCount={periodArchivedClient.length}
        totalCount={clientJobs.length}
        label="Operating Horizon"
      />

      {/* 3. Primary Navigation Tabs (The 7 Pillars of the Operating Model) */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border overflow-x-auto text-xs no-scrollbar">
        <button
          onClick={() => setActiveTab('command_centre')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'command_centre'
              ? 'bg-surface-elevated text-text-primary border border-border shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/60'
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${activeTab === 'command_centre' ? 'text-brand' : 'text-text-tertiary'}`} />
          <span>Department Command Centre</span>
        </button>

        <button
          onClick={() => setActiveTab('timesheets_audit')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'timesheets_audit'
              ? 'bg-surface-elevated text-text-primary border border-border shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/60'
          }`}
        >
          <Clock className={`w-4 h-4 ${activeTab === 'timesheets_audit' ? 'text-brand' : 'text-text-tertiary'}`} />
          <span>40h Timesheets &amp; Audit</span>
          {discrepancyAlerts && discrepancyAlerts.filter((a) => a.status === 'flagged').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('account_workbench')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'account_workbench'
              ? 'bg-surface-elevated text-text-primary border border-border shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/60'
          }`}
        >
          <Building2 className={`w-4 h-4 ${activeTab === 'account_workbench' ? 'text-brand' : 'text-text-tertiary'}`} />
          <span>Account Workbench (SAM / AM)</span>
        </button>

        <button
          onClick={() => setActiveTab('delivery_workbench')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'delivery_workbench'
              ? 'bg-surface-elevated text-text-primary border border-border shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/60'
          }`}
        >
          <CheckSquare className={`w-4 h-4 ${activeTab === 'delivery_workbench' ? 'text-brand' : 'text-text-tertiary'}`} />
          <span>Delivery Workbench (AE)</span>
        </button>

        <button
          onClick={() => setActiveTab('discipline_capacity')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'discipline_capacity'
              ? 'bg-surface-elevated text-text-primary border border-border shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/60'
          }`}
        >
          <Layers className={`w-4 h-4 ${activeTab === 'discipline_capacity' ? 'text-brand' : 'text-text-tertiary'}`} />
          <span>Discipline &amp; Capacity</span>
        </button>

        <button
          onClick={() => setActiveTab('two_dimensions')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'two_dimensions'
              ? 'bg-surface-elevated text-text-primary border border-border shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/60'
          }`}
        >
          <GitCommit className={`w-4 h-4 ${activeTab === 'two_dimensions' ? 'text-brand' : 'text-text-tertiary'}`} />
          <span>The Two Dimensions</span>
        </button>

        <button
          onClick={() => setActiveTab('nss_progression')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'nss_progression'
              ? 'bg-surface-elevated text-text-primary border border-border shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/60'
          }`}
        >
          <GraduationCap className={`w-4 h-4 ${activeTab === 'nss_progression' ? 'text-brand' : 'text-text-tertiary'}`} />
          <span>NSS &amp; Staff Development</span>
        </button>
      </div>

      {/* 4. Active Tab Content Rendering */}
      {activeTab === 'command_centre' && (
        <CSCommandCentreView
          onOpenBriefModal={() => setIsBriefModalOpen(true)}
          onOpenRevertModal={(job) => setRevertModalJob(job)}
          onSelectEmployee={(empId) => setActiveTab('two_dimensions')}
        />
      )}

      {activeTab === 'timesheets_audit' && <CSTimesheetsAuditView />}

      {activeTab === 'account_workbench' && (
        <CSAccountWorkbenchView
          onOpenBriefModal={() => setIsBriefModalOpen(true)}
          onOpenRevertModal={(job) => setRevertModalJob(job)}
        />
      )}

      {activeTab === 'delivery_workbench' && <CSDeliveryWorkbenchView />}

      {activeTab === 'discipline_capacity' && <CSDisciplineCapacityView />}

      {activeTab === 'two_dimensions' && <CSTwoDimensionsView />}

      {activeTab === 'nss_progression' && <CSNSSProgressionView />}

      {/* 5. Live Audited Visual Analytics Telemetry */}
      <VisualAnalyticsWidget
        scope="client_service"
        title="Client Services &amp; Delivery Telemetry"
        subtitle="Audited telemetry for client deliverables, discipline capacity allocation, SLA compliance, and revert revision cycles."
      />

      {/* Brief Intake Modal */}
      <CSBriefIntakeModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
      />

      {/* Client Revert Resolution Modal */}
      {revertModalJob && (
        <CSRevertResolutionModal
          job={revertModalJob}
          isOpen={!!revertModalJob}
          onClose={() => setRevertModalJob(null)}
        />
      )}
    </div>
  );
};

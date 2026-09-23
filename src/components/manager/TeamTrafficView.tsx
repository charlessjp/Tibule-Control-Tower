import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightCard } from '../common/SpotlightCard';
import { CapacityMeter } from '../common/CapacityMeter';
import { TrafficState } from '../../types';
import { SeniorityBadge } from '../common/SeniorityBadge';
import { canGenerateReportForUser } from '../../utils/reportPermissions';
import {
  Users,
  Filter,
  ArrowRight,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  FileDown
} from 'lucide-react';

export const TeamTrafficView: React.FC = () => {
  const {
    teams,
    users,
    currentUser,
    employeeCapacities,
    setSelectedEmployeeId,
    openReportModal,
    theme
  } = useApp();

  const isDark = theme === 'dark';
  const isGM = currentUser.role === 'general_manager' || currentUser.role === 'admin';
  const userTeam = teams.find((t) => t.id === currentUser.teamId) || teams[0];

  const [filterState, setFilterState] = useState<string>('all');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');

  // Managers are strictly locked to their own team; GMs have full cross-team capacity
  const effectiveTeamFilter = isGM ? selectedTeamFilter : (currentUser.teamId || 'team-creative');

  const filteredUsers = users.filter((u) => {
    if (effectiveTeamFilter !== 'all' && u.teamId !== effectiveTeamFilter) return false;
    if (filterState !== 'all') {
      const cap = employeeCapacities[u.id];
      if (cap?.trafficState !== filterState) return false;
    }
    return true;
  });

  return (
    <div id="team-traffic-view" className="space-y-6 pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {isGM ? 'Studio Capacity & Workload' : `${userTeam?.name || 'Team'} Capacity & Workload`}
          </h1>
          <p className="text-xs mt-1 text-text-tertiary">
            {isGM
              ? 'Check studio hours, balance project assignments, and inspect workloads across all agency teams.'
              : `Check team hours, balance project assignments, and keep workloads healthy for ${userTeam?.name || 'your assigned team'}.`}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {isGM ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                GM Scope:
              </span>
              <select
                value={selectedTeamFilter}
                onChange={(e) => setSelectedTeamFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border text-xs outline-none cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="all">All Teams</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    Team: {t.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium select-none"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)'
              }}
              title="Restricted: Managers can only view their own team. Cross-team filtering belongs strictly to the General Manager."
            >
              <Lock className="w-3.5 h-3.5 text-text-tertiary" />
              <span>Team: {userTeam?.name || 'Your Team'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border text-text-tertiary bg-surface-elevated border-border font-normal">
                Locked
              </span>
            </div>
          )}

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-3 py-1.5 rounded-xl border text-xs outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            <option value="all">All Workload States</option>
            <option value="clear">Healthy Flow</option>
            <option value="building">Absorbing Work</option>
            <option value="congested">Near Capacity</option>
            <option value="critical">Over Capacity</option>
          </select>
        </div>
      </div>

      {/* Team Member Cards using SpotlightCard */}
      <div className="space-y-3">
        {filteredUsers.map((member) => {
          const cap = employeeCapacities[member.id] || {
            capacityPercent: 50,
            assignedHours: 19,
            capacityHoursPerWeek: 38,
            activeJobsCount: 2,
            dueSoonCount: 0,
            blockedCount: 0,
            trafficState: 'clear'
          };

          const isOver = cap.capacityPercent >= 95;
          const isNear = cap.capacityPercent >= 80;
          const team = teams.find((t) => t.id === member.teamId);

          return (
            <SpotlightCard
              key={member.id}
              onClick={() => setSelectedEmployeeId(member.id)}
              className="p-4 sm:p-5 cursor-pointer transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Member identity */}
                <div className="flex items-center gap-3.5 min-w-[260px]">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
                    style={{
                      backgroundColor: 'var(--color-brand)',
                      color: 'var(--color-brand-contrast)'
                    }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-text-primary">
                        {member.name}
                      </span>
                      <SeniorityBadge seniority={member.seniority || 'mid'} size="xs" />
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-elevated text-text-secondary border border-border-subtle">
                        {team?.name}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary">
                      {member.jobTitle}
                    </div>
                  </div>
                </div>

                {/* Workload Capacity Meter */}
                <div className="flex-1 max-w-xl">
                  <CapacityMeter
                    percent={cap.capacityPercent}
                    hoursCommitted={cap.assignedHours}
                    hoursContracted={cap.capacityHoursPerWeek}
                    label="Operational Load"
                    size="sm"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {canGenerateReportForUser(currentUser, member, users, teams) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openReportModal(member.id);
                      }}
                      title={`Generate performance report for ${member.name}`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="hidden sm:inline">PDF Dossier</span>
                    </button>
                  )}
                  <div
                    className="text-xs font-semibold flex items-center gap-0.5"
                    style={{ color: 'var(--color-brand)' }}
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
};

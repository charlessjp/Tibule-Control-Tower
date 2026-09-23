import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OperationalEvent, OperationalEventType } from '../../types';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Filter,
  Sparkles,
  Search,
  Tag
} from 'lucide-react';

export const OperationalEventStream: React.FC = () => {
  const { operationalEvents, theme } = useApp();
  const isDark = theme === 'dark';

  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEvents = operationalEvents.filter((ev) => {
    if (filterType !== 'all' && ev.eventType !== filterType) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchJob = ev.jobId.toLowerCase().includes(term);
      const matchTitle = (ev.jobTitle || '').toLowerCase().includes(term);
      const matchSummary = ev.summary.toLowerCase().includes(term);
      const matchActor = ev.actorName.toLowerCase().includes(term);
      if (!matchJob && !matchTitle && !matchSummary && !matchActor) {
        return false;
      }
    }
    return true;
  });

  const getEventBadge = (eventType: OperationalEventType, impact?: 'neutral' | 'congested' | 'blocked') => {
    switch (eventType) {
      case 'client_revert_received':
        return {
          icon: RotateCcw,
          label: 'Client Revert',
          color: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
        };
      case 'blocker_logged':
        return {
          icon: ShieldAlert,
          label: 'Blocker Logged',
          color: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        };
      case 'blocker_resolved':
        return {
          icon: CheckCircle2,
          label: 'Blocker Cleared',
          color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        };
      case 'allocation_overridden':
        return {
          icon: AlertCircle,
          label: 'Allocation Override',
          color: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
        };
      case 'quality_review_completed':
        return {
          icon: UserCheck,
          label: 'Review Passed',
          color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        };
      case 'client_submitted':
        return {
          icon: ArrowRight,
          label: 'Client Sent',
          color: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
        };
      case 'cycle_started':
        return {
          icon: Clock,
          label: 'Cycle Started',
          color: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        };
      default:
        return {
          icon: Activity,
          label: eventType.replace(/_/g, ' '),
          color: 'bg-surface-elevated text-text-secondary border-border'
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-surface">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search events by deliverable, actor, summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface text-text-primary text-xs outline-hidden focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-text-tertiary" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary text-xs outline-hidden focus:border-brand cursor-pointer"
          >
            <option value="all">All Operational Events ({operationalEvents.length})</option>
            <option value="cycle_started">Cycle Transitions</option>
            <option value="allocation_overridden">Allocation Overrides</option>
            <option value="client_revert_received">Client Reverts</option>
            <option value="blocker_logged">Blockers Logged</option>
            <option value="blocker_resolved">Blockers Resolved</option>
            <option value="quality_review_completed">Manager Reviews</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2.5">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-border bg-surface text-text-tertiary text-xs">
            No operational events matched current filter.
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const badge = getEventBadge(ev.eventType, ev.impact);
            const Icon = badge.icon;

            return (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated transition-colors flex items-start gap-3.5"
              >
                <div
                  className={`p-2 rounded-lg border shrink-0 mt-0.5 ${badge.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-brand)' }}>
                        {ev.jobId}
                      </span>
                      {ev.jobTitle && (
                        <span className="text-xs font-semibold text-text-primary truncate max-w-xs sm:max-w-md">
                          {ev.jobTitle}
                        </span>
                      )}
                      {ev.cycleNumber && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-surface-elevated border border-border text-text-secondary">
                          Cycle {ev.cycleNumber}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-text-tertiary shrink-0">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(ev.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {ev.summary}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-text-tertiary mt-2 flex-wrap">
                    <span>Actor: <strong className="text-text-primary">{ev.actorName}</strong> ({ev.actorRole})</span>
                    {ev.reworkClassification && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-text-tertiary" />
                          Class: <strong className="text-text-primary uppercase">{ev.reworkClassification}</strong>
                        </span>
                      </>
                    )}
                    {ev.revertCategory && (
                      <>
                        <span>•</span>
                        <span>Category: <strong className="text-text-primary">{ev.revertCategory.replace(/_/g, ' ')}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

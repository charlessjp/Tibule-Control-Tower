import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, History, Filter, ShieldCheck, Clock, User, ArrowRight } from 'lucide-react';
import { formatAuditAction, formatRole, formatReadable } from '../../utils/formatters';

interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditTrailDrawer: React.FC<AuditTrailDrawerProps> = ({ isOpen, onClose }) => {
  const { auditEvents, theme } = useApp();
  const isDark = theme === 'dark';
  const [filterAction, setFilterAction] = useState<string>('all');

  if (!isOpen) return null;

  const filteredEvents = filterAction === 'all'
    ? auditEvents
    : auditEvents.filter((e) => e.action.toLowerCase().includes(filterAction.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div
        id="audit-trail-drawer"
        className="w-full max-w-xl h-full border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
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
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, transparent)',
                color: 'var(--color-brand)'
              }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-text-tertiary font-semibold">
                Organisational Governance
              </div>
              <h2 className="text-base font-bold text-text-primary">System Audit Trail</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            style={{ backgroundColor: 'transparent' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-3 border-b border-border bg-surface-elevated/20 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-text-tertiary" />
            Filter event type:
          </span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs bg-surface border border-border rounded-md px-2.5 py-1 text-text-primary focus:outline-none focus:border-brand-primary"
          >
            <option value="all">All Events ({auditEvents.length})</option>
            <option value="job">Jobs & Tasks</option>
            <option value="case">Studio Cases</option>
            <option value="user">User & Access</option>
            <option value="team">Teams</option>
            <option value="recognition">Recognitions</option>
          </select>
        </div>

        {/* List of Events */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary text-sm">
              No matching audit records in current filter.
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg bg-surface-elevated/60 border border-border/70 hover:border-border text-xs transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-surface border border-border text-brand-primary">
                    {formatAuditAction(event.action)}
                  </span>
                  <span className="text-text-tertiary font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {new Date(event.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-sm font-semibold text-text-primary mb-1">
                  {event.objectTitle} <span className="font-mono text-xs text-text-tertiary font-normal">({event.objectId})</span>
                </div>

                {event.details && (
                  <p className="text-text-secondary mb-2 leading-relaxed">
                    {event.details}
                  </p>
                )}

                {(event.previousValue || event.newValue) && (
                  <div className="p-2 rounded bg-surface border border-border/50 flex items-center gap-2 font-mono text-[11px] mb-2">
                    <span className="text-text-tertiary">{event.previousValue ? formatReadable(event.previousValue) : 'N/A'}</span>
                    <ArrowRight className="w-3 h-3 text-text-tertiary shrink-0" />
                    <span className="font-semibold text-text-primary">{event.newValue ? formatReadable(event.newValue) : 'N/A'}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-text-tertiary pt-2 border-t border-border/40">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Actor: <span className="font-medium text-text-secondary">{event.actorName}</span>
                  </span>
                  <span className="text-[10px] text-text-tertiary">{formatRole(event.actorRole)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-elevated/40 text-xs text-text-tertiary flex items-center justify-between">
          <span>Immutable audit record under Tibule internal governance</span>
          <span className="font-mono text-[10px]">ID: AUDIT-SEC-TOWER</span>
        </div>
      </div>
    </div>
  );
};

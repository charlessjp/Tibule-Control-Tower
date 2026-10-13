import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatElapsedSeconds } from '../../data/clientServicesTimesheets';
import { CONFIRMED_CS_DISCIPLINES } from '../../data/clientServicesOperatingModel';
import { CSDisciplineId } from '../../types';
import {
  Play,
  Square,
  Clock,
  Plus,
  RefreshCw,
  Trash2,
  Tag,
  Briefcase,
  Layers
} from 'lucide-react';

interface CSActiveTimerWidgetProps {
  onOpenLogModal?: () => void;
}

export const CSActiveTimerWidget: React.FC<CSActiveTimerWidgetProps> = ({ onOpenLogModal }) => {
  const {
    activeTimer,
    startTimer,
    stopTimer,
    cancelTimer,
    jobs,
    brands,
    currentUser,
    adjustTimesheetHours
  } = useApp();

  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    const csJob = jobs.find((j) => j.teamId === 'team-client-service' || j.discipline === 'Client Services');
    return csJob ? csJob.id : jobs[0]?.id || '';
  });

  const [selectedDisciplineId, setSelectedDisciplineId] = useState<CSDisciplineId | 'account_management'>('digital_media');
  const [timerNotes, setTimerNotes] = useState('');

  // Active client deliverables available for selection
  const clientJobs = jobs.filter(
    (j) =>
      j.teamId === 'team-client-service' ||
      j.discipline === 'Client Services' ||
      brands.some((b) => b.id === j.brandId) ||
      j.status !== 'completed'
  );

  const handleStart = () => {
    const job = jobs.find((j) => j.id === selectedJobId);
    startTimer({
      jobId: selectedJobId,
      jobTitle: job?.title || 'Client Brief & Account Coordination',
      clientName: job?.clientProject || 'Client Account',
      disciplineId: selectedDisciplineId,
      description: timerNotes || 'Active task execution'
    });
  };

  const handleStopAndCommit = () => {
    stopTimer(timerNotes);
    setTimerNotes('');
  };

  return (
    <div className="bg-surface-elevated border border-border/80 rounded-2xl p-4 shadow-xs transition-all">
      {activeTimer && activeTimer.isRunning ? (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Active Job & Discipline Indicator */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary">
                  Timer Running
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-medium bg-brand/10 text-brand border border-brand/20">
                  {activeTimer.clientName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-medium bg-surface text-text-secondary border border-border">
                  {CONFIRMED_CS_DISCIPLINES.find((d) => d.id === activeTimer.disciplineId)?.name || 'Account Management'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-text-primary mt-0.5 truncate max-w-md">
                {activeTimer.jobTitle}
              </h3>
            </div>
          </div>

          {/* Running Clock & Actions */}
          <div className="flex items-center gap-4 flex-wrap md:justify-end">
            <div className="bg-surface border border-border rounded-xl px-4 py-2 text-center">
              <span className="text-xs font-mono uppercase tracking-widest text-text-tertiary block text-[10px]">
                Active Duration
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-text-primary tracking-tight tabular-nums">
                {formatElapsedSeconds(activeTimer.elapsedSeconds || 0)}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleStopAndCommit}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-95"
                style={{
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-brand-contrast)'
                }}
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop &amp; Log Time</span>
              </button>

              <button
                onClick={cancelTimer}
                title="Discard Timer"
                className="p-2.5 rounded-xl border border-border bg-surface text-text-secondary hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface border border-border text-text-tertiary shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-primary">
                  Activity Stopwatch
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Universal 40h Baseline
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Track client coordination &amp; specialist discipline execution in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick Brief Selector */}
            <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl px-2.5 py-1.5 text-xs">
              <Briefcase className="w-3.5 h-3.5 text-text-tertiary" />
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="bg-transparent text-text-primary text-xs focus:outline-none max-w-[180px] sm:max-w-[220px] truncate"
              >
                {clientJobs.map((j) => (
                  <option key={j.id} value={j.id} className="bg-surface text-text-primary">
                    {j.clientProject ? `${j.clientProject}: ` : ''}{j.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Discipline Selector */}
            <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl px-2.5 py-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-text-tertiary" />
              <select
                value={selectedDisciplineId}
                onChange={(e) => setSelectedDisciplineId(e.target.value as any)}
                className="bg-transparent text-text-primary text-xs focus:outline-none max-w-[160px] truncate"
              >
                <option value="account_management" className="bg-surface text-text-primary">
                  Account Management
                </option>
                {CONFIRMED_CS_DISCIPLINES.map((d) => (
                  <option key={d.id} value={d.id} className="bg-surface text-text-primary">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Timer Button */}
            <button
              onClick={handleStart}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Timer</span>
            </button>

            {/* Quick Manual Log Modal Trigger */}
            {onOpenLogModal && (
              <button
                onClick={onOpenLogModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-border bg-surface text-text-primary hover:bg-surface-elevated transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manual Log</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

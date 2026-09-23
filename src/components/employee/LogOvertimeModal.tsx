import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OvertimePeriod } from '../../types';
import {
  X,
  Clock,
  Sunrise,
  Sunset,
  Calendar,
  Sparkles,
  Award,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export const LogOvertimeModal: React.FC = () => {
  const {
    currentUser,
    jobs,
    isLogOvertimeModalOpen,
    closeLogOvertimeModal,
    logOvertimeTargetJobId,
    logOvertime
  } = useApp();

  // Tasks assigned to current user or available in their squad
  const myJobs = jobs.filter((j) => j.assigneeId === currentUser.id && j.status !== 'completed');
  const allEligibleJobs = myJobs.length > 0 ? myJobs : jobs.filter((j) => j.teamId === currentUser.teamId);

  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [period, setPeriod] = useState<OvertimePeriod>('post_5pm');
  const [date, setDate] = useState<string>('2026-09-21');
  const [startTime, setStartTime] = useState<string>('17:30');
  const [endTime, setEndTime] = useState<string>('19:30');
  const [hours, setHours] = useState<number>(2.0);
  const [materialNote, setMaterialNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Sync selected job when opened
  useEffect(() => {
    if (logOvertimeTargetJobId) {
      setSelectedJobId(logOvertimeTargetJobId);
    } else if (allEligibleJobs[0]) {
      setSelectedJobId(allEligibleJobs[0].id);
    }
  }, [logOvertimeTargetJobId, allEligibleJobs]);

  // Adjust default times when period changes
  const handlePeriodSelect = (p: OvertimePeriod) => {
    setPeriod(p);
    if (p === 'pre_9am') {
      setStartTime('07:00');
      setEndTime('09:00');
      setHours(2.0);
    } else if (p === 'post_5pm') {
      setStartTime('17:30');
      setEndTime('19:30');
      setHours(2.0);
    } else {
      setStartTime('10:00');
      setEndTime('14:00');
      setHours(4.0);
    }
  };

  if (!isLogOvertimeModalOpen) return null;

  const targetJob = jobs.find((j) => j.id === selectedJobId);

  // Calculate points preview
  const multiplier = period === 'weekend_crunch' ? 1.5 : period === 'pre_9am' ? 1.25 : 1.1;
  const projectedPoints = Math.round(hours * 10 * multiplier);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) {
      setError('Please select a deliverable/task on your plate.');
      return;
    }
    if (hours <= 0 || hours > 16) {
      setError('Please enter a valid number of hours (0.5 to 16).');
      return;
    }
    if (!materialNote.trim() || materialNote.trim().length < 10) {
      setError('Please provide a substantive material note (at least 10 characters) explaining what deliverable was pushed or blocker was resolved.');
      return;
    }

    setError(null);
    logOvertime({
      jobId: selectedJobId,
      period,
      date,
      startTime,
      endTime,
      hoursLogged: hours,
      materialNote: materialNote.trim()
    });
  };

  return (
    <div
      id="log-overtime-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="log-overtime-modal-card"
        className="relative w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-start justify-between bg-surface-elevated/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider"
                style={{
                  backgroundColor: 'var(--color-brand-muted)',
                  color: 'var(--color-brand)'
                }}
              >
                Standard Day: 9:00 AM – 5:00 PM
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Good Books Material
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Log Dedicated Overtime
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Log focused hours worked outside the 9–5 standard workday on tasks on your plate. Your submission is recorded into the agency Good Books for Manager and GM career appraisals.
            </p>
          </div>
          <button
            onClick={closeLogOvertimeModal}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Select Deliverable / Job */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-primary flex items-center justify-between">
              <span>Deliverable on Your Plate</span>
              <span className="text-[10px] text-text-tertiary font-mono">
                {allEligibleJobs.length} active tasks
              </span>
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary font-medium focus:outline-none focus:border-brand-primary"
            >
              {allEligibleJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  [{j.id}] {j.title} ({j.clientProject || j.requestor})
                </option>
              ))}
            </select>
            {targetJob && (
              <p className="text-[11px] text-text-tertiary flex items-center gap-1.5 mt-1">
                <Briefcase className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Client / Brand: <strong>{targetJob.brandName || targetJob.clientProject}</strong> · Priority: <strong className="uppercase">{targetJob.priority}</strong></span>
              </p>
            )}
          </div>

          {/* 2. Overtime Period Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-primary">
              Overtime Window
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePeriodSelect('pre_9am')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  period === 'pre_9am'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                    : 'border-border bg-surface-elevated/40 text-text-secondary hover:border-border-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sunrise className="w-4 h-4 text-amber-500" />
                  <span className="text-[9px] font-mono uppercase px-1 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300">
                    +25%
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs">Pre-9:00 AM</div>
                  <div className="text-[10px] text-text-tertiary font-normal">Dawn Patrol</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePeriodSelect('post_5pm')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  period === 'post_5pm'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'border-border bg-surface-elevated/40 text-text-secondary hover:border-border-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sunset className="w-4 h-4 text-indigo-500" />
                  <span className="text-[9px] font-mono uppercase px-1 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                    +10%
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs">Post-5:00 PM</div>
                  <div className="text-[10px] text-text-tertiary font-normal">Evening Crunch</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePeriodSelect('weekend_crunch')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  period === 'weekend_crunch'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                    : 'border-border bg-surface-elevated/40 text-text-secondary hover:border-border-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className="text-[9px] font-mono uppercase px-1 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300">
                    +50%
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs">Weekend Sprint</div>
                  <div className="text-[10px] text-text-tertiary font-normal">High Impact</div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Date & Time Window */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-medium text-text-secondary block mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-text-secondary block mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-text-secondary block mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* 4. Total Hours Stepper */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-primary flex items-center justify-between">
              <span>Total Overtime Hours</span>
              <span className="text-xs font-mono font-bold text-amber-500">
                {hours} hrs
              </span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 1.5, 2, 2.5, 3, 4, 5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setHours(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    hours === preset
                      ? 'bg-amber-500 text-white font-bold'
                      : 'bg-surface-elevated border border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {preset}h
                </button>
              ))}
            </div>
          </div>

          {/* 5. Material Note (The "Good Books" Evidence) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-primary flex items-center justify-between">
              <span>Material Deliverable Note</span>
              <span className="text-[10px] text-text-tertiary">
                Essential for GM & Manager review
              </span>
            </label>
            <textarea
              value={materialNote}
              onChange={(e) => setMaterialNote(e.target.value)}
              rows={3}
              placeholder="e.g. Stayed after 5 PM to finalize high-res typography lockups and master video render before the morning 10 AM client review."
              className="w-full p-2.5 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary leading-relaxed"
            />
          </div>

          {/* 6. Good Books Reward Preview Box */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">
                  +{projectedPoints} Good Books Dedication Points
                </div>
                <div className="text-[10px] text-text-tertiary">
                  Visible to Studio Manager & General Manager for salary/promotion reviews
                </div>
              </div>
            </div>
            <Award className="w-5 h-5 text-amber-500 shrink-0" />
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeLogOvertimeModal}
              className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record to Good Books</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

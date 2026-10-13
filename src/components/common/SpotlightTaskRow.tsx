import React, { useRef, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Job } from '../../types';
import { formatStatus } from '../../utils/formatters';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Circle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';

interface SpotlightTaskRowProps {
  job: Job;
  onClick?: () => void;
  isSelected?: boolean;
}

export const SpotlightTaskRow: React.FC<SpotlightTaskRowProps> = ({
  job,
  onClick,
  isSelected = false
}) => {
  const { theme, users, currentPalette } = useApp();
  const isDark = theme === 'dark';

  const rowRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [opacity, setOpacity] = useState(0);

  const assignee = users.find((u) => u.id === job.assigneeId);
  const isBlocked = job.status === 'blocked';
  const isCompleted = job.status === 'completed';

  const updateCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    setPosition({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
    setOpacity(1);
  }, []);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    updateCoordinates(e.clientX, e.clientY);
  }, [updateCoordinates]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    updateCoordinates(e.clientX, e.clientY);
  }, [updateCoordinates]);

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
  }, []);

  // Spotlight color from theme
  const effectiveSpotlight = isDark
    ? currentPalette?.dark.glowPrimary || 'rgba(3, 193, 214, 0.45)'
    : currentPalette?.light.glowPrimary || 'rgba(3, 193, 214, 0.25)';

  const haloBorderColor = isDark
    ? currentPalette?.dark.accentPrimary || 'var(--color-brand)'
    : currentPalette?.light.accentPrimary || 'var(--color-brand)';

  // Calculate progress percent
  const percentComplete = job.estimatedHours > 0
    ? Math.min(100, Math.round(((job.actualHours || 0) / job.estimatedHours) * 100))
    : 0;

  // Format Due Date cleanly
  const formatDueDate = (dateStr: string) => {
    if (!dateStr) return { label: 'No due date', isNormal: true };
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    if (diffDays < 0) return { label: `${formatted} (Overdue)`, isOverdue: true };
    if (diffDays === 0) return { label: `${formatted} (Today)`, isToday: true };
    if (diffDays === 1) return { label: `${formatted} (Tomorrow)`, isSoon: true };
    if (diffDays <= 3) return { label: `${formatted} (in ${diffDays}d)`, isSoon: true };
    return { label: formatted, isNormal: true };
  };

  const dueInfo = formatDueDate(job.dueDate);

  return (
    <div
      ref={rowRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        backgroundColor: isSelected
          ? 'var(--color-surface-elevated)'
          : 'var(--color-surface)',
        borderColor: isSelected
          ? 'var(--color-brand)'
          : opacity > 0
          ? 'var(--color-brand)'
          : 'var(--color-border)',
        boxShadow: isSelected
          ? '0 0 24px -2px var(--color-halo-glow, rgba(3,193,214,0.3)), 0 6px 16px -3px rgba(0, 0, 0, 0.3)'
          : opacity > 0
          ? (isDark
              ? '0 0 28px -4px var(--color-halo-glow, rgba(3,193,214,0.4)), 0 0 10px -2px var(--color-brand), 0 10px 24px -6px rgba(0, 0, 0, 0.45)'
              : '0 0 20px -2px var(--color-halo-glow, rgba(3,193,214,0.25)), 0 0 8px -2px var(--color-brand), 0 6px 18px -4px rgba(0, 0, 0, 0.1)')
          : undefined
      }}
      className={`relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer group select-none ${
        isSelected ? 'ring-2 ring-[var(--color-brand)]/30' : ''
      }`}
    >
      {/* Interactive Cursor-Following Radial Halo Border Ring */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[1px] rounded-[inherit] transition-opacity duration-150 z-20"
        style={{
          opacity,
          background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, var(--color-brand), transparent 70%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1.5px'
        }}
      />

      {/* Interactive Cursor Spotlight Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-150 z-0"
        style={{
          opacity,
          background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, ${effectiveSpotlight}, transparent 65%)`
        }}
      />

      {/* Row Content */}
      <div className="relative z-10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Column: ID, Title, Project, Blocker */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Task ID (Unboxed Mono) */}
            <span
              className="font-mono text-xs font-bold tracking-tight shrink-0"
              style={{
                color: 'var(--color-brand)'
              }}
            >
              {job.id}
            </span>

            <span className="text-border text-xs">/</span>

            {/* Priority Indicator */}
            <PriorityBadge priority={job.priority} size="xs" />

            <span className="text-border text-xs">/</span>

            {/* Status Indicator */}
            <span
              className="text-[11px] font-bold inline-flex items-center gap-1.5"
              style={{
                color: isCompleted
                  ? 'var(--color-success)'
                  : isBlocked
                  ? 'var(--color-critical)'
                  : job.status === 'in_progress'
                  ? 'var(--color-brand)'
                  : 'var(--color-text-secondary)'
              }}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : isBlocked ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              ) : job.status === 'in_progress' ? (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] animate-ping" />
              ) : (
                <Circle className="w-2 h-2 text-text-tertiary" />
              )}
              <span>{formatStatus(job.status)}</span>
            </span>

            <span className="text-border text-xs">·</span>

            {/* Client Project */}
            <span className="text-xs text-text-secondary font-medium">
              {job.clientProject}
            </span>

            {job.workflowStage && (
              <>
                <span className="text-border text-xs">·</span>
                <WorkflowStatusBadge stage={job.workflowStage} size="sm" />
              </>
            )}
          </div>

          {/* Task Title */}
          <h3 className="text-sm font-bold tracking-tight transition-colors line-clamp-1 text-text-primary group-hover:text-[var(--color-brand)]">
            {job.title}
          </h3>

          {/* Blocker Alert (if any) */}
          {isBlocked && (
            <div className="flex items-center gap-1.5 text-xs text-purple-400 pt-0.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">
                Waiting on: {job.blockerReason || 'External dependency review'}
              </span>
            </div>
          )}
        </div>

        {/* Right Columns: Progress, Due Date, Assignee, Arrow */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0 pt-2 md:pt-0">
          {/* Progress / Hours Tracker */}
          <div className="w-28 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-text-secondary">
                {job.actualHours || 0}h / {job.estimatedHours}h
              </span>
              <span className="font-bold text-text-primary">
                {percentComplete}%
              </span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-surface-muted border border-border-subtle">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500'
                    : isBlocked
                    ? 'bg-purple-500'
                    : ''
                }`}
                style={{
                  width: `${percentComplete}%`,
                  backgroundColor: !isCompleted && !isBlocked ? 'var(--color-brand)' : undefined
                }}
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="min-w-[100px] text-right">
            <div className="flex items-center justify-end gap-1 text-[11px] text-[#64748b]">
              <Clock className="w-3 h-3" />
              <span>Due</span>
            </div>
            <div
              className={`text-xs font-semibold ${
                dueInfo.isOverdue
                  ? 'text-rose-500 font-bold'
                  : dueInfo.isToday || dueInfo.isSoon
                  ? 'text-amber-500 font-bold'
                  : isDark
                  ? 'text-[#cbd5e1]'
                  : 'text-[#334155]'
              }`}
            >
              {dueInfo.label}
            </div>
          </div>

          {/* Assignee Avatar */}
          <div className="hidden sm:flex items-center gap-2 min-w-[120px]">
            {assignee ? (
              <>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-brand) 15%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--color-brand) 30%, transparent)',
                    color: 'var(--color-brand)'
                  }}
                >
                  {assignee.name.charAt(0)}
                </div>
                <div className="truncate text-left">
                  <div className="text-xs font-semibold truncate text-text-primary">
                    {assignee.name}
                  </div>
                  <div className="text-[10px] text-text-tertiary truncate">
                    {assignee.jobTitle}
                  </div>
                </div>
              </>
            ) : (
              <span className="text-xs text-amber-500 italic">Unassigned</span>
            )}
          </div>

          {/* Open / Inspect Action Pill */}
          <div className="p-2 rounded-lg border border-border bg-surface-elevated text-text-tertiary group-hover:text-text-primary group-hover:border-[var(--color-brand)] transition-all duration-200 group-hover:scale-105 shrink-0">
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Top overlay light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-150 z-30"
        style={{
          opacity: opacity > 0 ? (isDark ? 0.3 : 0.15) : 0,
          background: `radial-gradient(380px circle at ${position.x}px ${position.y}px, var(--color-brand), transparent 70%)`,
          mixBlendMode: isDark ? 'screen' : 'overlay'
        }}
      />
    </div>
  );
};

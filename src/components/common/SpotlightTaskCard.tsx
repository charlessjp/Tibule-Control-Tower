import React, { useRef, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Job } from '../../types';
import { formatStatus } from '../../utils/formatters';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  ArrowRight,
  FolderGit2
} from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';

interface SpotlightTaskCardProps {
  job: Job;
  onClick?: () => void;
  isSelected?: boolean;
}

export const SpotlightTaskCard: React.FC<SpotlightTaskCardProps> = ({
  job,
  onClick,
  isSelected = false
}) => {
  const { theme, users, currentPalette } = useApp();
  const isDark = theme === 'dark';

  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [opacity, setOpacity] = useState(0);

  const assignee = users.find((u) => u.id === job.assigneeId);
  const isBlocked = job.status === 'blocked';
  const isCompleted = job.status === 'completed';

  const updateCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
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

  const effectiveSpotlight = isDark
    ? currentPalette?.dark.glowPrimary || 'rgba(3, 193, 214, 0.45)'
    : currentPalette?.light.glowPrimary || 'rgba(3, 193, 214, 0.25)';

  const haloBorderColor = isDark
    ? currentPalette?.dark.accentPrimary || 'var(--color-brand)'
    : currentPalette?.light.accentPrimary || 'var(--color-brand)';

  const percentComplete = job.estimatedHours > 0
    ? Math.min(100, Math.round(((job.actualHours || 0) / job.estimatedHours) * 100))
    : 0;

  return (
    <div
      ref={cardRef}
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
          ? '0 0 28px -2px var(--color-halo-glow, rgba(3,193,214,0.35)), 0 8px 24px -4px rgba(0, 0, 0, 0.35)'
          : opacity > 0
          ? (isDark
              ? '0 0 32px -4px var(--color-halo-glow, rgba(3,193,214,0.4)), 0 0 12px -2px var(--color-brand), 0 12px 28px -6px rgba(0, 0, 0, 0.5)'
              : '0 0 24px -2px var(--color-halo-glow, rgba(3,193,214,0.25)), 0 0 10px -2px var(--color-brand), 0 8px 22px -4px rgba(0, 0, 0, 0.12)')
          : undefined
      }}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col justify-between p-5 select-none ${
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

      {/* Interactive Cursor Surface Spotlight Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-150 z-0"
        style={{
          opacity,
          background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, ${effectiveSpotlight}, transparent 65%)`
        }}
      />

      {/* Card Content Surface */}
      <div className="relative z-10 space-y-3.5">
        {/* Top Indicators (Zero-Pill Typography) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-tight" style={{ color: 'var(--color-brand)' }}>
              {job.id}
            </span>
            <span className="text-border text-xs">/</span>
            <PriorityBadge priority={job.priority} size="xs" />
          </div>

          <span
            className="text-[11px] font-bold inline-flex items-center gap-1.5"
            style={{
              color: isCompleted
                ? 'var(--color-success)'
                : isBlocked
                ? 'var(--color-critical)'
                : 'var(--color-brand)'
            }}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : isBlocked ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Circle className="w-2 h-2 text-[var(--color-brand)] fill-current" />
            )}
            <span>{formatStatus(job.status)}</span>
          </span>
        </div>

        {/* Project & Title */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary mb-1">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>{job.clientProject}</span>
            <span>•</span>
            <span>{job.category}</span>
          </div>

          <h3
            className="text-sm font-bold leading-snug line-clamp-2 transition-colors group-hover:text-[var(--color-brand)]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {job.title}
          </h3>
        </div>

        {/* Blocker Note */}
        {isBlocked && (
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">
              {job.blockerReason || 'Waiting on dependent approvals.'}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-text-secondary">
              Hours: {job.actualHours || 0}h / {job.estimatedHours}h
            </span>
            <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {percentComplete}%
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border-subtle)' }}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-emerald-500' : isBlocked ? 'bg-purple-500' : 'bg-[var(--color-brand)]'
              }`}
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Assignee & Due Date */}
      <div
        className="relative z-10 pt-4 mt-3 border-t flex items-center justify-between text-xs"
        style={{
          borderColor: 'var(--color-border-subtle)'
        }}
      >
        <div className="flex items-center gap-2">
          {assignee ? (
            <>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-brand)'
                }}
              >
                {assignee.name.charAt(0)}
              </div>
              <span className="font-medium text-text-secondary">
                {assignee.name}
              </span>
            </>
          ) : (
            <span className="text-amber-500 italic">Unassigned</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-text-tertiary text-[11px]">
          <Clock className="w-3 h-3" />
          <span>{job.dueDate?.split('T')[0] || 'No date'}</span>
        </div>
      </div>

      {/* Top overlay light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-150 z-30"
        style={{
          opacity: opacity > 0 ? (isDark ? 0.35 : 0.16) : 0,
          background: `radial-gradient(380px circle at ${position.x}px ${position.y}px, var(--color-brand), transparent 70%)`,
          mixBlendMode: isDark ? 'screen' : 'overlay'
        }}
      />
    </div>
  );
};

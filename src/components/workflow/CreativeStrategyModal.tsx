import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, Complexity } from '../../types';
import { INITIAL_BRANDS } from '../../data/brands';
import {
  X,
  Sparkles,
  Users,
  Lightbulb,
  CheckCircle2,
  Layers,
  ArrowRight,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface CreativeStrategyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CreativeStrategyModal: React.FC<CreativeStrategyModalProps> = ({
  job,
  isOpen,
  onClose
}) => {
  const { users, currentUser, completeStrategyMeeting } = useApp();

  const brand = (job && INITIAL_BRANDS.find((b) => b.id === job.brandId)) ||
    (job && INITIAL_BRANDS.find((b) => b.name === job.requestor)) ||
    INITIAL_BRANDS[0];

  const csSubmitter = users.find(
    (u) => u.name === job?.debriefMaterial?.preparedByName || u.id === job?.debriefMaterial?.preparedBy
  ) || users.find((u) => u.role === 'client_service') || users[0];

  const cdLead = users.find((u) => u.id === brand?.managerId) ||
    users.find((u) => u.role === 'director' || u.role === 'manager') ||
    users[0];

  const attendees = job?.debriefMeeting?.attendees || [
    { userId: csSubmitter.id, name: csSubmitter.name, role: 'Client Services', isCompulsory: true, isPresent: true },
    { userId: cdLead.id, name: cdLead.name, role: cdLead.jobTitle, isCompulsory: true, isPresent: true }
  ];

  // State for Strategy & Brainstorming session
  const [agreedCreativeAngle, setAgreedCreativeAngle] = useState(
    job?.strategyMeeting?.agreedCreativeAngle ||
    `Authentic Ghanaian cultural hook with bold contrast, energetic pacing, and localized vernacular dialogue.`
  );
  const [strategyNotes, setStrategyNotes] = useState(
    job?.strategyMeeting?.strategyNotes ||
    `Brainstormed narrative structure with ${cdLead.name} and creative specialists. Emphasized authentic Accra street warmth over generic stock visuals. Confirmed audio landscape: high-energy afrobeats rhythm with crisp voiceover.`
  );
  const [deliverablesBreakdown, setDeliverablesBreakdown] = useState(
    job?.strategyMeeting?.deliverablesBreakdownNotes ||
    `1. Master 16:9 Hero Asset\n2. 9:16 Vertical Cutdown for Social Reels\n3. Static Key Visual Poster (Digital & Print)\n4. Social Carousel Set (3 cards)`
  );
  const [complexity, setComplexity] = useState<Complexity>(job?.complexity || 'medium');
  const [estimatedHours, setEstimatedHours] = useState<number>(job?.estimatedHours || 16);

  if (!isOpen || !job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeStrategyMeeting(job.id, {
      agreedCreativeAngle,
      strategyNotes,
      complexity,
      estimatedHours: Number(estimatedHours),
      deliverablesBreakdownNotes: deliverablesBreakdown
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="creative-strategy-modal"
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
                style={{
                  backgroundColor: 'var(--color-brand-muted)',
                  borderColor: 'var(--color-brand)',
                  color: 'var(--color-brand)'
                }}
              >
                Stage 4: Creative Strategy &amp; Brainstorm
              </span>
              <span className="text-xs font-mono font-bold text-text-tertiary">
                {job.id} • {brand.name}
              </span>
            </div>
            <h2 className="text-base font-bold mt-0.5 text-text-primary">
              Creative Strategy &amp; Brainstorming Session
            </h2>
            <p className="text-xs mt-0.5 text-text-tertiary">
              Conducted with debrief stakeholders to figure out how to approach the task and align on creative angles before staff allocation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Stakeholders Present */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-elevated space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                <span>Strategy Session Participants</span>
              </span>
              <span className="text-[10px] text-emerald-500 font-normal">
                ✓ Debrief stakeholders convened
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-surface border border-border text-[11px] flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-[10px]">
                  CS
                </div>
                <div className="truncate">
                  <div className="font-bold text-text-primary truncate">{csSubmitter.name}</div>
                  <div className="text-[9px] text-text-tertiary truncate">CS Debrief Submitter</div>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-surface border border-border text-[11px] flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">
                  CD
                </div>
                <div className="truncate">
                  <div className="font-bold text-text-primary truncate">{cdLead.name}</div>
                  <div className="text-[9px] text-text-tertiary truncate">{cdLead.jobTitle}</div>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-surface border border-border text-[11px] flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px]"
                  style={{ backgroundColor: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
                >
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="truncate">
                  <div className="font-bold text-text-primary truncate">Creative Team</div>
                  <div className="text-[9px] text-text-tertiary truncate">Design &amp; Copy Specialists</div>
                </div>
              </div>
            </div>
          </div>

          {/* Agreed Creative Angle */}
          <div>
            <label className="block font-bold text-text-secondary mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Agreed Creative Direction &amp; Narrative Angle</span>
            </label>
            <input
              type="text"
              required
              value={agreedCreativeAngle}
              onChange={(e) => setAgreedCreativeAngle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-text-primary focus:outline-hidden focus:border-[var(--color-brand)]"
              placeholder="e.g. Authentic Ghanaian street culture, bold typography, warm color grade..."
            />
            <p className="text-[10px] text-text-tertiary mt-1">
              The creative north star agreed in the brainstorm session that guides artist execution.
            </p>
          </div>

          {/* Brainstorming Discussion Notes */}
          <div>
            <label className="block font-bold text-text-secondary mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
              <span>Brainstorming Notes &amp; Technical Execution Plan</span>
            </label>
            <textarea
              rows={3}
              required
              value={strategyNotes}
              onChange={(e) => setStrategyNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-hidden focus:border-[var(--color-brand)]"
              placeholder="Document visual references, sound design ideas, layout approach, motion pacing..."
            />
          </div>

          {/* Deliverables Breakdown */}
          <div>
            <label className="block font-bold text-text-secondary mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-500" />
              <span>Deliverable Breakdown &amp; Asset Variations Agreed</span>
            </label>
            <textarea
              rows={3}
              value={deliverablesBreakdown}
              onChange={(e) => setDeliverablesBreakdown(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-mono text-text-primary focus:outline-hidden focus:border-[var(--color-brand)]"
              placeholder="List the exact variations agreed during the brainstorm session..."
            />
          </div>

          {/* Complexity & Effort Confirmation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-border bg-surface-elevated">
            <div>
              <label className="block font-bold text-text-secondary mb-1">
                Confirmed Task Complexity
              </label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as Complexity)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-bold text-text-primary"
              >
                <option value="low">Low (Standard iteration / routine layout)</option>
                <option value="medium">Medium (Standard multi-asset creative campaign)</option>
                <option value="high">High (Complex multi-format master campaign)</option>
                <option value="extreme">Extreme (Full brand re-imagination)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-text-secondary mb-1">
                Confirmed Creative Effort (Hours)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-xl border border-border bg-surface text-sm font-bold text-text-primary"
                />
                <span className="text-text-tertiary text-xs">Total production hours budget</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-surface text-xs font-semibold cursor-pointer transition-colors text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalize Strategy &amp; Advance to Staff Allocation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

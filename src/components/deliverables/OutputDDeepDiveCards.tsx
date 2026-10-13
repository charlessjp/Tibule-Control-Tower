import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatStatus } from '../../utils/formatters';
import { SpotlightCard } from '../common/SpotlightCard';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Quote,
  TrendingUp,
  Clock,
  UserCheck,
  AlertTriangle,
  Award,
  ShieldCheck
} from 'lucide-react';

export const OutputDDeepDiveCards: React.FC = () => {
  const { jobs, users, teams, comments, setSelectedJobId, theme } = useApp();
  const isDark = theme === 'dark';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'slide' | 'grid'>('slide');

  // Prepare deep dive entity cards (enriched deliverables with quotes and impact scores)
  const entityCards = jobs.map((job, idx) => {
    const assignee = users.find(u => u.id === job.assigneeId);
    const team = teams.find(t => t.id === job.teamId);
    const jobComments = comments.filter(c => c.jobId === job.id);
    const hoursRatio = job.estimatedHours > 0 ? (job.actualHours / job.estimatedHours) : 1;
    const impactScore = Math.min(99, Math.round(75 + (job.priority === 'urgent' ? 20 : job.priority === 'high' ? 14 : 5) - (job.status === 'blocked' ? 10 : 0)));

    return {
      job,
      assignee,
      team,
      comments: jobComments,
      impactScore,
      hoursRatio: (hoursRatio * 100).toFixed(0),
      quote: jobComments.length > 0 
        ? jobComments[0].content 
        : `Deliverable initiated under ${job.clientProject} scope targeting key milestone delivery.`
    };
  });

  const currentCard = entityCards[currentIndex] || entityCards[0];

  const handleNext = () => {
    if (entityCards.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % entityCards.length);
  };

  const handlePrev = () => {
    if (entityCards.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + entityCards.length) % entityCards.length);
  };

  if (entityCards.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl border border-border bg-surface text-text-secondary">
        <p className="text-sm font-semibold">No active deliverables available for deep-dive inspection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <SpotlightCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-text-primary">Deliverable Deep-Dive Dossier</h1>
            <p className="text-xs text-text-secondary">
              Individual deliverable dossiers detailing project scope, hours variance, contributor notes, and client milestone impact.
            </p>
          </div>

          {/* Mode Switcher & Slide Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'slide' ? 'grid' : 'slide')}
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer text-text-primary hover:bg-surface-elevated"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              {viewMode === 'slide' ? 'Switch to Grid View' : 'Switch to Slide Presentation'}
            </button>

            {viewMode === 'slide' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-xl border cursor-pointer text-text-tertiary hover:text-text-primary"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-mono font-bold text-text-primary">
                  {currentIndex + 1} / {entityCards.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-xl border cursor-pointer text-text-tertiary hover:text-text-primary"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </SpotlightCard>

      {/* Slide Presentation Mode */}
      {viewMode === 'slide' && currentCard && (
        <SpotlightCard className="p-8 md:p-12 max-w-4xl mx-auto" outerRadius={20} padding={24}>
          <div className="space-y-8">
            {/* Slide Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-mono font-bold"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, transparent)',
                      color: 'var(--color-brand)'
                    }}
                  >
                    {currentCard.job.id}
                  </span>
                  <span className="text-text-tertiary">•</span>
                  <span className="text-xs font-semibold text-text-secondary">
                    {currentCard.job.clientProject}
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight mt-2 text-text-primary">{currentCard.job.title}</h2>
                <p className="text-xs mt-1 max-w-2xl text-text-secondary">
                  {currentCard.job.description}
                </p>
              </div>

              {/* Actionable Impact Score Badge */}
              <div
                className="p-4 rounded-2xl border text-center shrink-0 min-w-[120px]"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-[10px] uppercase font-mono text-text-tertiary">Impact Score</div>
                <div className="text-3xl font-black font-mono text-emerald-500 mt-0.5">
                  {currentCard.impactScore}
                </div>
                <div className="text-[10px] text-emerald-500 font-bold mt-0.5">High Velocity</div>
              </div>
            </div>

            {/* Metrics Cluster */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div
                className="p-3.5 rounded-xl border"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-[10px] uppercase font-mono text-text-tertiary">Status</div>
                <div className="text-sm font-bold mt-1" style={{ color: 'var(--color-brand)' }}>
                  {formatStatus(currentCard.job.status)}
                </div>
              </div>
              <div
                className="p-3.5 rounded-xl border"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-[10px] uppercase font-mono text-text-tertiary">Priority</div>
                <div className="text-sm font-bold capitalize mt-1 text-amber-500">
                  {currentCard.job.priority}
                </div>
              </div>
              <div
                className="p-3.5 rounded-xl border"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-[10px] uppercase font-mono text-text-tertiary">Logged / Est</div>
                <div className="text-sm font-bold font-mono mt-1 text-text-primary">
                  {currentCard.job.actualHours}h / {currentCard.job.estimatedHours}h
                </div>
              </div>
              <div
                className="p-3.5 rounded-xl border"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-[10px] uppercase font-mono text-text-tertiary">Due Date</div>
                <div className="text-sm font-bold font-mono mt-1 text-text-primary">
                  {currentCard.job.dueDate}
                </div>
              </div>
            </div>

            {/* Supporting Field Quote / Voice */}
            <div
              className="p-5 rounded-2xl border relative"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              <Quote className="w-6 h-6 opacity-40 absolute top-4 left-4" style={{ color: 'var(--color-brand)' }} />
              <div className="pl-8">
                <div className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: 'var(--color-brand)' }}>
                  Operator Live Feedback &amp; Field Context
                </div>
                <p className="mt-1 text-xs italic leading-relaxed text-text-primary">
                  "{currentCard.quote}"
                </p>
                <div className="mt-2 text-[11px] font-semibold text-text-tertiary flex items-center gap-1.5">
                  <span>Logged by {currentCard.assignee?.name || 'Assigned Operator'}</span>
                  <span>•</span>
                  <span>{currentCard.team?.name || 'Operational Team'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedJobId(currentCard.job.id)}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer transition-all shadow-xs hover:opacity-90"
                style={{ backgroundColor: 'var(--color-brand)' }}
              >
                Inspect in Operational Panel
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer text-text-secondary hover:text-text-primary"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  Previous Card
                </button>
                <button
                  onClick={handleNext}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer text-text-secondary hover:text-text-primary"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  Next Card
                </button>
              </div>
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* Grid Mode View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entityCards.map((card, idx) => (
            <SpotlightCard
              key={card.job.id}
              className="p-5 flex flex-col justify-between cursor-pointer"
              onClick={() => {
                setCurrentIndex(idx);
                setViewMode('slide');
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-brand)' }}>{card.job.id}</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Score: {card.impactScore}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs line-clamp-1 text-text-primary">{card.job.title}</h3>
                  <p className="text-[11px] line-clamp-2 mt-1 text-text-secondary">
                    {card.job.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t flex items-center justify-between text-[11px]" style={{ borderColor: 'var(--color-border)' }}>
                <span className="font-mono text-text-tertiary">{card.job.actualHours}h / {card.job.estimatedHours}h</span>
                <span className="font-semibold" style={{ color: 'var(--color-brand)' }}>View Slide →</span>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}
    </div>
  );
};

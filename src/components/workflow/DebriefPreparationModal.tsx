import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job } from '../../types';
import { INITIAL_BRANDS } from '../../data/brands';
import {
  X,
  FileText,
  Sparkles,
  Send,
  Link,
  Target,
  Layers,
  CheckCircle2,
  Bell
} from 'lucide-react';

interface DebriefPreparationModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DebriefPreparationModal: React.FC<DebriefPreparationModalProps> = ({
  job,
  isOpen,
  onClose
}) => {
  const { currentUser, markDebriefReady } = useApp();

  const brand = INITIAL_BRANDS.find((b) => b.id === job?.brandId) ||
    INITIAL_BRANDS.find((b) => b.name === job?.requestor) ||
    INITIAL_BRANDS[0];

  const [deckTitle, setDeckTitle] = useState(
    job?.debriefMaterial?.deckTitle || `${job?.title || 'Deliverable'} — Agency Debrief Pack`
  );
  const [deliverableSpecs, setDeliverableSpecs] = useState(
    job?.debriefMaterial?.deliverableSpecs ||
      'Master video cuts (30s TVC, 15s digital cutdown), 9:16 vertical reels, storyboard vector frames, and social statics.'
  );
  const [brandToneNotes, setBrandToneNotes] = useState(
    job?.debriefMaterial?.brandToneNotes ||
      'Energetic, culturally authentic Ghanaian youth vibe. Keep typography bold with clean MoMo yellow and contrast black.'
  );
  const [objectiveInput, setObjectiveInput] = useState('');
  const [objectives, setObjectives] = useState<string[]>(
    job?.debriefMaterial?.keyObjectives || [
      'Increase nationwide consumer awareness across Accra, Kumasi, and Takoradi',
      'Establish clear visual hierarchy highlighting the cash reward mechanic',
      'Ensure deliverable compliance across TV broadcast and digital social handles'
    ]
  );
  const [refLinkInput, setRefLinkInput] = useState('');
  const [referenceLinks, setReferenceLinks] = useState<string[]>([]);

  React.useEffect(() => {
    if (job && isOpen) {
      setDeckTitle(
        job.debriefMaterial?.deckTitle || `${job.title} — Agency Debrief Pack`
      );
      setDeliverableSpecs(
        job.debriefMaterial?.deliverableSpecs ||
          'Master video cuts (30s TVC, 15s digital cutdown), 9:16 vertical reels, storyboard vector frames, and social statics.'
      );
      setBrandToneNotes(
        job.debriefMaterial?.brandToneNotes ||
          'Energetic, culturally authentic Ghanaian youth vibe. Keep typography bold with clean brand colors and high contrast.'
      );
      setObjectives(
        job.debriefMaterial?.keyObjectives || [
          'Increase nationwide consumer awareness across Accra, Kumasi, and Takoradi',
          'Establish clear visual hierarchy highlighting the campaign hook',
          'Ensure deliverable compliance across TV broadcast and digital social handles'
        ]
      );
      setReferenceLinks(
        job.debriefMaterial?.referenceLinks || [
          'https://brand.agency.tibule/guidelines/brand-master-2026',
          'https://drive.agency.tibule/campaign-brief.pdf'
        ]
      );
    }
  }, [job?.id, isOpen]);

  if (!isOpen || !job) return null;

  const handleAddObjective = () => {
    if (objectiveInput.trim()) {
      setObjectives([...objectives, objectiveInput.trim()]);
      setObjectiveInput('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleAddRefLink = () => {
    if (refLinkInput.trim()) {
      setReferenceLinks([...referenceLinks, refLinkInput.trim()]);
      setRefLinkInput('');
    }
  };

  const handleSaveAndAlertTraffic = (e: React.FormEvent) => {
    e.preventDefault();
    markDebriefReady(job.id, {
      preparedBy: currentUser.id,
      preparedByName: currentUser.name,
      preparedDate: new Date().toISOString(),
      deckTitle,
      keyObjectives: objectives,
      deliverableSpecs,
      brandToneNotes,
      referenceLinks,
      isReadyForTraffic: true,
      trafficAlertedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="debrief-prep-modal"
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all"
      >
        {/* Modal Header */}
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
                Client Service • Debrief Preparation
              </span>
              <span className="text-xs font-mono font-bold text-text-tertiary">
                {job.id}
              </span>
            </div>
            <h2 className="text-base font-bold mt-0.5">
              Prepare Team Debrief Material
            </h2>
            <p className="text-xs mt-0.5 text-text-tertiary">
              Assemble the debrief deck and deliverable specs for the {brand.name} team. Once marked ready, Traffic Manager Kwame Mensah will schedule the team debrief.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-secondary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveAndAlertTraffic} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Brand & Job Summary Banner */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-elevated flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                style={{
                  backgroundColor: brand.color || 'var(--color-brand)',
                  color: '#000000'
                }}
              >
                {brand.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-text-primary">{brand.name} • {job.title}</div>
                <div className="text-[11px] text-text-tertiary">
                  Client: {job.requestor} • Task: {job.standardTaskType || 'Deliverable'} • Due: {new Date(job.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30">
              Debrief In Prep
            </span>
          </div>

          {/* Deck / Material Title */}
          <div>
            <label className="block font-bold text-text-secondary mb-1">
              Debrief Deck / Pack Title
            </label>
            <input
              type="text"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-hidden focus:border-[var(--color-brand)]"
            />
          </div>

          {/* Deliverables Specifications */}
          <div>
            <label className="block font-bold text-text-secondary mb-1">
              Deliverable Specifications &amp; Asset Requirements
            </label>
            <textarea
              rows={2}
              value={deliverableSpecs}
              onChange={(e) => setDeliverableSpecs(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-hidden focus:border-[var(--color-brand)]"
              placeholder="e.g. Master video cuts, 9:16 reels, vector storyboard frames, clearspace guidelines..."
            />
          </div>

          {/* Brand Tone & Cultural Nuance Notes */}
          <div>
            <label className="block font-bold text-text-secondary mb-1">
              Creative Tone &amp; Cultural Direction (Ghanaian Agency Context)
            </label>
            <input
              type="text"
              value={brandToneNotes}
              onChange={(e) => setBrandToneNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-hidden focus:border-[var(--color-brand)]"
              placeholder="e.g. Warm Accra energy, respectful yet vibrant, local street slang or corporate polish..."
            />
          </div>

          {/* Key Objectives */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-text-secondary flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                <span>Key Campaign Objectives for Team</span>
              </label>
              <span className="text-[10px] text-text-tertiary">
                {objectives.length} items defined
              </span>
            </div>
            <div className="space-y-1.5 mb-2">
              {objectives.map((obj, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg border border-border bg-surface-elevated text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px]"
                      style={{
                        backgroundColor: 'var(--color-brand-muted)',
                        color: 'var(--color-brand)'
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-text-primary">{obj}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(idx)}
                    className="text-text-tertiary hover:text-rose-500 cursor-pointer p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={objectiveInput}
                onChange={(e) => setObjectiveInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddObjective();
                  }
                }}
                placeholder="Add objective (e.g. Ensure 100% MoMo QR code readability)..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-text-primary focus:outline-hidden focus:border-[var(--color-brand)]"
              />
              <button
                type="button"
                onClick={handleAddObjective}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold cursor-pointer text-text-primary hover:bg-surface-elevated"
              >
                Add
              </button>
            </div>
          </div>

          {/* Reference Links */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-text-secondary flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                <span>Reference Decks &amp; Asset Links</span>
              </label>
            </div>
            <div className="space-y-1 mb-2">
              {referenceLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 px-2 rounded-lg border border-border bg-surface-elevated text-[11px] font-mono text-text-secondary"
                >
                  <span className="truncate max-w-[450px]">{link}</span>
                  <button
                    type="button"
                    onClick={() => setReferenceLinks(referenceLinks.filter((_, i) => i !== idx))}
                    className="text-text-tertiary hover:text-rose-500 cursor-pointer p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={refLinkInput}
                onChange={(e) => setRefLinkInput(e.target.value)}
                placeholder="https://drive.agency.tibule/brand-deck.pdf"
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-text-primary focus:outline-hidden focus:border-[var(--color-brand)]"
              />
              <button
                type="button"
                onClick={handleAddRefLink}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold cursor-pointer text-text-primary hover:bg-surface-elevated"
              >
                Add Link
              </button>
            </div>
          </div>

          {/* What Happens Next Explainer */}
          <div className="p-3 rounded-xl border border-border bg-surface-elevated flex items-start gap-2.5 text-[11px] text-text-secondary">
            <Bell className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <strong className="text-text-primary">Next in Agency Workflow:</strong> Once you click{' '}
              <em>"Mark Ready &amp; Alert Traffic"</em>, Traffic Manager Kwame Mensah will receive an automated notification to convene the debrief meeting with the <strong>{brand.name} team</strong>, <strong>Client Service</strong>, and <strong>Creative Director Elena Rostova</strong>.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold cursor-pointer transition-colors text-text-secondary hover:text-text-primary"
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
              <Send className="w-3.5 h-3.5" />
              <span>Mark Debrief Ready &amp; Alert Traffic Manager</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

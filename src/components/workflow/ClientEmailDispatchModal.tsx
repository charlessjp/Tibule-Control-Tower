import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, ClientEmailDispatchInfo } from '../../types';
import { INITIAL_BRANDS } from '../../data/brands';
import {
  X,
  Mail,
  Send,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  Building,
  UserCheck,
  Copy,
  Check
} from 'lucide-react';

interface ClientEmailDispatchModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClientEmailDispatchModal: React.FC<ClientEmailDispatchModalProps> = ({
  job,
  isOpen,
  onClose
}) => {
  const { currentUser, clientServiceDispatchViaEmail } = useApp();

  const brand = (job && INITIAL_BRANDS.find((b) => b.id === job.brandId)) ||
    (job && INITIAL_BRANDS.find((b) => b.name === job.requestor)) ||
    INITIAL_BRANDS[0];

  const defaultRecipientEmail = brand?.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.marketing@clientbrand.com';
  const defaultSenderEmail = (currentUser?.email) || `${currentUser?.name.toLowerCase().replace(/\s+/g, '.')}@agency.com`;

  const [recipientEmail, setRecipientEmail] = useState(defaultRecipientEmail);
  const [recipientName, setRecipientName] = useState(job?.requestor || `${brand.name} Brand Lead`);
  const [subject, setSubject] = useState(
    `[Deliverable Delivery] ${job?.title || 'Creative Campaign Assets'} - Ready for Client Review`
  );
  const [materials, setMaterials] = useState<string[]>([
    'Final Approved High-Resolution Master Exports',
    'Campaign Multi-Format Aspect Ratio Pack',
    'Production Specs & Implementation Notes'
  ]);
  const [newMaterialInput, setNewMaterialInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState(
    `Dear ${job?.requestor || 'Client'},\n\nPlease find attached the approved creative assets for "${job?.title || 'your campaign'}". All requested deliverable specifications have passed our internal studio quality gates.\n\nLooking forward to your feedback or final broadcast approval.\n\nBest regards,\n${currentUser.name}\nClient Services`
  );

  if (!isOpen || !job) return null;

  const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    `${notes}\n\nIncluded Materials & Revert Attachments:\n${materials.map((m, i) => `${i + 1}. ${m}`).join('\n')}`
  )}`;

  const handleCopyPackage = () => {
    const fullDraft = `TO: ${recipientEmail}\nFROM: ${defaultSenderEmail}\nSUBJECT: ${subject}\n\nATTACHED MATERIALS:\n${materials.map((m, i) => `- ${m}`).join('\n')}\n\nBODY:\n${notes}`;
    navigator.clipboard.writeText(fullDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddMaterial = () => {
    if (newMaterialInput.trim()) {
      setMaterials([...materials, newMaterialInput.trim()]);
      setNewMaterialInput('');
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dispatchInfo: ClientEmailDispatchInfo = {
      senderEmail: defaultSenderEmail,
      senderName: currentUser.name,
      recipientEmail,
      recipientName,
      clientOrganization: brand.name,
      subject,
      dispatchedAt: new Date().toISOString(),
      dispatchedByUserId: currentUser.id,
      materialsIncluded: materials,
      dispatchNotes: notes
    };

    clientServiceDispatchViaEmail(job.id, dispatchInfo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="client-email-dispatch-modal"
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                Stage 8: Client Services Work Email Dispatch
              </span>
              <span className="text-xs font-mono font-bold text-text-tertiary">
                {job.id} • {brand.name}
              </span>
            </div>
            <h2 className="text-base font-bold mt-0.5 text-text-primary">
              Dispatch Deliverable to Client via Work Email
            </h2>
            <p className="text-xs mt-0.5 text-text-tertiary">
              Deliverables are sent to the client exclusively through official agency work email with approved creative assets attached.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Policy Banner */}
          <div className="p-3 rounded-xl bg-surface-elevated border border-border flex items-start gap-2.5 text-text-secondary">
            <Mail className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-text-primary font-semibold">Client Services Policy:</strong> Just as raw briefs are received through your work email, all final deliverables and revert packages must be dispatched to the client via work email. Log the dispatch details below to transition this job to formal Client Review.
            </div>
          </div>

          {/* Email Header Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-border bg-surface-elevated">
            <div>
              <label className="block font-bold text-text-secondary mb-1">
                Sender (Your Agency Work Email)
              </label>
              <input
                type="email"
                disabled
                value={defaultSenderEmail}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface/50 text-xs font-mono text-text-secondary cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-text-secondary mb-1">
                Recipient Client Email
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-mono text-text-primary focus:border-[var(--color-brand)]"
                placeholder="client.lead@brand.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-text-secondary mb-1">
                Email Subject Line
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-text-primary focus:border-[var(--color-brand)]"
              />
            </div>
          </div>

          {/* Attached Materials Checklist */}
          <div>
            <label className="block font-bold text-text-secondary mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Materials Attached to Work Email ({materials.length})</span>
              </span>
              <span className="text-[10px] text-text-tertiary">Verified deliverable package</span>
            </label>

            <div className="space-y-1.5 mb-2">
              {materials.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface-elevated border border-border text-xs"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-text-primary font-medium">{item}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(idx)}
                    className="text-text-tertiary hover:text-rose-500 cursor-pointer text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMaterialInput}
                onChange={(e) => setNewMaterialInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMaterial();
                  }
                }}
                placeholder="Add other deliverable files or revert notes attached..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary"
              />
              <button
                type="button"
                onClick={handleAddMaterial}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold cursor-pointer"
              >
                + Add Item
              </button>
            </div>
          </div>

          {/* Work Email Body Copy / Notes */}
          <div>
            <label className="block font-bold text-text-secondary mb-1">
              Email Dispatch Notes &amp; Client Communication Copy
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary font-mono focus:border-[var(--color-brand)]"
              placeholder="Record email copy sent to client..."
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopyPackage}
                className="px-3 py-2 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy full revert package & email draft to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Package & Draft'}</span>
              </button>

              <a
                href={mailtoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Launch default email client (Outlook, Gmail, Apple Mail)"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open Work Email App</span>
              </a>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-border bg-surface text-xs font-semibold cursor-pointer transition-colors text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Send className="w-4 h-4" />
                <span>Confirm Dispatched via Work Email</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

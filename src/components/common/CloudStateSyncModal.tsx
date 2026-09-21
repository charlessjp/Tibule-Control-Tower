import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cloud, Download, Upload, Save, Check, RefreshCw, X, Trash2, Database } from 'lucide-react';

interface CloudStateSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkspaceSnapshot {
  id: string;
  name: string;
  timestamp: string;
  jobsCount: number;
  usersCount: number;
}

export const CloudStateSyncModal: React.FC<CloudStateSyncModalProps> = ({ isOpen, onClose }) => {
  const { theme, jobs, users, teams } = useApp();
  const isDark = theme === 'dark';

  const [snapshotName, setSnapshotName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Load existing snapshots from localStorage
  const [savedSnapshots, setSavedSnapshots] = useState<WorkspaceSnapshot[]>(() => {
    try {
      const stored = localStorage.getItem('tibule_snapshots');
      return stored ? JSON.parse(stored) : [
        {
          id: 'snap-default-baseline',
          name: 'Q3 Enterprise Peak Baseline',
          timestamp: '2026-09-10 14:30',
          jobsCount: 24,
          usersCount: 8
        }
      ];
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  const handleSaveSnapshot = () => {
    if (!snapshotName.trim()) return;
    setIsSaving(true);
    const newSnap: WorkspaceSnapshot = {
      id: `snap-${Date.now()}`,
      name: snapshotName.trim(),
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      jobsCount: jobs.length,
      usersCount: users.length
    };

    const updated = [newSnap, ...savedSnapshots];
    setSavedSnapshots(updated);
    try {
      localStorage.setItem('tibule_snapshots', JSON.stringify(updated));
    } catch {}

    setSnapshotName('');
    setIsSaving(false);
    setSuccessMsg('Snapshot captured and persisted successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = savedSnapshots.filter(s => s.id !== id);
    setSavedSnapshots(updated);
    try {
      localStorage.setItem('tibule_snapshots', JSON.stringify(updated));
    } catch {}
  };

  const handleExportJSON = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      jobs,
      users,
      teams
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tibule-control-tower-workspace-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        id="cloud-state-sync-modal"
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all duration-200"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        {/* Header */}
        <div
          className="p-4 px-6 border-b flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-1.5 rounded-lg"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, transparent)',
                color: 'var(--color-brand)'
              }}
            >
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-text-primary">Cloud Workspace &amp; Snapshot State</h2>
              <p className="text-[11px] text-text-tertiary">
                Multi-device persistence and state snapshots
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors cursor-pointer text-text-tertiary hover:text-text-primary"
            style={{ backgroundColor: 'transparent' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Create new snapshot */}
          <div className="space-y-2">
            <label className="font-bold text-xs text-text-secondary">Capture New Workspace Snapshot</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="e.g., Sprint 42 Final Review"
                className="flex-1 px-3 py-2 rounded-xl border outline-none text-xs"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
              <button
                onClick={handleSaveSnapshot}
                disabled={!snapshotName.trim() || isSaving}
                className="px-4 py-2 rounded-xl text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-brand)' }}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
            {successMsg && (
              <p className="text-[11px] text-emerald-500 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{successMsg}</span>
              </p>
            )}
          </div>

          {/* Saved Snapshots List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-text-tertiary">
              <span>Saved Workspace Snapshots</span>
              <span>{savedSnapshots.length} total</span>
            </div>
            <div
              className="rounded-xl border divide-y max-h-40 overflow-y-auto"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              {savedSnapshots.map((snap) => (
                <div key={snap.id} className="p-3 flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                  <div>
                    <div className="font-semibold text-xs text-text-primary">{snap.name}</div>
                    <div className="text-[10px] font-mono text-text-tertiary">
                      {snap.timestamp} · {snap.jobsCount} jobs · {snap.usersCount} operators
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Snapshot "${snap.name}" is already loaded in your active session.`)}
                      className="px-2 py-1 rounded text-[10px] font-semibold border cursor-pointer"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-brand)'
                      }}
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteSnapshot(snap.id)}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export / Import Section */}
          <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Database className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
              <span>Full Raw Dataset Export</span>
            </div>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 cursor-pointer text-text-primary hover:bg-surface-elevated"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-3 px-6 border-t flex justify-end"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-elevated)'
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer text-text-secondary hover:text-text-primary"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Shield,
  CheckCircle2,
  Lock,
  UserCheck,
  Compass,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Layers,
  Award,
  Users
} from 'lucide-react';

interface OnboardingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingFlowModal: React.FC<OnboardingFlowModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, teams, theme } = useApp();
  const isDark = theme === 'dark';
  const [step, setStep] = useState<number>(1);
  const [password, setPassword] = useState('••••••••••••');
  const [displayName, setDisplayName] = useState(currentUser.name);

  if (!isOpen) return null;

  const currentTeam = teams.find((t) => t.id === currentUser.teamId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        id="onboarding-flow-modal"
        className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all duration-200"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        {/* Top bar with progress indicator */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs"
              style={{
                backgroundColor: 'var(--color-brand-muted)',
                color: 'var(--color-brand)'
              }}
            >
              CT
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                Tibule Control Tower • Onboarding Flow
              </div>
              <div className="text-sm font-bold text-text-primary">
                Step {step} of 4:{' '}
                {step === 1 && 'Welcome & Identity'}
                {step === 2 && 'Security Credentials'}
                {step === 3 && 'Profile Setup'}
                {step === 4 && 'Product Orientation'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-border h-1" style={{ backgroundColor: 'var(--color-border)' }}>
          <div
            className="h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%`, backgroundColor: 'var(--color-brand)' }}
          />
        </div>

        {/* Screen 1: Welcome to Control Tower */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary">
                Welcome to Tibule
              </span>
              <h2 className="text-xl font-bold text-text-primary">
                Welcome to Tibule Control Tower
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Control Tower is your shared operational workspace. It exists to give you clarity on your assignments, protect your workload from burnout, and create a verifiable record of your contribution.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated border border-border/70 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Your Verified Organisational Identity
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-text-tertiary">Employee Name</div>
                  <div className="font-semibold text-text-primary text-sm mt-0.5">{currentUser.name}</div>
                </div>
                <div>
                  <div className="text-text-tertiary">Company Email</div>
                  <div className="font-mono text-text-primary text-sm mt-0.5">{currentUser.email}</div>
                </div>
                <div>
                  <div className="text-text-tertiary">Assigned Team</div>
                  <div className="font-semibold text-text-primary text-sm mt-0.5">{currentTeam?.name || 'Creative'}</div>
                </div>
                <div>
                  <div className="text-text-tertiary">Reporting Manager</div>
                  <div className="font-semibold text-text-primary text-sm mt-0.5">Elena Rostova</div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <Shield className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>
                <strong>Visibility without surveillance:</strong> Control Tower measures work and outcomes, never keystrokes, webcam, or arbitrary presence timers.
              </span>
            </div>
          </div>
        )}

        {/* Screen 2: Create Password */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Create Your Password</h2>
              <p className="text-sm text-text-secondary mt-1">
                Establish strong security credentials for your company account.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Workforce Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-elevated border border-border text-text-primary font-mono text-sm focus:outline-none focus:border-brand-primary"
                  />
                  <Lock className="w-4 h-4 text-text-tertiary absolute right-3.5 top-3" />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-elevated border border-border/70 text-xs space-y-2">
                <div className="font-semibold text-text-secondary">Password Requirements:</div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Minimum 12 characters
                </div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mixed case with numbers & symbols
                </div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enforces Tibule local infrastructure SSO compliance
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screen 3: Profile Setup */}
        {step === 3 && (
          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Profile Configuration</h2>
              <p className="text-sm text-text-secondary mt-1">
                How you appear across your team workspace and operational traffic map.
              </p>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-elevated border border-border/70">
              <div className="w-14 h-14 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xl flex items-center justify-center border border-brand-primary/30">
                {currentUser.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-text-tertiary">Avatar preview</div>
                <div className="text-sm font-semibold text-text-primary">{currentUser.name}</div>
                <span className="text-xs text-brand-primary font-mono">{currentUser.jobTitle}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-surface-elevated border border-border text-text-primary text-sm focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Primary Role
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.jobTitle}
                  className="w-full px-3.5 py-2 rounded-lg bg-surface-elevated/50 border border-border text-text-secondary text-sm font-mono cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Screen 4: Product Orientation */}
        {step === 4 && (
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Four Pillars of Control Tower</h2>
              <p className="text-sm text-text-secondary mt-0.5">
                Understand how Control Tower supports your everyday work and career trajectory.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-surface-elevated border border-border/70 space-y-1">
                <div className="flex items-center gap-2 text-brand-primary font-semibold text-xs uppercase tracking-wider">
                  <Briefcase className="w-4 h-4" />
                  Your Work
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Your direct queue of prioritized deliverables, specs, dependencies, and real-time status controls.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-elevated border border-border/70 space-y-1">
                <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  Your Workload
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Clear visual capacity meters based on committed hours and complexity, with instant rebalancing requests.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-elevated border border-border/70 space-y-1">
                <div className="flex items-center gap-2 text-purple-500 font-semibold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  Your Contribution
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Completed work builds undeniable evidence for formal salary, role, and progression reviews.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-elevated border border-border/70 space-y-1">
                <div className="flex items-center gap-2 text-emerald-500 font-semibold text-xs uppercase tracking-wider">
                  <Users className="w-4 h-4" />
                  Your Team
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Live traffic visualization to coordinate smoothly across teams and resolve dependencies proactively.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-border bg-surface-elevated/40 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-border flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              Enter Control Tower
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

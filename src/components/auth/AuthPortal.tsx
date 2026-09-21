import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AgencyDepartment, SeniorityLevel, UserRole, User } from '../../types';
import {
  AGENCY_DEPARTMENT_CONFIG,
  registerNewUser,
  loginUser
} from '../../utils/authStorage';
import { formatReadable } from '../../utils/formatters';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  Users,
  Briefcase,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  Layers,
  Award,
  ChevronRight,
  Compass,
  ArrowLeft
} from 'lucide-react';

interface AuthPortalProps {
  onSuccess?: () => void;
  defaultMode?: 'login' | 'register';
  isModal?: boolean;
  onClose?: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  onSuccess,
  defaultMode = 'login',
  isModal = false,
  onClose
}) => {
  const { users, setUsers, setCurrentUser, setIsAuthenticated } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState<AgencyDepartment>('creative');
  const [regSeniority, setRegSeniority] = useState<SeniorityLevel>('mid');
  const [regCustomTitle, setRegCustomTitle] = useState('');
  const [regManagerId, setRegManagerId] = useState<string>('');
  const [regCapacity, setRegCapacity] = useState<number>(40);

  // Department roles definition
  const departmentRoles = useMemo(() => {
    return AGENCY_DEPARTMENT_CONFIG[regDepartment].roles;
  }, [regDepartment]);

  // Current selected role definition
  const selectedRoleDef = useMemo(() => {
    const found = departmentRoles.find((r) => r.seniority === regSeniority);
    return found || departmentRoles[0];
  }, [departmentRoles, regSeniority]);

  // Potential superiors based on hierarchy
  const eligibleSuperiors = useMemo(() => {
    const gm = users.find((u) => u.role === 'general_manager');
    const deptUsers = users.filter((u) => u.department === regDepartment);

    if (selectedRoleDef.role === 'director' || selectedRoleDef.role === 'manager') {
      return gm ? [gm] : [];
    }

    if (selectedRoleDef.role === 'team_lead') {
      const director = deptUsers.find((u) => u.role === 'director' || u.role === 'manager');
      return director ? [director, ...(gm ? [gm] : [])] : gm ? [gm] : [];
    }

    // Specialists, juniors, NSS: can report to team leads or director
    const leads = deptUsers.filter(
      (u) => u.role === 'team_lead' || u.role === 'director' || u.role === 'manager'
    );
    return leads.length > 0 ? leads : gm ? [gm] : [];
  }, [users, regDepartment, selectedRoleDef]);

  // Update default title and manager when department or seniority changes
  const handleDepartmentChange = (dept: AgencyDepartment) => {
    setRegDepartment(dept);
    const roles = AGENCY_DEPARTMENT_CONFIG[dept].roles;
    const defaultRole = roles.find((r) => r.seniority === 'mid') || roles[0];
    setRegSeniority(defaultRole.seniority);
    setRegCustomTitle(defaultRole.defaultTitle);
    setRegCapacity(defaultRole.defaultCapacity);
  };

  const handleSeniorityChange = (seniority: SeniorityLevel) => {
    setRegSeniority(seniority);
    const roleDef = departmentRoles.find((r) => r.seniority === seniority);
    if (roleDef) {
      setRegCustomTitle(roleDef.defaultTitle);
      setRegCapacity(roleDef.defaultCapacity);
    }
  };

  // Quick Persona Sign-in
  const handleDemoSignIn = (user: User) => {
    setErrorMessage(null);
    const res = loginUser(user.email, 'tibule2026', true);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } else {
      // Fallback direct set
      setCurrentUser(user);
      setIsAuthenticated(true);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    const res = loginUser(loginEmail, loginPassword, rememberMe);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } else {
      setErrorMessage(res.error || 'Authentication failed.');
    }
  };

  // Submit Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please provide your full official name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please provide a valid work email address.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    const titleToUse = regCustomTitle.trim() || selectedRoleDef.defaultTitle;
    const managerToUse =
      regManagerId || (eligibleSuperiors[0] ? eligibleSuperiors[0].id : undefined);

    const res = registerNewUser({
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      department: regDepartment,
      seniority: regSeniority,
      role: selectedRoleDef.role,
      jobTitle: titleToUse,
      managerId: managerToUse,
      capacityHoursPerWeek: regCapacity
    });

    if (res.success && res.user) {
      setSuccessMessage(`Account created successfully! Welcome to Tibule Studio, ${res.user.name}.`);
      setUsers([res.user, ...users]);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1000);
    } else {
      setErrorMessage(res.error || 'Registration failed.');
    }
  };

  return (
    <div
      id="tibule-auth-portal"
      className={`flex items-center justify-center ${
        isModal ? 'w-full' : 'min-h-screen w-full p-4 sm:p-6 md:p-10'
      }`}
    >
      <div
        className={`w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden transition-all text-text-primary ${
          isModal ? 'max-h-[90vh] flex flex-col' : ''
        }`}
      >
        {/* Portal Header */}
        <div className="relative p-6 sm:p-8 bg-surface-elevated border-b border-border">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md font-black text-lg"
                style={{
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-brand-contrast)'
                }}
              >
                T
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg text-text-primary tracking-tight">
                    Tibule Creative Agency OS
                  </h1>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Ghana Studio Auth
                  </span>
                </div>
                <p className="text-xs text-text-tertiary">
                  Operational Workspace • Deliverable Escalation • Studio Capacity Engine
                </p>
              </div>
            </div>

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg border border-border hover:bg-surface text-text-tertiary hover:text-text-primary transition-colors cursor-pointer text-xs"
              >
                Close
              </button>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 mt-6 rounded-xl bg-surface border border-border max-w-sm">
            <button
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-surface-elevated text-text-primary shadow-xs'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
                setSuccessMessage(null);
                if (!regCustomTitle) setRegCustomTitle(selectedRoleDef.defaultTitle);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-surface-elevated text-text-primary shadow-xs'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Join Agency Squad</span>
            </button>
          </div>
        </div>

        {/* Alerts / Feedback */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Body Form */}
        <div className={`p-6 sm:p-8 space-y-6 ${isModal ? 'overflow-y-auto' : ''}`}>
          {mode === 'login' ? (
            <div className="space-y-6">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Agency Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. kwame.mensah@tibule.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-elevated text-sm text-text-primary focus:outline-none focus:border-[var(--color-brand)] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Studio Passcode
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-text-tertiary hover:text-text-primary flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password (default demo: tibule2026)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-elevated text-sm text-text-primary focus:outline-none focus:border-[var(--color-brand)] transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-border text-[var(--color-brand)] focus:ring-0"
                    />
                    <span>Remember active session on this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-brand-contrast)'
                  }}
                >
                  <span>Authenticate &amp; Enter Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Persona Access Drawer */}
              <div className="pt-5 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Demo Persona Fast Switch
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    Instant role verification
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      user: users.find((u) => u.role === 'general_manager'),
                      deptTag: 'Executive',
                      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                    },
                    {
                      user: users.find((u) => u.role === 'traffic_manager'),
                      deptTag: 'Traffic',
                      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    },
                    {
                      user: users.find((u) => u.role === 'director'),
                      deptTag: 'Creative Director',
                      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    },
                    {
                      user: users.find((u) => u.role === 'manager'),
                      deptTag: 'Client Services Lead',
                      badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    },
                    {
                      user: users.find((u) => u.id === 'usr-sarah-jenkins'),
                      deptTag: 'Senior Creative Lead',
                      badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                    },
                    {
                      user: users.find((u) => u.id === 'usr-amara-okafor'),
                      deptTag: 'Motion Designer',
                      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    },
                    {
                      user: users.find((u) => u.id === 'usr-liam-oconnor'),
                      deptTag: 'Account Executive',
                      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                    },
                    {
                      user: users.find((u) => u.id === 'usr-kofi-boateng'),
                      deptTag: 'Creative NSS / Intern',
                      badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30'
                    }
                  ]
                    .filter((item) => item.user !== undefined)
                    .map(({ user, deptTag, badgeColor }) => (
                      <button
                        key={user!.id}
                        onClick={() => handleDemoSignIn(user!)}
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated hover:border-text-secondary transition-all text-left flex items-center justify-between group cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-xs text-text-primary group-hover:text-[var(--color-brand)] truncate">
                            {user!.name}
                          </div>
                          <div className="text-[11px] text-text-tertiary truncate">
                            {user!.jobTitle}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border shrink-0 ${badgeColor}`}>
                          {deptTag}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {/* Step 1: Credentials */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-border">
                  <UserIcon className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                  1. Official Identity &amp; Credentials
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-secondary">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Kwame Adjei"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface-elevated text-xs text-text-primary focus:outline-none focus:border-[var(--color-brand)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-secondary">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="kwame.adjei@agency.tibule"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface-elevated text-xs text-text-primary focus:outline-none focus:border-[var(--color-brand)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-secondary">
                      Password (min 6 chars) *
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface-elevated text-xs text-text-primary focus:outline-none focus:border-[var(--color-brand)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-secondary">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface-elevated text-xs text-text-primary focus:outline-none focus:border-[var(--color-brand)]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Department Selection */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-border">
                  <Building2 className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                  2. Department Assignment (Under General Manager)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['creative', 'traffic', 'client_services'] as AgencyDepartment[]).map((dept) => {
                    const cfg = AGENCY_DEPARTMENT_CONFIG[dept];
                    const isSelected = regDepartment === dept;
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => handleDepartmentChange(dept)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10 shadow-sm'
                            : 'border-border bg-surface hover:border-text-secondary'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-text-primary">
                            {cfg.name}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                          )}
                        </div>
                        <p className="text-[10px] text-text-secondary line-clamp-2 leading-tight">
                          {cfg.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Seniority Tier & Role */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center justify-between pb-1 border-b border-border">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                    3. Hierarchy &amp; Seniority Tier
                  </span>
                  <span className="text-[10px] text-text-tertiary lowercase">
                    {regDepartment === 'creative' ? 'director → senior lead → specialist → junior → nss' : 'department hierarchy ladder'}
                  </span>
                </div>

                <div className="space-y-2">
                  {departmentRoles.map((roleDef) => {
                    const isSelected = regSeniority === roleDef.seniority;
                    return (
                      <div
                        key={roleDef.seniority}
                        onClick={() => handleSeniorityChange(roleDef.seniority)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          isSelected
                            ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10 shadow-xs'
                            : 'border-border bg-surface hover:bg-surface-elevated'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-text-primary">
                              {roleDef.seniorityLabel}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-elevated border border-border text-text-tertiary">
                              {roleDef.defaultCapacity}h/wk
                            </span>
                          </div>
                          <p className="text-[11px] text-text-secondary">
                            {roleDef.description}
                          </p>
                        </div>

                        {isSelected && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[var(--color-brand)] flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Job Title Customization / Presets */}
                <div className="p-3 rounded-xl border border-border bg-surface-elevated space-y-2">
                  <label className="text-[11px] font-bold text-text-secondary block">
                    Assigned Job Title (Clean Professional Title)
                  </label>
                  <input
                    type="text"
                    value={regCustomTitle}
                    onChange={(e) => setRegCustomTitle(e.target.value)}
                    placeholder={selectedRoleDef.defaultTitle}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-text-primary focus:outline-none focus:border-[var(--color-brand)]"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-text-tertiary">Presets:</span>
                    {selectedRoleDef.titleOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setRegCustomTitle(opt)}
                        className={`px-2 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                          regCustomTitle === opt
                            ? 'bg-surface border-text-primary text-text-primary font-bold'
                            : 'border-border bg-surface-elevated text-text-tertiary hover:text-text-primary'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 4: Reporting Superior & Capacity */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-border">
                  <Compass className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                  4. Reporting Hierarchy &amp; Workload Capacity
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-secondary">
                      Reports to (Direct Superior / Reviewer)
                    </label>
                    <select
                      value={regManagerId}
                      onChange={(e) => setRegManagerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface-elevated text-xs text-text-primary focus:outline-none focus:border-[var(--color-brand)]"
                    >
                      {eligibleSuperiors.map((sup) => (
                        <option key={sup.id} value={sup.id}>
                          {sup.name} ({sup.jobTitle})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-text-tertiary">
                      Connects automatically to your debrief reviews and late deliverable escalation ladder.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-secondary">
                      Weekly Capacity Allocation
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={10}
                        max={60}
                        value={regCapacity}
                        onChange={(e) => setRegCapacity(Number(e.target.value))}
                        className="w-24 px-3 py-2 rounded-xl border border-border bg-surface-elevated text-xs text-text-primary font-mono"
                      />
                      <span className="text-xs text-text-secondary">Hours / Week</span>
                    </div>
                    <p className="text-[10px] text-text-tertiary">
                      Standard: 40h (specialists), 38h (leads), 35h (NSS &amp; interns).
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-brand-contrast)'
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register &amp; Deploy to Agency Squad</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EfficiencyLeaderboardEntry, EfficiencyReward } from '../../types';
import { generateExecutiveCitation } from '../../utils/narrativeEngine';
import {
  Award,
  Zap,
  Target,
  Flame,
  CheckCircle2,
  Gift,
  Sparkles,
  Users,
  Crown,
  ChevronRight,
  ShieldCheck,
  Plus,
  X,
  Layers,
  FileCheck2,
  HelpCircle
} from 'lucide-react';

interface RewardCatalogueItem {
  id: EfficiencyReward['category'];
  title: string;
  badgeLabel: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  prize: string;
  crossDepartmentCriteria: {
    creative: string;
    clientService: string;
    traffic: string;
  };
  systemFormula: {
    name: string;
    formula: string;
    benchmark: string;
  };
}

const CROSS_DEPARTMENT_CATALOGUE: RewardCatalogueItem[] = [
  {
    id: 'mvp_of_the_month',
    title: 'Studio MVP of the Month',
    badgeLabel: 'Premier Agency Honor',
    icon: Award,
    accentColor: '#f59e0b',
    prize: 'GH₵ 2,500 Direct Cash Bonus + Executive Lunch with General Manager',
    crossDepartmentCriteria: {
      creative: 'Leading high-profile sprint deliverables with standout aesthetic and typography craft.',
      clientService: 'Flawless account stewardship, protecting agency delivery margin, and securing 100% key account retention.',
      traffic: 'Master dispatch orchestration, zero SLA breach slippage, and agile cross-squad capacity balancing.'
    },
    systemFormula: {
      name: 'Aggregate Performance Index',
      formula: '(Completed Tasks × 50) + (On-Time % × 10) + (Zero-Revert % × 10) + Turnaround Velocity Bonus',
      benchmark: 'Rank #1 on agency leaderboard or ≥1,500 points with ≥95% on-time delivery rate.'
    }
  },
  {
    id: 'turnaround_titan',
    title: 'Turnaround Titan (Delivery Velocity)',
    badgeLabel: 'Turnaround Speed Honor',
    icon: Zap,
    accentColor: '#0ea5e9',
    prize: '1 Paid Agency Flex-Day + Studio Hamper',
    crossDepartmentCriteria: {
      creative: 'Delivering high-complexity design/motion assets ahead of estimated benchmark hours without quality compromise.',
      clientService: 'Rapid brief drafting, immediate client debrief synthesis, and fast variation quote clearance.',
      traffic: 'Fastest operational dispatch turnaround (average intake-to-assignment lag under 1.5 hours).'
    },
    systemFormula: {
      name: 'Turnaround Velocity Deviation',
      formula: 'Max(0, ((Scoped Benchmark Hours - Actual Logged Hours) / Scoped Hours) × 100)',
      benchmark: 'Velocity score ≥10% faster than benchmark with an active on-time delivery streak ≥6 tasks.'
    }
  },
  {
    id: 'sharp_shooter',
    title: 'Sharp Shooter (First-Pass Precision)',
    badgeLabel: 'Precision & Zero-Rework',
    icon: CheckCircle2,
    accentColor: '#10b981',
    prize: 'Full Masterclass Sponsorship + Learning Allowance',
    crossDepartmentCriteria: {
      creative: 'First-time client approval on Stage 10 sign-off with zero revert rounds or prepress dieline defects.',
      clientService: '100% brief completeness audit score with zero missing brand assets or unclarified scope items.',
      traffic: 'Zero client revert schedule collisions and zero unmitigated timeline arbitration disputes.'
    },
    systemFormula: {
      name: 'First-Pass Approval Ratio',
      formula: '(Zero-Revert Completed Tasks / Total Evaluated Tasks) × 100',
      benchmark: 'Revert-free rate ≥90% across at least 10 completed or reviewed assignments.'
    }
  },
  {
    id: 'team_rockstar',
    title: 'Studio Anchor (Cross-Team Collaboration)',
    badgeLabel: 'Operational Team Anchor',
    icon: Users,
    accentColor: '#8b5cf6',
    prize: 'GH₵ 2,000 Operational Excellence Bonus + Studio Commendation',
    crossDepartmentCriteria: {
      creative: 'Mentoring junior designers, assisting on emergency crunch deliverables, and building shared design tokens.',
      clientService: 'Proactive scope shielding, protecting creative team runway, and resolving client pushbacks diplomatically.',
      traffic: 'Proactive workload leveling, mediating inter-department friction, and maintaining healthy studio flow.'
    },
    systemFormula: {
      name: 'Verified Collaboration Index',
      formula: '(Verified Strategic Contributions × 50) + Leadership Endorsement Index',
      benchmark: 'Minimum 3 verified strategic contributions in the studio evidence vault.'
    }
  }
];

export const StudioChampionsView: React.FC = () => {
  const {
    currentUser,
    users,
    efficiencyLeaderboard,
    efficiencyRewards,
    awardReward
  } = useApp();

  const isManagement =
    currentUser.role === 'general_manager' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'manager' ||
    currentUser.role === 'director';

  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(
    efficiencyLeaderboard[0]?.employeeId || 'usr-amara-okafor'
  );
  const [selectedCategory, setSelectedCategory] = useState<EfficiencyReward['category']>('mvp_of_the_month');
  const [rewardTitle, setRewardTitle] = useState('Studio MVP of the Month');
  const [prize, setPrize] = useState('GH₵ 2,500 Direct Cash Bonus + Executive Lunch with General Manager');
  const [rewardDescription, setRewardDescription] = useState<string>('');
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  // Active info tab in the catalogue inspection section
  const [activeCatalogueCategory, setActiveCatalogueCategory] = useState<EfficiencyReward['category']>('mvp_of_the_month');

  // Candidate pool includes practitioners across all 3 departments: Creative, CS, and Traffic
  const eligibleCandidates = users.filter(
    (u) =>
      u.role === 'employee' ||
      u.role === 'team_lead' ||
      u.role === 'client_service' ||
      u.role === 'traffic_manager'
  );

  useEffect(() => {
    const staff = users.find((u) => u.id === selectedStaffId);
    const entry = efficiencyLeaderboard.find((e) => e.employeeId === selectedStaffId);
    if (staff) {
      setRewardDescription(generateExecutiveCitation(staff.name, entry, selectedCategory));
    }
  }, [selectedStaffId, selectedCategory, efficiencyLeaderboard, users]);

  const handleGrantReward = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = users.find((u) => u.id === selectedStaffId);
    if (!staff) return;

    let badgeIcon = 'award';
    if (selectedCategory === 'turnaround_titan') badgeIcon = 'zap';
    else if (selectedCategory === 'sharp_shooter') badgeIcon = 'check_circle';
    else if (selectedCategory === 'team_rockstar') badgeIcon = 'users';

    awardReward({
      employeeId: staff.id,
      employeeName: staff.name,
      employeeTitle: staff.jobTitle,
      rewardTitle,
      rewardDescription,
      prize,
      awardedBy: currentUser.id,
      awardedByName: `${currentUser.name} (${currentUser.jobTitle})`,
      awardedDate: new Date().toISOString(),
      badgeIcon,
      category: selectedCategory
    });

    setIsAwardModalOpen(false);
    setRewardToast(`Conferred ${rewardTitle} to ${staff.name}. Bonus and executive commendation logged.`);
    setTimeout(() => setRewardToast(null), 5000);
  };

  const selectedCatalogueItem = CROSS_DEPARTMENT_CATALOGUE.find(
    (item) => item.id === activeCatalogueCategory
  ) || CROSS_DEPARTMENT_CATALOGUE[0];

  return (
    <div id="studio-champions-view" className="space-y-6 pb-16">
      {/* Toast Notification */}
      {rewardToast && (
        <div className="p-4 rounded-xl bg-surface border border-emerald-500/40 text-emerald-500 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{rewardToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-mono font-bold uppercase tracking-wider"
              style={{ color: 'var(--color-brand)' }}
            >
              Efficiency &amp; Operational League
            </span>
            <span className="text-xs text-text-tertiary">
              • Cross-Departmental Performance Honors
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1 text-text-primary">
            Studio Champions &amp; Recognition
          </h1>
          <p className="text-xs mt-1 max-w-3xl leading-relaxed text-text-secondary">
            Cross-departmental performance system evaluating practitioners across Creative Studio, Client Service, and Studio Traffic based on delivery velocity, on-time consistency, and first-pass client precision.
          </p>
        </div>

        {isManagement && (
          <button
            onClick={() => setIsAwardModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:brightness-110 transition-all cursor-pointer shrink-0"
            style={{
              backgroundColor: 'var(--color-brand)',
              color: 'var(--color-brand-contrast)'
            }}
          >
            <Gift className="w-4 h-4" />
            <span>Award Management</span>
          </button>
        )}
      </div>

      {/* Podium Cards for Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {efficiencyLeaderboard.slice(0, 3).map((entry, idx) => {
          const isFirst = idx === 0;
          const isSecond = idx === 1;

          return (
            <div
              key={entry.employeeId}
              className={`p-5 rounded-2xl border relative overflow-hidden transition-all flex flex-col justify-between ${
                isFirst
                  ? 'border-amber-500/50 bg-amber-500/5 shadow-xs'
                  : 'bg-surface border-border'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                      isFirst
                        ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-400/20'
                        : isSecond
                        ? 'bg-slate-300 text-slate-900'
                        : 'bg-amber-700 text-amber-100'
                    }`}
                  >
                    {isFirst ? <Crown className="w-5 h-5" /> : isSecond ? '2' : '3'}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-text-tertiary">
                      {isFirst ? 'League Leader' : isSecond ? 'Silver Contender' : 'Bronze Contender'}
                    </div>
                    <div className="font-extrabold text-sm text-text-primary">
                      {entry.employeeName}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black font-mono text-amber-500">{entry.points} pts</div>
                  <div className="text-[10px] text-text-tertiary flex items-center gap-1 justify-end font-mono">
                    <Flame className="w-3 h-3 text-rose-500" />
                    <span>{entry.activeStreak} streak</span>
                  </div>
                </div>
              </div>

              {/* Title & Brands */}
              <div className="my-3 space-y-1">
                <div className="text-xs text-text-secondary font-medium">{entry.employeeTitle}</div>
                <div className="text-[11px] text-text-tertiary">
                  Accounts: {entry.brandNames.join(' · ')}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="p-3 rounded-xl border border-border bg-surface-elevated grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div>
                  <div className="text-text-tertiary">On-Time</div>
                  <div className="font-bold text-emerald-500 text-xs mt-0.5">{entry.onTimeRate}%</div>
                </div>
                <div>
                  <div className="text-text-tertiary">Velocity</div>
                  <div className="font-bold text-xs mt-0.5" style={{ color: 'var(--color-brand)' }}>+{entry.turnaroundScore}%</div>
                </div>
                <div>
                  <div className="text-text-tertiary">Zero-Revert</div>
                  <div className="font-bold text-purple-500 text-xs mt-0.5">{entry.revertFreeRate}%</div>
                </div>
              </div>

              {/* Reward Eligibility */}
              <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px]">
                <span className="text-text-tertiary">Eligible Reward:</span>
                <span className="font-bold text-amber-500">{entry.eligibleRewardTier?.split('•')[1] || 'Reward Ready'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-Departmental Management Rewards Catalogue Feature */}
      <section className="p-6 rounded-2xl border border-border bg-surface space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-brand" />
              Cross-Departmental Management Rewards Catalogue
            </div>
            <h2 className="text-lg font-bold text-text-primary mt-0.5">
              Universal Studio Honours &amp; Eligibility Formulas
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Awards recognize exceptional operational, commercial, and craft contributions across Creative Studio, Client Service, and Studio Traffic desks.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-surface-elevated border border-border text-xs">
            {CROSS_DEPARTMENT_CATALOGUE.map((item) => {
              const Icon = item.icon;
              const isActive = activeCatalogueCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveCatalogueCategory(item.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap text-xs ${
                    isActive
                      ? 'bg-surface text-text-primary shadow-xs border border-border'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: item.accentColor }} />
                  <span>{item.title.split('(')[0].trim()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Award Detail Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Scope Across Departments */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-border bg-surface-elevated"
                >
                  <selectedCatalogueItem.icon
                    className="w-5 h-5"
                    style={{ color: selectedCatalogueItem.accentColor }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">{selectedCatalogueItem.title}</h3>
                  <span className="text-[10px] font-mono uppercase text-text-tertiary">
                    {selectedCatalogueItem.badgeLabel}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg border border-border bg-surface-elevated text-text-secondary">
                Prize: {selectedCatalogueItem.prize.split('+')[0].trim()}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="text-[11px] font-mono uppercase font-bold text-text-tertiary">
                Scope Across Departments:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3.5 rounded-xl border border-border bg-surface-elevated space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                    Creative Studio
                  </span>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {selectedCatalogueItem.crossDepartmentCriteria.creative}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-surface-elevated space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
                    Client Service
                  </span>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {selectedCatalogueItem.crossDepartmentCriteria.clientService}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-surface-elevated space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    Studio Traffic
                  </span>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {selectedCatalogueItem.crossDepartmentCriteria.traffic}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Transparent System Calculation Formula */}
          <div className="lg:col-span-5 p-4 rounded-xl border border-border bg-surface-elevated space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-text-tertiary text-[10px] font-mono uppercase font-bold tracking-wider">
                <FileCheck2 className="w-3.5 h-3.5 text-brand" />
                System Calculation Formula
              </div>
              <h4 className="text-xs font-bold text-text-primary mt-1">
                {selectedCatalogueItem.systemFormula.name}
              </h4>

              <div className="mt-2.5 p-3 rounded-lg border border-border bg-surface font-mono text-[11px] text-text-primary leading-relaxed break-all">
                {selectedCatalogueItem.systemFormula.formula}
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-1 text-xs">
              <span className="text-[10px] font-mono uppercase text-text-tertiary font-bold">
                Automated Qualification Threshold:
              </span>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {selectedCatalogueItem.systemFormula.benchmark}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Full Leaderboard Table & Awarded History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaderboard Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-border bg-surface space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Agency Efficiency Rankings (Live Sprint)</span>
            </h3>
            <span className="text-xs text-text-tertiary font-mono">Live calculation from job logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-tertiary text-[10px] font-mono uppercase">
                  <th className="pb-2.5 font-bold">Rank</th>
                  <th className="pb-2.5 font-bold">Staff Member</th>
                  <th className="pb-2.5 font-bold text-center">On-Time</th>
                  <th className="pb-2.5 font-bold text-center">Turnaround Speed</th>
                  <th className="pb-2.5 font-bold text-center">1st-Pass Signoff</th>
                  <th className="pb-2.5 font-bold text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {efficiencyLeaderboard.map((entry) => (
                  <tr key={entry.employeeId} className="hover:bg-surface-elevated transition-colors">
                    <td className="py-3 font-mono font-bold text-text-secondary">
                      #{entry.rank}
                    </td>
                    <td className="py-3">
                      <div className="font-bold text-text-primary">{entry.employeeName}</div>
                      <div className="text-[10px] text-text-tertiary">{entry.employeeTitle}</div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="font-mono font-bold text-emerald-500 text-xs">
                        {entry.onTimeRate}%
                      </span>
                    </td>
                    <td className="py-3 text-center font-mono font-semibold" style={{ color: 'var(--color-brand)' }}>
                      +{entry.turnaroundScore}% faster
                    </td>
                    <td className="py-3 text-center font-mono font-semibold text-purple-400">
                      {entry.revertFreeRate}%
                    </td>
                    <td className="py-3 text-right font-black text-amber-500 font-mono">
                      {entry.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Recent Conferred Awards History */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-surface space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Conferred Studio Honours</span>
              </h3>
              <span className="text-[10px] font-mono text-text-tertiary">{efficiencyRewards.length} Awards</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {efficiencyRewards.map((rew) => (
                <div
                  key={rew.id}
                  className="p-3.5 rounded-xl border border-border bg-surface-elevated space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">{rew.employeeName}</span>
                    <span className="text-[10px] text-text-tertiary font-mono">
                      {new Date(rew.awardedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-amber-500 font-semibold text-[11px]">
                    {rew.rewardTitle}
                  </div>
                  <div className="text-[11px] text-text-secondary leading-relaxed">
                    {rew.rewardDescription}
                  </div>
                  <div className="text-[10px] text-text-tertiary font-mono pt-1 border-t border-border flex items-center justify-between">
                    <span>Conferred by {rew.awardedByName}</span>
                    <span className="text-text-primary font-semibold">{rew.prize.split('+')[0].trim()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Award Reward Modal (Cross-Department Candidate Pool) */}
      {isAwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all">
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated shrink-0">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                  Executive Management Recognition
                </span>
                <h2 className="text-base font-bold mt-0.5 text-text-primary">Confer Cross-Departmental Honour</h2>
              </div>
              <button
                onClick={() => setIsAwardModalOpen(false)}
                className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-tertiary hover:text-text-primary cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGrantReward} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Select Staff Candidate (Creative, Client Service, or Traffic):
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary outline-none"
                >
                  {eligibleCandidates.map((u) => {
                    const deptLabel =
                      u.department === 'creative'
                        ? 'Creative Studio'
                        : u.department === 'client_services'
                        ? 'Client Service'
                        : 'Studio Traffic';
                    return (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.jobTitle} ({deptLabel})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">Reward Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const cat = e.target.value as EfficiencyReward['category'];
                    setSelectedCategory(cat);
                    if (cat === 'mvp_of_the_month') {
                      setRewardTitle('Studio MVP of the Month');
                      setPrize('GH₵ 2,500 Direct Cash Bonus + Executive Lunch with General Manager');
                    } else if (cat === 'turnaround_titan') {
                      setRewardTitle('Turnaround Titan (Delivery Velocity)');
                      setPrize('1 Paid Agency Flex-Day + Studio Hamper');
                    } else if (cat === 'sharp_shooter') {
                      setRewardTitle('Sharp Shooter (First-Pass Precision)');
                      setPrize('Full Masterclass Sponsorship + Learning Allowance');
                    } else if (cat === 'team_rockstar') {
                      setRewardTitle('Studio Anchor (Cross-Team Collaboration)');
                      setPrize('GH₵ 2,000 Operational Excellence Bonus + Studio Commendation');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary outline-none"
                >
                  <option value="mvp_of_the_month">Studio MVP of the Month</option>
                  <option value="turnaround_titan">Turnaround Titan (Delivery Velocity)</option>
                  <option value="sharp_shooter">Sharp Shooter (First-Pass Precision)</option>
                  <option value="team_rockstar">Studio Anchor (Cross-Team Collaboration)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">Reward Title:</label>
                <input
                  type="text"
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">Prize / Incentive:</label>
                <input
                  type="text"
                  value={prize}
                  onChange={(e) => setPrize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">Management Commendation Citation:</label>
                <textarea
                  rows={2}
                  value={rewardDescription}
                  onChange={(e) => setRewardDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAwardModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold cursor-pointer text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  style={{ backgroundColor: 'var(--color-brand)', color: 'var(--color-brand-contrast)' }}
                >
                  Confirm &amp; Award Practitioner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

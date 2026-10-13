import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EfficiencyLeaderboardEntry, EfficiencyReward } from '../../types';
import {
  Trophy,
  Award,
  Zap,
  Target,
  Flame,
  Star,
  CheckCircle2,
  Gift,
  Sparkles,
  TrendingUp,
  UserCheck,
  Crown,
  ChevronRight,
  ShieldCheck,
  Plus,
  X
} from 'lucide-react';

export const StudioChampionsView: React.FC = () => {
  const {
    currentUser,
    users,
    efficiencyLeaderboard,
    efficiencyRewards,
    awardReward
  } = useApp();

  const isManagement = currentUser.role === 'general_manager' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'manager' ||
    currentUser.role === 'director';

  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(efficiencyLeaderboard[0]?.employeeId || 'usr-amara-okafor');
  const [selectedCategory, setSelectedCategory] = useState<EfficiencyReward['category']>('mvp_of_the_month');
  const [rewardTitle, setRewardTitle] = useState('Accra Creative MVP of the Month');
  const [prize, setPrize] = useState('GH₵ 2,500 Direct Cash Bonus + Studio Executive Lunch with GM');
  const [rewardDescription, setRewardDescription] = useState('Superb speed and zero-revert craft delivery across our top brand campaigns.');
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  const handleGrantReward = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = users.find((u) => u.id === selectedStaffId);
    if (!staff) return;

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
      badgeIcon: selectedCategory === 'mvp_of_the_month' ? 'trophy' : selectedCategory === 'turnaround_titan' ? 'zap' : 'target',
      category: selectedCategory
    });

    setIsAwardModalOpen(false);
    setRewardToast(`🎉 Successfully granted ${rewardTitle} to ${staff.name}! Bonus and commendation logged.`);
    setTimeout(() => setRewardToast(null), 5000);
  };

  return (
    <div id="studio-champions-view" className="space-y-6 pb-16">
      {/* Toast */}
      {rewardToast && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
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
              Efficiency &amp; Craft League
            </span>
            <span className="text-xs text-text-tertiary">
              • Ghanaian Agency Recognition &amp; Rewards
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1 text-text-primary">
            Studio Champions &amp; Recognition
          </h1>
          <p className="text-xs mt-1 max-w-3xl leading-relaxed text-text-tertiary">
            Agency leaderboard and recognition program celebrating turnaround speed, delivery accuracy, and client approvals with monthly awards and bonuses.
          </p>
        </div>

        {isManagement && (
          <button
            onClick={() => setIsAwardModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer shrink-0"
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
                  ? 'border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/5'
                  : 'bg-surface border-border'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                      isFirst
                        ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-400/20'
                        : isSecond
                        ? 'bg-slate-300 text-slate-900'
                        : 'bg-amber-700 text-amber-100'
                    }`}
                  >
                    {isFirst ? <Crown className="w-5 h-5" /> : isSecond ? '2' : '3'}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-text-tertiary">
                      {isFirst ? '🥇 Current League Leader' : isSecond ? '🥈 Silver Contender' : '🥉 Bronze Contender'}
                    </div>
                    <div className="font-extrabold text-sm text-text-primary">
                      {entry.employeeName}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-amber-400">{entry.points} pts</div>
                  <div className="text-[10px] text-text-tertiary flex items-center gap-1 justify-end">
                    <Flame className="w-3 h-3 text-rose-500" />
                    <span>{entry.activeStreak} streak</span>
                  </div>
                </div>
              </div>

              {/* Title & Brands */}
              <div className="my-3 space-y-1">
                <div className="text-xs text-text-secondary font-medium">{entry.employeeTitle}</div>
                <div className="text-[11px] text-text-tertiary">
                  Brands: {entry.brandNames.join(' • ')}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="p-3 rounded-xl border border-border bg-surface-elevated grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div>
                  <div className="text-text-tertiary">On-Time</div>
                  <div className="font-bold text-emerald-400 text-xs mt-0.5">{entry.onTimeRate}%</div>
                </div>
                <div>
                  <div className="text-text-tertiary">Velocity</div>
                  <div className="font-bold text-xs mt-0.5" style={{ color: 'var(--color-brand)' }}>+{entry.turnaroundScore}%</div>
                </div>
                <div>
                  <div className="text-text-tertiary">Zero-Revert</div>
                  <div className="font-bold text-purple-400 text-xs mt-0.5">{entry.revertFreeRate}%</div>
                </div>
              </div>

              {/* Reward Eligibility */}
              <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px]">
                <span className="text-text-tertiary">Eligible Reward:</span>
                <span className="font-bold text-amber-400">{entry.eligibleRewardTier?.split('•')[1] || 'Reward Ready'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table & Rewards Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaderboard Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-border bg-surface space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Agency Efficiency Rankings (Live Sprint)</span>
            </h3>
            <span className="text-xs text-text-tertiary">Updated automatically via delivery timestamps</span>
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
                      <span className="font-mono font-bold text-emerald-500 dark:text-emerald-400 text-xs">
                        {entry.onTimeRate}%
                      </span>
                    </td>
                    <td className="py-3 text-center font-mono font-semibold" style={{ color: 'var(--color-brand)' }}>
                      +{entry.turnaroundScore}% faster
                    </td>
                    <td className="py-3 text-center font-mono font-semibold text-purple-400">
                      {entry.revertFreeRate}%
                    </td>
                    <td className="py-3 text-right font-black text-amber-400 font-mono">
                      {entry.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Rewards Catalog & Awarded History */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-surface space-y-3">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
              <Gift className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
              <span>Management Rewards Catalog</span>
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Achieving high on-time consistency and fast turnarounds makes creators eligible for direct rewards:
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="p-3 rounded-xl border border-border bg-surface-elevated space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>🥇 Accra Creative MVP of the Month</span>
                </div>
                <div className="text-[11px] text-text-secondary">
                  GH₵ 2,500 Cash Bonus + Executive Lunch with GM Marcus Sterling at Skybar Accra.
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface-elevated space-y-1">
                <div className="font-bold flex items-center gap-1.5" style={{ color: 'var(--color-brand)' }}>
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Turnaround Titan</span>
                </div>
                <div className="text-[11px] text-text-secondary">
                  1 Paid Agency Flex-Day Off (Long weekend) + Creative Care Hamper.
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface-elevated space-y-1">
                <div className="font-bold text-purple-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>🎯 Zero-Revert Sharp Shooter</span>
                </div>
                <div className="text-[11px] text-text-secondary">
                  Full Agency Sponsorship for Design Masterclass + GH₵ 1,000 allowance.
                </div>
              </div>
            </div>
          </div>

          {/* Recent Award Winners */}
          <div className="p-5 rounded-2xl border border-border bg-surface space-y-3">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Recent Agency Honors</span>
            </h3>

            <div className="space-y-2 text-xs">
              {efficiencyRewards.map((rew) => (
                <div
                  key={rew.id}
                  className="p-3 rounded-xl border border-border bg-surface-elevated space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">{rew.employeeName}</span>
                    <span className="text-[10px] text-text-tertiary">
                      {new Date(rew.awardedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-amber-400 font-semibold text-[11px]">
                    {rew.rewardTitle}
                  </div>
                  <div className="text-[11px] text-text-secondary leading-relaxed">
                    {rew.rewardDescription}
                  </div>
                  <div className="text-[10px] text-text-tertiary font-mono pt-1 border-t border-border">
                    Conferred by {rew.awardedByName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Award Reward Modal */}
      {isAwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all">
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated shrink-0">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Executive Recognition
                </span>
                <h2 className="text-base font-bold mt-0.5 text-text-primary">Confer Efficiency Reward</h2>
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
                <label className="block font-bold text-text-secondary mb-1">Select Staff Champion:</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary outline-none"
                >
                  {users
                    .filter((u) => u.role === 'employee' || u.role === 'team_lead')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.jobTitle})
                      </option>
                    ))}
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
                      setRewardTitle('Accra Creative MVP of the Month');
                      setPrize('GH₵ 2,500 Direct Cash Bonus + Executive Lunch with GM Marcus Sterling');
                    } else if (cat === 'turnaround_titan') {
                      setRewardTitle('Turnaround Titan (Speed & Velocity)');
                      setPrize('1 Paid Agency Flex-Day Off + Studio Gift Hamper');
                    } else if (cat === 'sharp_shooter') {
                      setRewardTitle('Zero-Revert Sharp Shooter Award');
                      setPrize('Masterclass Sponsorship + GH₵ 1,000 Software Allowance');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary outline-none"
                >
                  <option value="mvp_of_the_month">🥇 Creative MVP of the Month</option>
                  <option value="turnaround_titan">⚡ Turnaround Titan (Speed &amp; Velocity)</option>
                  <option value="sharp_shooter">🎯 Zero-Revert Sharp Shooter</option>
                  <option value="team_rockstar">🤝 Team Player of the Sprint</option>
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
                <label className="block font-bold text-text-secondary mb-1">Management Commendation Note:</label>
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
                  className="px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  style={{ backgroundColor: 'var(--color-brand)', color: 'var(--color-brand-contrast)' }}
                >
                  Confirm &amp; Award Champion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

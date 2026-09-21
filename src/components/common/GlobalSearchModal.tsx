import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatStatus } from '../../utils/formatters';
import {
  Search,
  X,
  Briefcase,
  User as UserIcon,
  Users,
  FileText,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isCommandBarOpen,
    setIsCommandBarOpen,
    jobs,
    users,
    teams,
    cases,
    setSelectedJobId,
    setSelectedEmployeeId,
    setActiveView
  } = useApp();

  const [query, setQuery] = useState('');

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        quickCommands: [
          { label: '/ overloaded teams', desc: 'Jump to traffic map with capacity filters', action: () => { setActiveView('live_traffic'); setIsCommandBarOpen(false); } },
          { label: '/ work due tomorrow', desc: 'Filter high-urgency deliverables', action: () => { setActiveView('all_work'); setIsCommandBarOpen(false); } },
          { label: '/ blocked jobs', desc: 'Inspect jobs delayed by dependencies', action: () => { setActiveView('all_work'); setIsCommandBarOpen(false); } },
          { label: '/ progression reviews', desc: 'Review submitted role & salary cases', action: () => { setActiveView('cases'); setIsCommandBarOpen(false); } },
        ],
        jobs: jobs.slice(0, 3),
        users: users.slice(0, 3),
        teams: teams.slice(0, 2),
        cases: cases.slice(0, 2)
      };
    }

    let jobList = jobs;
    let userList = users;
    let teamList = teams;
    let caseList = cases;

    if (q.startsWith('job:')) {
      const sub = q.replace('job:', '').trim();
      jobList = jobs.filter((j) => j.id.toLowerCase().includes(sub) || j.title.toLowerCase().includes(sub));
      return { quickCommands: [], jobs: jobList, users: [], teams: [], cases: [] };
    }

    if (q.startsWith('employee:') || q.startsWith('user:')) {
      const sub = q.replace(/^(employee|user):/, '').trim();
      userList = users.filter((u) => u.name.toLowerCase().includes(sub) || u.email.toLowerCase().includes(sub));
      return { quickCommands: [], jobs: [], users: userList, teams: [], cases: [] };
    }

    if (q.startsWith('team:')) {
      const sub = q.replace('team:', '').trim();
      teamList = teams.filter((t) => t.name.toLowerCase().includes(sub));
      return { quickCommands: [], jobs: [], users: [], teams: teamList, cases: [] };
    }

    if (q.startsWith('case:')) {
      const sub = q.replace('case:', '').trim();
      caseList = cases.filter((c) => c.id.toLowerCase().includes(sub) || c.title.toLowerCase().includes(sub) || c.employeeName.toLowerCase().includes(sub));
      return { quickCommands: [], jobs: [], users: [], teams: [], cases: caseList };
    }

    // Generic search across all collections
    const matchedJobs = jobs.filter(
      (j) =>
        j.id.toLowerCase().includes(q) ||
        j.title.toLowerCase().includes(q) ||
        j.clientProject.toLowerCase().includes(q) ||
        j.category.toLowerCase().includes(q)
    );

    const matchedUsers = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.jobTitle.toLowerCase().includes(q)
    );

    const matchedTeams = teams.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );

    const matchedCases = cases.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.employeeName.toLowerCase().includes(q)
    );

    return {
      quickCommands: [
        { label: `/ filter "${query}" in jobs`, desc: `Search job titles and specifications`, action: () => { setActiveView('all_work'); setIsCommandBarOpen(false); } }
      ],
      jobs: matchedJobs.slice(0, 4),
      users: matchedUsers.slice(0, 4),
      teams: matchedTeams.slice(0, 3),
      cases: matchedCases.slice(0, 3)
    };
  }, [query, jobs, users, teams, cases, setActiveView, setIsCommandBarOpen]);

  if (!isCommandBarOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-xs">
      <div
        id="global-search-container"
        className="w-full max-w-2xl rounded-xl bg-surface border border-border shadow-2xl overflow-hidden text-text-primary animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Input bar */}
        <div className="p-3.5 border-b border-border flex items-center gap-3 bg-surface-elevated/40">
          <Search className="w-5 h-5 text-text-tertiary shrink-0 ml-1" />
          <input
            id="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs, employees, teams, cases, or type '/' for commands..."
            className="w-full bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none text-base"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-text-tertiary hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs px-2 py-1 rounded bg-surface border border-border text-text-tertiary font-mono shrink-0 hidden sm:inline-block">
            ESC to close
          </span>
        </div>

        {/* Filter helpers chips */}
        <div className="px-4 py-2 bg-surface-elevated/20 border-b border-border/50 flex flex-wrap gap-2 text-xs text-text-tertiary">
          <span>Prefixes:</span>
          <button
            onClick={() => setQuery('job:')}
            className="font-mono text-brand-primary hover:underline"
          >
            job:
          </button>
          <button
            onClick={() => setQuery('employee:')}
            className="font-mono text-brand-primary hover:underline"
          >
            employee:
          </button>
          <button
            onClick={() => setQuery('team:')}
            className="font-mono text-brand-primary hover:underline"
          >
            team:
          </button>
          <button
            onClick={() => setQuery('case:')}
            className="font-mono text-brand-primary hover:underline"
          >
            case:
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Quick Commands */}
          {filteredResults.quickCommands.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-2 mb-1.5 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-500" />
                Operational Commands
              </div>
              <div className="space-y-1">
                {filteredResults.quickCommands.map((cmd, i) => (
                  <button
                    key={i}
                    onClick={cmd.action}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-surface-elevated border border-transparent hover:border-border/70 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <span className="text-xs font-mono font-bold text-brand-primary group-hover:underline">
                        {cmd.label}
                      </span>
                      <p className="text-xs text-text-secondary mt-0.5">{cmd.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Jobs */}
          {filteredResults.jobs.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-2 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 text-brand-primary" />
                Work & Assignments ({filteredResults.jobs.length})
              </div>
              <div className="space-y-1">
                {filteredResults.jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setIsCommandBarOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-surface-elevated border border-transparent hover:border-border/70 flex items-center justify-between group transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-brand-primary">
                          {job.id}
                        </span>
                        <span className="text-sm font-medium text-text-primary truncate">
                          {job.title}
                        </span>
                      </div>
                      <div className="text-xs text-text-tertiary mt-0.5 flex items-center gap-2">
                        <span>{job.clientProject}</span>
                        <span>•</span>
                        <span>{formatStatus(job.status)}</span>
                        <span>•</span>
                        <span>{job.estimatedHours}h estimated</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-tertiary shrink-0">
                      Open
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {filteredResults.users.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-2 mb-1.5 flex items-center gap-1.5">
                <UserIcon className="w-3 h-3 text-emerald-500" />
                Employees & Leads ({filteredResults.users.length})
              </div>
              <div className="space-y-1">
                {filteredResults.users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedEmployeeId(user.id);
                      setIsCommandBarOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-surface-elevated border border-transparent hover:border-border/70 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{user.name}</div>
                        <div className="text-xs text-text-tertiary">
                          {user.jobTitle} • {user.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-tertiary shrink-0">
                      Profile
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cases */}
          {filteredResults.cases.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-2 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-purple-500" />
                Progression & Review Cases ({filteredResults.cases.length})
              </div>
              <div className="space-y-1">
                {filteredResults.cases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveView('cases');
                      setIsCommandBarOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-surface-elevated border border-transparent hover:border-border/70 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-purple-500">{c.id}</span>
                        <span className="text-sm font-medium text-text-primary">{c.title}</span>
                      </div>
                      <div className="text-xs text-text-tertiary mt-0.5">
                        {c.employeeName} • Status: {formatStatus(c.status)}
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-tertiary shrink-0">
                      View
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

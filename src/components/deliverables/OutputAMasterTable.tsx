import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightTaskRow } from '../common/SpotlightTaskRow';
import { SpotlightTaskCard } from '../common/SpotlightTaskCard';
import {
  Search,
  Download,
  List,
  LayoutGrid,
  FolderGit2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  Lock
} from 'lucide-react';
import { Job, Priority, JobStatus } from '../../types';

export const OutputAMasterTable: React.FC = () => {
  const { jobs, users, teams, currentUser, setSelectedJobId, selectedJobId, theme } = useApp();
  const isDark = theme === 'dark';
  const isGM = currentUser.role === 'general_manager' || currentUser.role === 'admin';
  const userTeam = teams.find((t) => t.id === currentUser.teamId);

  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Job>('dueDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Scoped jobs: Managers are strictly constrained to their team; GMs have full cross-team capacity
  const teamScopedJobs = useMemo(() => {
    if (isGM) {
      return selectedTeam === 'all' ? jobs : jobs.filter((j) => j.teamId === selectedTeam);
    }
    return jobs.filter((j) => j.teamId === (currentUser.teamId || 'team-creative'));
  }, [jobs, isGM, selectedTeam, currentUser.teamId]);

  // Available categories within scope
  const categories = useMemo(() => {
    const cats = Array.from(new Set(teamScopedJobs.map((j) => j.category)));
    return ['all', ...cats];
  }, [teamScopedJobs]);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    return teamScopedJobs
      .filter((job) => {
        const matchesSearch =
          job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.clientProject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCategory === 'all' || job.category === selectedCategory;
        const matchesPri = selectedPriority === 'all' || job.priority === selectedPriority;
        const matchesStat = selectedStatus === 'all' || job.status === selectedStatus;
        return matchesSearch && matchesCat && matchesPri && matchesStat;
      })
      .sort((a, b) => {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';
        if (aVal < bVal) return sortAsc ? -1 : 1;
        if (aVal > bVal) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [teamScopedJobs, searchQuery, selectedCategory, selectedPriority, selectedStatus, sortField, sortAsc]);

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Title',
      'Client/Project',
      'Category',
      'Priority',
      'Status',
      'Estimated Hours',
      'Actual Hours',
      'Due Date',
      'Assignee'
    ];
    const rows = filteredJobs.map((j) => {
      const assignee = users.find((u) => u.id === j.assigneeId)?.name || 'Unassigned';
      return [
        j.id,
        `"${j.title.replace(/"/g, '""')}"`,
        `"${j.clientProject}"`,
        j.category,
        j.priority,
        j.status,
        j.estimatedHours,
        j.actualHours,
        j.dueDate,
        `"${assignee}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tibule_deliverables_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Summary Metrics
  const activeCount = filteredJobs.filter((j) => j.status !== 'completed').length;
  const blockedCount = filteredJobs.filter((j) => j.status === 'blocked').length;
  const completedCount = filteredJobs.filter((j) => j.status === 'completed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {isGM ? 'All Deliverables & Tasks' : `${userTeam?.name || 'Team'} Deliverables & Tasks`}
          </h1>
          <p className="text-xs mt-1 text-text-secondary">
            {isGM
              ? 'Search, filter, and track all tasks and project deliverables across the agency.'
              : `Search, filter, and track deliverables strictly scoped to ${userTeam?.name || 'your assigned team'}.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div
            className="flex items-center p-1 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'shadow-xs text-text-primary'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: viewMode === 'list' ? 'var(--color-surface-elevated)' : 'transparent'
              }}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'shadow-xs text-text-primary'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: viewMode === 'cards' ? 'var(--color-surface-elevated)' : 'transparent'
              }}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer text-text-primary hover:bg-surface-elevated"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <Download className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className="p-3.5 rounded-xl border flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div>
            <div className="text-[11px] font-medium text-text-secondary">
              Total Tasks
            </div>
            <div className="text-xl font-bold mt-0.5 text-text-primary">
              {filteredJobs.length}
            </div>
          </div>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, transparent)',
              color: 'var(--color-brand)'
            }}
          >
            <FolderGit2 className="w-4 h-4" />
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl border flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div>
            <div className="text-[11px] font-medium text-text-secondary">
              Active Deliverables
            </div>
            <div className="text-xl font-bold mt-0.5" style={{ color: 'var(--color-brand)' }}>
              {activeCount}
            </div>
          </div>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, transparent)',
              color: 'var(--color-brand)'
            }}
          >
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl border flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div>
            <div className="text-[11px] font-medium text-text-secondary">
              Blocked / Waiting
            </div>
            <div className="text-xl font-bold text-purple-400 mt-0.5">
              {blockedCount}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl border flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div>
            <div className="text-[11px] font-medium text-text-secondary">
              Completed
            </div>
            <div className="text-xl font-bold text-emerald-500 mt-0.5">
              {completedCount}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, project, client, or ID..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border outline-none text-xs transition-colors"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Team Filter: General Manager can filter by any team; Managers are locked to their team */}
          {isGM ? (
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-3 py-1.5 rounded-xl border font-medium text-xs cursor-pointer"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="all">Team: All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  Team: {t.name}
                </option>
              ))}
            </select>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs select-none"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)'
              }}
              title="Your deliverables view is strictly locked to your assigned team. Cross-team filtering belongs strictly to the General Manager."
            >
              <Lock className="w-3.5 h-3.5 text-text-tertiary" />
              <span>Team: {userTeam?.name || 'Assigned Studio'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border text-text-tertiary bg-surface border-border font-normal">
                Locked
              </span>
            </div>
          )}

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border font-medium text-xs cursor-pointer"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            <option value="all">Status: All</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Waiting / Blocked</option>
            <option value="in_review">In Review</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 rounded-xl border font-medium text-xs cursor-pointer"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            <option value="all">Priority: All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border font-medium text-xs cursor-pointer"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat === 'all' ? 'All' : cat}
              </option>
            ))}
          </select>

          {(searchQuery || selectedPriority !== 'all' || selectedStatus !== 'all' || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPriority('all');
                setSelectedStatus('all');
                setSelectedCategory('all');
              }}
              className="text-xs hover:underline cursor-pointer px-1 font-semibold"
              style={{ color: 'var(--color-brand)' }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredJobs.length === 0 ? (
        <div
          className="p-12 text-center rounded-2xl border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, transparent)',
              color: 'var(--color-brand)'
            }}
          >
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">
            No deliverables found
          </h3>
          <p className="text-xs mt-1 text-text-secondary">
            Try adjusting your search keywords or filter options.
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-2.5">
          {filteredJobs.map((job) => (
            <SpotlightTaskRow
              key={job.id}
              job={job}
              isSelected={selectedJobId === job.id}
              onClick={() => setSelectedJobId(job.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <SpotlightTaskCard
              key={job.id}
              job={job}
              isSelected={selectedJobId === job.id}
              onClick={() => setSelectedJobId(job.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

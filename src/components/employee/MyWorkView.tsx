import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, JobStatus, Priority } from '../../types';
import { SpotlightTaskRow } from '../common/SpotlightTaskRow';
import { SpotlightTaskCard } from '../common/SpotlightTaskCard';
import { SpotlightCard } from '../common/SpotlightCard';
import {
  List,
  LayoutGrid,
  Kanban,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderGit2,
  X,
  Lock,
  AlertTriangle
} from 'lucide-react';

interface MyWorkViewProps {
  filterMode?: 'my_work' | 'all_work' | 'team_queue' | 'unassigned_queue';
}

export const MyWorkView: React.FC<MyWorkViewProps> = ({ filterMode = 'my_work' }) => {
  const {
    currentUser,
    jobs,
    teams,
    users,
    selectedJobId,
    setSelectedJobId,
    createJob,
    theme,
    openLogDeliveryImpactModal
  } = useApp();

  const isDark = theme === 'dark';
  const isGM = currentUser.role === 'general_manager' || currentUser.role === 'admin';
  const isTraffic = currentUser.role === 'traffic_manager';
  const canSeeAllStudioJobs = isGM || isTraffic;
  const userTeam = teams.find((t) => t.id === currentUser.teamId);

  const [viewMode, setViewMode] = useState<'list' | 'cards' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newCategory, setNewCategory] = useState('Creative');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newEffort, setNewEffort] = useState(8);
  const [newDueDate, setNewDueDate] = useState('2026-09-25');

  // Filter jobs based on filterMode and controls
  const scopedJobs = useMemo(() => {
    let list = jobs;
    if (filterMode === 'my_work') {
      list = jobs.filter((j) => j.assigneeId === currentUser.id);
    } else if (filterMode === 'team_queue') {
      list = jobs.filter((j) => j.teamId === currentUser.teamId);
    } else if (filterMode === 'unassigned_queue') {
      list = jobs.filter((j) => j.status === 'unassigned' || !j.assigneeId);
    } else if (filterMode === 'all_work') {
      // General Manager and Traffic Manager can see across all teams; Discipline Leads are strictly locked to their team
      if (!canSeeAllStudioJobs) {
        list = jobs.filter((j) => j.teamId === currentUser.teamId);
      } else if (selectedTeamFilter !== 'all') {
        list = jobs.filter((j) => j.teamId === selectedTeamFilter);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (j) =>
          j.id.toLowerCase().includes(q) ||
          j.title.toLowerCase().includes(q) ||
          j.clientProject.toLowerCase().includes(q) ||
          j.category.toLowerCase().includes(q)
      );
    }

    if (priorityFilter !== 'all') {
      list = list.filter((j) => j.priority === priorityFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter((j) => j.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      list = list.filter((j) => j.category === categoryFilter);
    }
    return list;
  }, [jobs, filterMode, currentUser, isGM, selectedTeamFilter, searchQuery, priorityFilter, statusFilter, categoryFilter]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(jobs.map((j) => j.category));
    return ['all', ...Array.from(set)];
  }, [jobs]);

  // Quick stats
  const inProgressCount = scopedJobs.filter((j) => j.status === 'in_progress').length;
  const blockedCount = scopedJobs.filter((j) => j.status === 'blocked').length;
  const completedCount = scopedJobs.filter((j) => j.status === 'completed').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createJob({
      title: newTitle.trim(),
      description: newDescription.trim() || 'No additional notes.',
      requestor: currentUser.name,
      clientProject: newClient.trim() || 'Internal Work',
      teamId: currentUser.teamId || teams[0]?.id || 'team-creative',
      assigneeId: filterMode === 'my_work' ? currentUser.id : undefined,
      managerId: currentUser.managerId || currentUser.id,
      priority: newPriority,
      category: newCategory,
      complexity: 'medium',
      estimatedHours: Number(newEffort) || 8,
      actualHours: 0,
      dueDate: `${newDueDate}T17:00:00Z`,
      status: filterMode === 'my_work' ? 'in_progress' : 'assigned'
    });
    setNewTitle('');
    setNewDescription('');
    setNewClient('');
    setShowCreateModal(false);
  };

  const statusBoardColumns: { id: JobStatus; label: string; color: string }[] = [
    { id: 'assigned', label: 'To Do', color: 'var(--color-text-tertiary)' },
    { id: 'in_progress', label: 'In Progress', color: 'var(--color-brand)' },
    { id: 'blocked', label: 'Waiting / Blocked', color: '#f59e0b' },
    { id: 'in_review', label: 'In Review', color: '#38bdf8' },
    { id: 'completed', label: 'Completed', color: '#10b981' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {filterMode === 'my_work'
              ? 'My Work'
              : filterMode === 'team_queue'
              ? 'Team Queue'
              : 'All Tasks & Deliverables'}
          </h1>
          <p className="text-xs mt-1 text-text-tertiary">
            {filterMode === 'my_work'
              ? 'Track your active tasks, progress status, and upcoming deadlines across assigned deliverables.'
              : filterMode === 'team_queue'
              ? 'Manage and coordinate active deliverables queued across your team.'
              : 'Search and inspect all project deliverables, deadlines, and assignees across the agency.'}
          </p>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div
            className="flex items-center p-1 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'shadow-xs font-bold'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
              style={
                viewMode === 'list'
                  ? {
                      backgroundColor: 'var(--color-brand-muted)',
                      color: 'var(--color-brand)'
                    }
                  : undefined
              }
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              title="Cards View"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'shadow-xs font-bold'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
              style={
                viewMode === 'cards'
                  ? {
                      backgroundColor: 'var(--color-brand-muted)',
                      color: 'var(--color-brand)'
                    }
                  : undefined
              }
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>

            <button
              onClick={() => setViewMode('board')}
              title="Board View"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'board'
                  ? 'shadow-xs font-bold'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
              style={
                viewMode === 'board'
                  ? {
                      backgroundColor: 'var(--color-brand-muted)',
                      color: 'var(--color-brand)'
                    }
                  : undefined
              }
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>

          <button
            onClick={() => openLogDeliveryImpactModal()}
            className="px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
            title="Log an impediment, risk, or blocker threatening delivery deadlines"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Log Impediment</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            style={{
              backgroundColor: 'var(--color-brand)',
              color: 'var(--color-brand-contrast)'
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SpotlightCard className="p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Total Tasks
            </div>
            <div className="text-xl font-bold mt-0.5 text-text-primary">
              {scopedJobs.length}
            </div>
          </div>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
          >
            <FolderGit2 className="w-4 h-4" />
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              In Progress
            </div>
            <div className="text-xl font-bold mt-0.5" style={{ color: 'var(--color-brand)' }}>
              {inProgressCount}
            </div>
          </div>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
          >
            <Clock className="w-4 h-4" />
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Waiting on Input
            </div>
            <div className="text-xl font-bold text-amber-500 mt-0.5">
              {blockedCount}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Completed
            </div>
            <div className="text-xl font-bold text-emerald-500 mt-0.5">
              {completedCount}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </SpotlightCard>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        {/* Search Input */}
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5" style={{ color: 'var(--color-text-tertiary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by task title, project, or ID..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border outline-none text-xs transition-colors"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Team Filter: GM & Traffic can filter by all/any team; Discipline leads are locked to their own team */}
          {filterMode === 'all_work' && (
            canSeeAllStudioJobs ? (
              <select
                value={selectedTeamFilter}
                onChange={(e) => setSelectedTeamFilter(e.target.value)}
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
                title="Your team view is strictly locked to your assigned team. Cross-team filtering belongs strictly to General Management and Studio Traffic."
              >
                <Lock className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Team: {userTeam?.name || 'Assigned Studio'}</span>
                <span className="text-[10px] text-text-tertiary font-mono font-normal">
                  · Locked
                </span>
              </div>
            )
          )}

          {filterMode === 'team_queue' && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs select-none"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)'
              }}
              title="Team Queue is strictly locked to your assigned team."
            >
              <Lock className="w-3.5 h-3.5 text-text-tertiary" />
              <span>Team: {userTeam?.name || 'Assigned Studio'}</span>
              <span className="text-[10px] text-text-tertiary font-mono font-normal">
                · Locked
              </span>
            </div>
          )}

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="assigned">To Do</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
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

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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

          {(searchQuery || priorityFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPriorityFilter('all');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="text-xs hover:underline cursor-pointer px-1"
              style={{ color: 'var(--color-brand)' }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area based on viewMode */}
      {scopedJobs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-border bg-surface">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
          >
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">
            No tasks found
          </h3>
          <p className="text-xs mt-1 text-text-tertiary">
            There are no deliverables matching your current filter.
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW: Each task is rendered with the spotlight cursor glow */
        <div className="space-y-2.5">
          {scopedJobs.map((job) => (
            <SpotlightTaskRow
              key={job.id}
              job={job}
              isSelected={selectedJobId === job.id}
              onClick={() => setSelectedJobId(job.id)}
            />
          ))}
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS VIEW: Each task is rendered as a spotlight card */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scopedJobs.map((job) => (
            <SpotlightTaskCard
              key={job.id}
              job={job}
              isSelected={selectedJobId === job.id}
              onClick={() => setSelectedJobId(job.id)}
            />
          ))}
        </div>
      ) : (
        /* BOARD VIEW: Clean, friendly Kanban columns */
        <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto pb-4 -mx-2 px-2 sm:mx-0 sm:px-0">
          {statusBoardColumns.map((col) => {
            const colJobs = scopedJobs.filter((j) => j.status === col.id);
            return (
              <div
                key={col.id}
                className="w-72 sm:w-80 lg:w-auto shrink-0 lg:shrink p-3.5 rounded-2xl border border-border bg-surface space-y-3 flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: col.color }}
                    />
                    <h3 className="text-xs font-bold text-text-primary">
                      {col.label}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-text-tertiary">
                    ({colJobs.length})
                  </span>
                </div>

                {/* Column Tasks */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-0.5">
                  {colJobs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-text-tertiary italic">
                      Empty
                    </div>
                  ) : (
                    colJobs.map((job) => (
                      <SpotlightTaskCard
                        key={job.id}
                        job={job}
                        isSelected={selectedJobId === job.id}
                        onClick={() => setSelectedJobId(job.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simple Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text-primary">
                  Create New Task
                </h2>
                <p className="text-xs text-text-tertiary">
                  Add a deliverable or task to your workspace.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-surface-elevated text-text-tertiary hover:text-text-primary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1 text-text-secondary">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Update Mobile Navigation Flow"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface-elevated text-text-primary text-xs outline-none focus:border-[var(--color-brand)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-secondary">
                    Project / Client
                  </label>
                  <input
                    type="text"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    placeholder="e.g. Zenith Global"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-elevated text-text-primary text-xs outline-none focus:border-[var(--color-brand)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-secondary">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Design, Operations"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-elevated text-text-primary text-xs outline-none focus:border-[var(--color-brand)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-secondary">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full px-2.5 py-2 rounded-xl border border-border bg-surface-elevated text-text-primary text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-secondary">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={newEffort}
                    onChange={(e) => setNewEffort(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-elevated text-text-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-secondary">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-elevated text-text-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-text-secondary">
                  Notes / Specification
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Details, requirements, or links..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface-elevated text-text-primary text-xs outline-none resize-none focus:border-[var(--color-brand)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-brand-contrast)'
                  }}
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

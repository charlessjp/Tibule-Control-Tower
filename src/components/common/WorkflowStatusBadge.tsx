import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  UserCheck,
  PlayCircle,
  Eye,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  Send,
  RotateCcw,
  Ban,
  CheckCheck,
  Calendar,
  FileCheck2,
  Layers,
  Clock
} from 'lucide-react';
import { WorkflowStage, JobStatus } from '../../types';
import { formatWorkflowStage } from '../../utils/formatters';

export interface WorkflowStatusBadgeProps {
  stage?: WorkflowStage | JobStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const WorkflowStatusBadge: React.FC<WorkflowStatusBadgeProps> = ({
  stage = 'new_brief',
  className = '',
  size = 'md'
}) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  // Normalize stage string
  const normalized = stage.toLowerCase().replace(/[\s-]/g, '_');

  let label = 'New Brief';
  let icon = <Sparkles className="w-3 h-3" />;
  let colorVar = 'var(--color-text-secondary)';
  let bgVar = 'var(--color-surface-elevated)';
  let borderVar = 'var(--color-border)';

  switch (normalized) {
    case 'new':
    case 'new_brief':
    case 'brief_intake':
    case 'intake':
      label = 'Brief Intake';
      icon = <Sparkles className="w-3 h-3" />;
      colorVar = 'var(--color-text-primary)';
      bgVar = 'var(--color-surface-elevated)';
      borderVar = 'var(--color-border-subtle)';
      break;

    case 'debrief_prep':
      label = 'Debrief Prep';
      icon = <Layers className="w-3 h-3" />;
      colorVar = 'var(--color-brand)';
      bgVar = 'color-mix(in srgb, var(--color-brand) 12%, transparent)';
      borderVar = 'color-mix(in srgb, var(--color-brand) 30%, transparent)';
      break;

    case 'debrief_ready':
    case 'traffic_routing':
      label = 'Debrief Pack Ready';
      icon = <FileCheck2 className="w-3 h-3" />;
      colorVar = 'var(--color-info)';
      bgVar = 'color-mix(in srgb, var(--color-info) 14%, transparent)';
      borderVar = 'color-mix(in srgb, var(--color-info) 35%, transparent)';
      break;

    case 'debrief_meeting':
      label = 'Team Debrief';
      icon = <Calendar className="w-3 h-3" />;
      colorVar = 'var(--color-warning)';
      bgVar = 'color-mix(in srgb, var(--color-warning) 14%, transparent)';
      borderVar = 'color-mix(in srgb, var(--color-warning) 35%, transparent)';
      break;

    case 'creative_brainstorm':
    case 'strategy_session':
      label = 'Strategy & Brainstorm';
      icon = <Sparkles className="w-3 h-3" />;
      colorVar = 'var(--color-brand)';
      bgVar = 'color-mix(in srgb, var(--color-brand) 15%, transparent)';
      borderVar = 'color-mix(in srgb, var(--color-brand) 38%, transparent)';
      break;

    case 'traffic_assignment':
      label = 'Traffic Assignment';
      icon = <UserCheck className="w-3 h-3" />;
      colorVar = 'var(--color-info)';
      bgVar = 'color-mix(in srgb, var(--color-info) 14%, transparent)';
      borderVar = 'color-mix(in srgb, var(--color-info) 35%, transparent)';
      break;

    case 'manager_assignment':
    case 'assigned':
    case 'routed_to_manager':
    case 'ready_for_assignment':
      label = 'Lead Assignment';
      icon = <UserCheck className="w-3 h-3" />;
      colorVar = 'var(--color-info)';
      bgVar = 'color-mix(in srgb, var(--color-info) 14%, transparent)';
      borderVar = 'color-mix(in srgb, var(--color-info) 35%, transparent)';
      break;

    case 'in_progress':
    case 'in_production':
    case 'active':
      label = 'In Production';
      icon = <PlayCircle className="w-3 h-3" />;
      colorVar = 'var(--color-brand)';
      bgVar = 'color-mix(in srgb, var(--color-brand) 15%, transparent)';
      borderVar = 'color-mix(in srgb, var(--color-brand) 38%, transparent)';
      break;

    case 'internal_review':
    case 'review':
    case 'submitted_for_review':
    case 'pending_review':
    case 'in_review':
      label = 'Manager Review';
      icon = <Eye className="w-3 h-3" />;
      colorVar = 'var(--color-strategic)';
      bgVar = 'color-mix(in srgb, var(--color-strategic) 15%, transparent)';
      borderVar = 'color-mix(in srgb, var(--color-strategic) 35%, transparent)';
      break;

    case 'client_service_handoff':
      label = 'Client Service Handoff';
      icon = <Send className="w-3 h-3" />;
      colorVar = 'var(--color-info)';
      bgVar = 'color-mix(in srgb, var(--color-info) 14%, transparent)';
      borderVar = 'color-mix(in srgb, var(--color-info) 35%, transparent)';
      break;

    case 'client_review':
    case 'sent':
    case 'sent_to_client':
      label = 'Client Review';
      icon = <Send className="w-3 h-3" />;
      colorVar = 'var(--color-info)';
      bgVar = 'color-mix(in srgb, var(--color-info) 14%, transparent)';
      borderVar = 'color-mix(in srgb, var(--color-info) 35%, transparent)';
      break;

    case 'client_revert':
    case 'revert':
      label = 'Client Reverts';
      icon = <RotateCcw className="w-3 h-3" />;
      colorVar = 'var(--color-critical)';
      bgVar = 'color-mix(in srgb, var(--color-critical) 15%, transparent)';
      borderVar = 'var(--color-critical)';
      break;

    case 'feedback':
    case 'feedback_required':
      label = 'Feedback Required';
      icon = <MessageSquare className="w-3 h-3" />;
      colorVar = 'var(--color-warning)';
      bgVar = 'color-mix(in srgb, var(--color-warning) 14%, transparent)';
      borderVar = 'color-mix(in srgb, var(--color-warning) 35%, transparent)';
      break;

    case 'rework':
    case 'revision_requested':
      label = 'Rework Requested';
      icon = <RefreshCw className="w-3 h-3 animate-spin-slow" />;
      colorVar = 'var(--color-warning)';
      bgVar = 'color-mix(in srgb, var(--color-critical) 14%, transparent)';
      borderVar = 'var(--color-critical)';
      break;

    case 'approved':
    case 'internal_approved':
    case 'client_approved':
      label = 'Approved';
      icon = <CheckCircle2 className="w-3 h-3" />;
      colorVar = 'var(--color-success)';
      bgVar = 'color-mix(in srgb, var(--color-success) 14%, transparent)';
      borderVar = 'color-mix(in srgb, var(--color-success) 35%, transparent)';
      break;

    case 'awaiting_input':
      label = 'Awaiting Input';
      icon = <Clock className="w-3 h-3" />;
      colorVar = 'var(--color-warning)';
      bgVar = 'color-mix(in srgb, var(--color-warning) 14%, transparent)';
      borderVar = 'color-mix(in srgb, var(--color-warning) 35%, transparent)';
      break;

    case 'blocked':
      label = 'Blocked';
      icon = <Ban className="w-3 h-3" />;
      colorVar = 'var(--color-critical)';
      bgVar = 'color-mix(in srgb, var(--color-critical) 18%, transparent)';
      borderVar = 'var(--color-critical)';
      break;

    case 'completed':
      label = 'Completed';
      icon = <CheckCheck className="w-3 h-3" />;
      colorVar = 'var(--color-success)';
      bgVar = 'color-mix(in srgb, var(--color-success) 14%, transparent)';
      borderVar = 'color-mix(in srgb, var(--color-success) 35%, transparent)';
      break;

    default:
      label = formatWorkflowStage(stage);
      icon = <Sparkles className="w-3 h-3" />;
      colorVar = 'var(--color-text-secondary)';
      bgVar = 'var(--color-surface-elevated)';
      borderVar = 'var(--color-border)';
  }

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold tracking-tight select-none ${
        isSmall ? 'text-[11px]' : 'text-xs'
      } ${className}`}
      style={{
        color: colorVar
      }}
    >
      <span className="shrink-0">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
};

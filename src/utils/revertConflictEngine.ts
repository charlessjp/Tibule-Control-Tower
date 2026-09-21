import { Job, Priority, ClientRevertInfo } from '../types';

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingJob?: Job;
  message?: string;
  assigneeName?: string;
}

/**
 * Checks if the assigned staff member is actively busy on another job
 * when a client revert cycles back.
 */
export function checkAssigneeWorkloadConflict(
  jobs: Job[],
  revertingJobId: string,
  assigneeId?: string
): ConflictCheckResult {
  if (!assigneeId) {
    return { hasConflict: false };
  }

  // Find other jobs assigned to this user that are currently in progress or active
  const activeOtherJob = jobs.find(
    (j) =>
      j.id !== revertingJobId &&
      j.assigneeId === assigneeId &&
      (j.status === 'in_progress' || j.status === 'assigned' || j.workflowStage === 'in_production')
  );

  if (activeOtherJob) {
    return {
      hasConflict: true,
      conflictingJob: activeOtherJob,
      message: `Assignee is currently active on [${activeOtherJob.id}] "${activeOtherJob.title}" (Due ${new Date(
        activeOtherJob.dueDate
      ).toLocaleDateString()}). Incoming revert will cause workload thrashing.`
    };
  }

  return { hasConflict: false };
}

/**
 * Generates a structured ClientRevertInfo object with automated conflict detection.
 */
export function buildClientRevertRecord(
  job: Job,
  allJobs: Job[],
  feedbackNotes: string,
  requestedChanges: string[],
  additionalHours: number = 4,
  urgency: Priority = 'high'
): ClientRevertInfo {
  const assigneeId = job.assigneeId || '';
  const conflict = checkAssigneeWorkloadConflict(allJobs, job.id, assigneeId);

  const previousRevertCount = job.clientRevertInfo?.revertCount || 0;

  return {
    revertCount: previousRevertCount + 1,
    feedbackNotes,
    requestedChanges,
    dateReceived: new Date().toISOString(),
    urgency,
    additionalHours,
    originalAssigneeId: assigneeId,
    conflictDetected: conflict.hasConflict,
    conflictingJobId: conflict.conflictingJob?.id,
    conflictJobTitle: conflict.conflictingJob?.title,
    conflictResolution: conflict.hasConflict ? undefined : 'queued'
  };
}

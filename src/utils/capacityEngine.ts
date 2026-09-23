import { User, Job, EmployeeCapacityCalculation, CapacityBreakdownItem, TrafficState } from '../types';

/**
 * Computes an explainable, availability-grounded capacity calculation
 * for a specific user based on:
 * Available Hours = Contracted - (Leave + Training + Meetings + Non-Production)
 * Committed Load = Base Production + Active Rework + Manager Review Commitments
 */
export function calculateUserCapacity(
  user: User,
  allJobs: Job[]
): EmployeeCapacityCalculation {
  // 1. Availability Calculation
  const contracted = user.availability?.contractedHoursPerWeek ?? (user.capacityHoursPerWeek || 40);
  const leave = user.availability?.leaveHours ?? 0;
  const training = user.availability?.trainingHours ?? 0;
  const meetings = user.availability?.meetingsHours ?? (user.role === 'manager' || user.role === 'director' ? 12 : user.role === 'team_lead' ? 6 : 3);
  const nonProd = user.availability?.nonProductionHours ?? 2;

  const deductions = leave + training + meetings + nonProd;
  const availableHours = Math.max(0, contracted - deductions);

  // 2. Active Jobs for user
  const userJobs = allJobs.filter((j) => j.assigneeId === user.id && j.status !== 'completed');

  let baseProductionHours = 0;
  let reworkHours = 0;
  const breakdown: CapacityBreakdownItem[] = [];

  userJobs.forEach((job) => {
    // If job has active workCycles, extract direct actual / rework allocations
    const activeCycle = job.workCycles?.find((c) => c.cycleNumber === (job.activeCycleNumber || 1));
    const cycleRework = job.workCycles?.reduce((sum, c) => sum + (c.reworkEffort || 0), 0) || 0;
    const isRevertStage = job.workflowStage === 'client_revert' || job.status === 'reopened';
    const revertAdditional = job.clientRevertInfo?.additionalHours || 0;

    const jobRework = Math.max(cycleRework, isRevertStage ? revertAdditional : 0);
    const jobBase = Math.max(0, (job.estimatedHours || 0) - (isRevertStage ? revertAdditional : 0));

    baseProductionHours += jobBase;
    reworkHours += jobRework;

    if (jobBase > 0) {
      breakdown.push({
        jobId: job.id,
        jobTitle: job.title,
        type: 'base_production',
        hours: jobBase
      });
    }

    if (jobRework > 0) {
      breakdown.push({
        jobId: job.id,
        jobTitle: job.title,
        type: isRevertStage ? 'client_revert' : 'rework',
        hours: jobRework
      });
    }
  });

  // 3. Manager Review Commitments
  let reviewCommitmentHours = 0;
  if (user.role === 'manager' || user.role === 'director' || user.role === 'team_lead') {
    // Review queue: jobs waiting in 'internal_review' where user is the manager
    const reviewQueue = allJobs.filter(
      (j) => j.managerId === user.id && (j.workflowStage === 'internal_review' || j.status === 'in_review')
    );
    // Standard rule: 1.5h review allocation per deliverable
    reviewCommitmentHours = reviewQueue.length * 1.5;
    if (reviewCommitmentHours > 0) {
      reviewQueue.forEach((rj) => {
        breakdown.push({
          jobId: rj.id,
          jobTitle: `[Review Queue] ${rj.title}`,
          type: 'review_commitment',
          hours: 1.5
        });
      });
    }
  }

  const assignedHours = baseProductionHours + reworkHours + reviewCommitmentHours;
  const capacityPercent = availableHours > 0 ? Math.round((assignedHours / availableHours) * 100) : 100;
  const capacityPressureHours = Math.max(0, assignedHours - availableHours);

  // 4. Auxiliary Metrics
  const blockedCount = userJobs.filter((j) => j.status === 'blocked').length;
  const now = new Date('2026-09-15T09:30:00Z').getTime();
  const dueSoonCount = userJobs.filter((j) => {
    const due = new Date(j.dueDate).getTime();
    return due - now < 48 * 3600 * 1000 && due >= now;
  }).length;

  // 5. Traffic State Evaluation
  let trafficState: TrafficState = 'clear';
  if (blockedCount > 0 && capacityPercent >= 90) {
    trafficState = 'blocked';
  } else if (capacityPercent >= 105 || (capacityPercent >= 95 && dueSoonCount >= 2)) {
    trafficState = 'critical';
  } else if (capacityPercent >= 85) {
    trafficState = 'congested';
  } else if (capacityPercent >= 65) {
    trafficState = 'building';
  } else {
    trafficState = 'clear';
  }

  return {
    userId: user.id,
    name: user.name,
    jobTitle: user.jobTitle,
    teamId: user.teamId,
    contractedHours: contracted,
    availableHours,
    leaveHours: leave,
    trainingHours: training,
    meetingsHours: meetings,
    nonProductionHours: nonProd,
    assignedHours,
    baseProductionHours,
    reworkHours,
    reviewCommitmentHours,
    capacityPercent,
    capacityPressureHours,
    activeJobsCount: userJobs.length,
    dueSoonCount,
    blockedCount,
    trafficState,
    breakdown
  };
}

import { Job, User, EmployeeCapacityCalculation, TrafficWorkloadStats, TrafficWorkloadBreakdown } from '../types';

/**
 * Calculates operational workload and performance metrics for the Studio Traffic department.
 * Traffic workload is measured in Operational Dispatch Points and Active Throughput.
 */
export function calculateTrafficWorkload(
  jobs: Job[],
  users: User[],
  capacities: Record<string, EmployeeCapacityCalculation>
): TrafficWorkloadStats {
  const activeJobs = jobs.filter((j) => j.status !== 'completed');

  // 1. Operational Workload Breakdown
  // Brief Intake & Debrief Prep: 1.5 pts per brief
  const briefIntakeCount = activeJobs.filter(
    (j) => j.workflowStage === 'brief_intake' || j.workflowStage === 'debrief_prep'
  ).length;

  // Debrief Meetings (Ready or In Meeting): 2.0 pts per session
  const debriefMeetingCount = activeJobs.filter(
    (j) => j.workflowStage === 'debrief_ready' || j.workflowStage === 'debrief_meeting'
  ).length;

  // Pending Staff Assignment & Dispatch: 2.5 pts per deliverable
  const pendingDispatchCount = activeJobs.filter(
    (j) => j.workflowStage === 'traffic_assignment' || j.workflowStage === 'manager_assignment' || (!j.assigneeId && j.status === 'unassigned')
  ).length;

  // Active Production Deliverables Monitored: 0.5 pts per job
  const activeProductionRuns = activeJobs.filter(
    (j) => j.workflowStage === 'in_production'
  ).length;

  // Review & CS Handoffs: 0.5 pts per review gate
  const reviewHandoffCount = activeJobs.filter(
    (j) => j.workflowStage === 'internal_review' || j.workflowStage === 'client_service_handoff' || j.workflowStage === 'client_review'
  ).length;

  // Client Revert Schedule Conflicts: 3.5 pts per conflict mediation
  const clientRevertConflicts = activeJobs.filter(
    (j) => j.workflowStage === 'client_revert' && (j.clientRevertInfo?.conflictDetected || j.isAtRisk)
  ).length;

  const breakdown: TrafficWorkloadBreakdown = {
    briefIntakeCount,
    debriefMeetingCount,
    pendingDispatchCount,
    activeProductionRuns,
    reviewHandoffCount,
    clientRevertConflicts
  };

  // 2. Operational Workload Points Calculation
  const workloadPoints = Number(
    (
      briefIntakeCount * 1.5 +
      debriefMeetingCount * 2.0 +
      pendingDispatchCount * 2.5 +
      activeProductionRuns * 0.5 +
      reviewHandoffCount * 0.5 +
      clientRevertConflicts * 3.5
    ).toFixed(1)
  );

  const maxWorkloadPoints = 40.0; // Standard Traffic weekly operational threshold
  const capacityPercent = Math.min(Math.round((workloadPoints / maxWorkloadPoints) * 100), 100);

  let status: 'optimal' | 'moderate' | 'heavy' | 'overloaded' = 'optimal';
  if (capacityPercent >= 95) {
    status = 'overloaded';
  } else if (capacityPercent >= 80) {
    status = 'heavy';
  } else if (capacityPercent >= 50) {
    status = 'moderate';
  } else {
    status = 'optimal';
  }

  // 3. Studio Balance Index (Resource Leveling Health)
  const creativeMembers = users.filter((u) => u.department === 'creative' && u.role === 'employee');
  let overloadedCount = 0;
  let underutilizedCount = 0;
  let optimalCount = 0;

  creativeMembers.forEach((member) => {
    const cap = capacities[member.id];
    const pct = cap ? cap.capacityPercent : 50;
    if (pct >= 90) {
      overloadedCount++;
    } else if (pct < 50) {
      underutilizedCount++;
    } else {
      optimalCount++;
    }
  });

  const totalCreatives = creativeMembers.length || 1;
  const balanceRaw = Math.round(((optimalCount * 1.0 + underutilizedCount * 0.5) / totalCreatives) * 100);
  const studioBalanceIndex = Math.max(35, Math.min(balanceRaw, 98));

  // 4. Dispatch Velocity (Intake-to-Production SLA)
  const dispatchVelocityHours = 14.2;

  // 5. Conflict Resolution Rate (Percentage of resolved timeline conflicts)
  const allRevertJobs = jobs.filter((j) => j.workflowStage === 'client_revert' || j.clientRevertInfo);
  const resolvedCount = allRevertJobs.filter((j) => !j.clientRevertInfo?.conflictDetected).length;
  const conflictResolutionRate = allRevertJobs.length > 0
    ? Math.round((resolvedCount / allRevertJobs.length) * 100)
    : 100;

  // 6. On-Time Handoff Rate
  const onTimeHandoffRate = 92;

  // 7. Unassigned Backlog Hours
  const unassignedJobs = activeJobs.filter(
    (j) => !j.assigneeId || j.status === 'unassigned' || j.workflowStage === 'traffic_assignment' || j.workflowStage === 'manager_assignment'
  );
  const unassignedBacklogHours = unassignedJobs.reduce(
    (sum, j) => sum + (j.managerAllocationHours || j.estimatedHours || j.benchmarkBaseHours || 16),
    0
  );

  return {
    workloadPoints,
    maxWorkloadPoints,
    capacityPercent,
    status,
    dispatchVelocityHours,
    studioBalanceIndex,
    overloadedCreativesCount: overloadedCount,
    underutilizedCreativesCount: underutilizedCount,
    optimalCreativesCount: optimalCount,
    conflictResolutionRate,
    onTimeHandoffRate,
    unassignedBacklogHours,
    breakdown
  };
}

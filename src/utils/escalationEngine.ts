import { Job, User, DeliverableEscalationStage, EmailAlertType, WebNotificationItem, EmailAlertItem } from '../types';

export interface EscalationInfo {
  job: Job;
  overdueHours: number;
  stage: DeliverableEscalationStage;
  stageLabel: string;
  stageShortLabel: string;
  severity: 'info' | 'warning' | 'critical' | 'executive';
  isCompleted: boolean;
  assignee?: User;
  trafficManager?: User;
  directSuperior?: User;
  director?: User;
  generalManager?: User;
  targetRecipients: User[];
  webNotificationPayloads: {
    recipientId: string;
    recipientRole?: string;
    title: string;
    message: string;
    actionLabel?: string;
    actionType?: 'push_to_review' | 'prompt_assignee' | 'open_job';
    severity: 'info' | 'warning' | 'critical' | 'executive';
  }[];
  emailNotificationPayloads: {
    recipient: User;
    subject: string;
    previewBody: string;
    type: EmailAlertType;
  }[];
}

/**
 * Finds the leadership hierarchy chain for a given deliverable and assignee
 */
export function getLeadershipChain(assignee: User | undefined, users: User[]): {
  trafficManager?: User;
  directSuperior?: User;
  director?: User;
  generalManager?: User;
} {
  const trafficManager = users.find((u) => u.role === 'traffic_manager') || users.find((u) => u.id === 'usr-kwame-mensah');
  const generalManager = users.find((u) => u.role === 'general_manager') || users.find((u) => u.id === 'usr-marcus-sterling');
  const director = users.find((u) => u.role === 'director') || users.find((u) => u.id === 'usr-elena-rostova');

  // Direct superior: either the assignee's team lead, managerId, or senior manager
  let directSuperior: User | undefined;
  if (assignee?.managerId) {
    directSuperior = users.find((u) => u.id === assignee.managerId);
  }
  if (!directSuperior && assignee) {
    directSuperior = users.find((u) => u.teamId === assignee.teamId && (u.role === 'team_lead' || u.role === 'manager'));
  }
  if (!directSuperior) {
    directSuperior = users.find((u) => u.role === 'team_lead') || users.find((u) => u.role === 'manager') || director;
  }

  return { trafficManager, directSuperior, director, generalManager };
}

/**
 * Evaluates the exact escalation status and details for a deliverable
 * Escalation Ladder:
 * - T - Warning Window (e.g. 24h): Assigned staff gets nearly-due alert (web + email)
 * - T - 0h (Due): Staff & Traffic get alert to push work to superior for review
 * - T + 1h Overdue: Traffic gets alert to prompt the assignee
 * - T + 3h Overdue: Team Lead / Direct Superior gets escalation alert
 * - T + 24h (1 Day) Overdue: Studio Director gets escalation alert
 * - T + 72h (3 Days) Overdue: General Manager gets critical executive escalation
 */
export function evaluateDeliverableEscalation(
  job: Job,
  users: User[],
  warningHours: number = 24,
  refDate: Date = new Date()
): EscalationInfo {
  const isCompleted = job.status === 'completed' || job.workflowStage === 'completed';
  const dueDate = new Date(job.dueDate);
  const diffMs = refDate.getTime() - dueDate.getTime();
  const overdueHours = diffMs / (1000 * 60 * 60);

  const assignee = users.find((u) => u.id === job.assigneeId);
  const { trafficManager, directSuperior, director, generalManager } = getLeadershipChain(assignee, users);

  let stage: DeliverableEscalationStage = 'on_track';
  let stageLabel = 'On Track';
  let stageShortLabel = 'On Track';
  let severity: 'info' | 'warning' | 'critical' | 'executive' = 'info';

  const webNotificationPayloads: EscalationInfo['webNotificationPayloads'] = [];
  const emailNotificationPayloads: EscalationInfo['emailNotificationPayloads'] = [];
  const targetRecipients: User[] = [];

  const brandName = job.requestor || 'Client Brand';
  const assigneeName = assignee?.name || 'Assigned Staff';
  const formattedDueDate = dueDate.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isCompleted) {
    stage = 'on_track';
    stageLabel = 'Completed';
    stageShortLabel = 'Completed';
    severity = 'info';
  } else if (overdueHours >= 72) {
    // 72h+ (3 Days) Overdue: General Manager Executive Escalation
    stage = 'overdue_72h_gm';
    stageLabel = `Level 4 Executive Escalation • 3+ Days Overdue (${Math.floor(overdueHours / 24)}d overdue)`;
    stageShortLabel = '3d+ Overdue (GM Alert)';
    severity = 'executive';

    if (generalManager) {
      targetRecipients.push(generalManager);
      webNotificationPayloads.push({
        recipientId: generalManager.id,
        recipientRole: generalManager.role,
        title: `⛔ 3-Day Overdue Executive Alert: ${job.id}`,
        message: `Deliverable ${job.id} (${job.title}) for ${brandName} is 3 DAYS overdue (${Math.floor(overdueHours)}h). Assignee ${assigneeName}. General Manager intervention or SLA renegotiation required.`,
        actionLabel: 'Review Deliverable',
        actionType: 'open_job',
        severity: 'executive'
      });
      emailNotificationPayloads.push({
        recipient: generalManager,
        subject: `⛔ [72h Critical GM Escalation] Deliverable 3 Days Overdue: GM Executive Intervention for ${job.id}`,
        previewBody: `Marcus, Deliverable [${job.id}] for ${brandName} is now 3 DAYS past its committed delivery deadline (${formattedDueDate}). Assignee ${assigneeName} has not completed handoff. As General Manager, immediate executive intervention or client account renegotiation is required to mitigate agency breach.`,
        type: 'escalation_gm'
      });
    }

    // Traffic also remains informed
    if (trafficManager) {
      targetRecipients.push(trafficManager);
      webNotificationPayloads.push({
        recipientId: trafficManager.id,
        recipientRole: trafficManager.role,
        title: `⛔ 3-Day Overdue Escalated to GM: ${job.id}`,
        message: `${job.id} is 3 days overdue. Escalated directly to General Manager Marcus Sterling.`,
        actionLabel: 'Prompt Assignee',
        actionType: 'prompt_assignee',
        severity: 'executive'
      });
    }
  } else if (overdueHours >= 24) {
    // 24h+ (1 Day) Overdue: Studio Director Escalation
    stage = 'overdue_24h_director';
    stageLabel = `Level 3 Department Escalation • 24h+ Overdue (${Math.floor(overdueHours)}h overdue)`;
    stageShortLabel = '24h Overdue (Director)';
    severity = 'critical';

    if (director) {
      targetRecipients.push(director);
      webNotificationPayloads.push({
        recipientId: director.id,
        recipientRole: director.role,
        title: `🔴 24-Hour Overdue Alert: ${job.id}`,
        message: `Deliverable ${job.id} (${job.title}) is 24+ hours overdue. Assigned to ${assigneeName}. Studio Director bottleneck review required.`,
        actionLabel: 'Review Deliverable',
        actionType: 'open_job',
        severity: 'critical'
      });
      emailNotificationPayloads.push({
        recipient: director,
        subject: `🔴 [24h Overdue Escalation] Studio Director intervention for ${job.id}`,
        previewBody: `Elena, Deliverable [${job.id}] (${job.title}) for ${brandName} has exceeded deadline by over 24 hours (${Math.floor(overdueHours)}h). Please coordinate with team leadership and traffic to clear dependencies or reallocate craft assets.`,
        type: 'escalation_director'
      });
    }

    if (trafficManager) {
      targetRecipients.push(trafficManager);
      webNotificationPayloads.push({
        recipientId: trafficManager.id,
        recipientRole: trafficManager.role,
        title: `🔴 24h Overdue Escalated to Director: ${job.id}`,
        message: `${job.id} is 24h overdue. Studio Director Elena Rostova notified.`,
        actionLabel: 'Prompt Assignee',
        actionType: 'prompt_assignee',
        severity: 'critical'
      });
    }
  } else if (overdueHours >= 3) {
    // 3h+ Overdue: Team Lead / Direct Superior Escalation
    stage = 'overdue_3h_lead';
    stageLabel = `Level 2 Superior Escalation • 3h+ Overdue (${Math.floor(overdueHours)}h overdue)`;
    stageShortLabel = '3h Overdue (Lead Alert)';
    severity = 'critical';

    if (directSuperior) {
      targetRecipients.push(directSuperior);
      webNotificationPayloads.push({
        recipientId: directSuperior.id,
        recipientRole: directSuperior.role,
        title: `🚨 3-Hour Overdue Superior Alert: ${job.id}`,
        message: `Deliverable ${job.id} (${job.title}) is 3 hours overdue. Assigned to ${assigneeName}. Direct team lead / supervisor intervention required.`,
        actionLabel: 'Review Deliverable',
        actionType: 'open_job',
        severity: 'critical'
      });
      emailNotificationPayloads.push({
        recipient: directSuperior,
        subject: `🚨 [3h Overdue Escalation] Superior intervention required for ${job.id}`,
        previewBody: `${directSuperior.name}, Deliverable [${job.id}] assigned to ${assigneeName} is now 3 hours past its scheduled deadline (${formattedDueDate}). Immediate check-in is required to establish completion ETA or clear blockers.`,
        type: 'escalation_lead'
      });
    }

    if (trafficManager) {
      targetRecipients.push(trafficManager);
      webNotificationPayloads.push({
        recipientId: trafficManager.id,
        recipientRole: trafficManager.role,
        title: `🚨 3h Overdue Escalated to Lead: ${job.id}`,
        message: `${job.id} is 3 hours overdue. Direct superior ${directSuperior?.name || 'Lead'} alerted.`,
        actionLabel: 'Prompt Assignee',
        actionType: 'prompt_assignee',
        severity: 'critical'
      });
    }
  } else if (overdueHours >= 1) {
    // 1h Overdue: Traffic Manager Prompt Person Alert
    stage = 'overdue_1h_traffic';
    stageLabel = `Level 1 Traffic Prompt Required • 1h Overdue (${Math.floor(overdueHours)}h)`;
    stageShortLabel = '1h Overdue (Prompt Person)';
    severity = 'warning';

    if (trafficManager) {
      targetRecipients.push(trafficManager);
      webNotificationPayloads.push({
        recipientId: trafficManager.id,
        recipientRole: trafficManager.role,
        title: `⚠️ 1-Hour Overdue Alert: Action Required for ${job.id}`,
        message: `Deliverable ${job.id} is 1 hour overdue without review submission. Action: Prompt ${assigneeName} immediately.`,
        actionLabel: 'Prompt Assignee',
        actionType: 'prompt_assignee',
        severity: 'warning'
      });
      emailNotificationPayloads.push({
        recipient: trafficManager,
        subject: `⚠️ [1h Overdue Alert] Traffic prompt required for ${job.id} (${assigneeName})`,
        previewBody: `Kwame, Deliverable [${job.id}] (${job.title}) for ${brandName} has elapsed its deadline by 1 hour. Please prompt ${assigneeName} immediately to confirm submission timeline or identify delays before superior escalation triggers at 3 hours.`,
        type: 'traffic_prompt'
      });
    }
  } else if (overdueHours >= 0) {
    // 0h - 1h Overdue (Due Now): Staff & Traffic both get alert to push work to superior for review
    stage = 'due_now';
    stageLabel = 'Deliverable Due Now • Time to Push to Superior';
    stageShortLabel = 'Due Now (Push to Review)';
    severity = 'warning';

    if (assignee) {
      targetRecipients.push(assignee);
      webNotificationPayloads.push({
        recipientId: assignee.id,
        recipientRole: assignee.role,
        title: `🔔 Deliverable Due Now: ${job.id}`,
        message: `Deliverable ${job.id} (${job.title}) is due now! It's time to push your work to a superior / manager to review.`,
        actionLabel: 'Push to Superior for Review',
        actionType: 'push_to_review',
        severity: 'warning'
      });
      emailNotificationPayloads.push({
        recipient: assignee,
        subject: `🔔 [Deliverable Due] ${job.id}: Time to push work to superior for review`,
        previewBody: `${assigneeName}, your deliverable [${job.id}] for ${brandName} is now due (${formattedDueDate}). Please push your work to your direct superior / creative director for review to maintain your turnaround benchmark.`,
        type: 'due_now'
      });
    }

    if (trafficManager) {
      targetRecipients.push(trafficManager);
      webNotificationPayloads.push({
        recipientId: trafficManager.id,
        recipientRole: trafficManager.role,
        title: `🔔 Deliverable Due: Time to Push Review for ${job.id}`,
        message: `Deliverable ${job.id} is due now. Ensure ${assigneeName} submits files to superior for review.`,
        actionLabel: 'Push to Review',
        actionType: 'push_to_review',
        severity: 'warning'
      });
      emailNotificationPayloads.push({
        recipient: trafficManager,
        subject: `🔔 [Deliverable Due] ${job.id} (${assigneeName}) due for superior review`,
        previewBody: `Kwame, Deliverable [${job.id}] for ${brandName} has reached its due deadline. Monitor handoff and ensure ${assigneeName} pushes deliverable to superior review.`,
        type: 'due_now'
      });
    }
  } else if (overdueHours < 0 && Math.abs(overdueHours) <= warningHours) {
    // Nearly Due: Configurable warning window before deadline (e.g. 24h)
    // Assigned Staff receives web app alert and email
    const hoursLeft = Math.ceil(Math.abs(overdueHours));
    stage = 'nearly_due';
    stageLabel = `Nearly Due • Due in ~${hoursLeft} hours`;
    stageShortLabel = `Due in ${hoursLeft}h`;
    severity = 'info';

    if (assignee) {
      targetRecipients.push(assignee);
      webNotificationPayloads.push({
        recipientId: assignee.id,
        recipientRole: assignee.role,
        title: `⏰ Deliverable Nearly Due: ${job.id} (in ${hoursLeft}h)`,
        message: `Deliverable ${job.id} (${job.title}) is due in ${hoursLeft} hours on ${formattedDueDate}. Finalize files to submit on time.`,
        actionLabel: 'View Deliverable',
        actionType: 'open_job',
        severity: 'info'
      });
      emailNotificationPayloads.push({
        recipient: assignee,
        subject: `⏰ [Nearly Due] ${job.id}: ${job.title} (Due in ${hoursLeft}h)`,
        previewBody: `Chale ${assigneeName}, heads-up that [${job.id}] for ${brandName} is due in ${hoursLeft} hours (${formattedDueDate}). Please wrap up exports and prepare for internal review.`,
        type: 'nearly_due'
      });
    }
  } else {
    stage = 'on_track';
    stageLabel = 'On Track';
    stageShortLabel = 'On Track';
    severity = 'info';
  }

  return {
    job,
    overdueHours,
    stage,
    stageLabel,
    stageShortLabel,
    severity,
    isCompleted,
    assignee,
    trafficManager,
    directSuperior,
    director,
    generalManager,
    targetRecipients,
    webNotificationPayloads,
    emailNotificationPayloads
  };
}

/**
 * Generates initial baseline web notifications for the app based on mock due dates
 */
export function generateInitialWebNotifications(jobs: Job[], users: User[], warningHours: number = 24): WebNotificationItem[] {
  const notifications: WebNotificationItem[] = [];

  jobs.forEach((job) => {
    const evalResult = evaluateDeliverableEscalation(job, users, warningHours);
    if (evalResult.stage !== 'on_track') {
      evalResult.webNotificationPayloads.forEach((payload, idx) => {
        notifications.push({
          id: `web-notif-${job.id}-${payload.recipientId}-${idx}`,
          recipientId: payload.recipientId,
          recipientRole: payload.recipientRole,
          jobId: job.id,
          jobTitle: job.title,
          brandName: job.requestor || 'Client Brand',
          title: payload.title,
          message: payload.message,
          type:
            evalResult.stage === 'nearly_due'
              ? 'nearly_due'
              : evalResult.stage === 'due_now'
              ? 'due_now'
              : evalResult.stage === 'overdue_1h_traffic'
              ? 'traffic_prompt'
              : evalResult.stage === 'overdue_3h_lead'
              ? 'escalation_lead'
              : evalResult.stage === 'overdue_24h_director'
              ? 'escalation_director'
              : 'escalation_gm',
          escalationStage: evalResult.stage,
          createdAt: new Date().toISOString(),
          read: false,
          hoursOverdue: Math.max(0, Math.round(evalResult.overdueHours)),
          actionLabel: payload.actionLabel,
          actionType: payload.actionType,
          severity: payload.severity
        });
      });
    }
  });

  return notifications;
}

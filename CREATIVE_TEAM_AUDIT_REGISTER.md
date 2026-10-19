# Tibule Control Tower: Creative Department Master Audit & Change Register

This document serves as the master audit register for reviewing the **Creative Department** role-by-role and screen-by-screen across all layouts, workflows, interactions, and responsibilities.

---

## Review Scope & Creative Department Hierarchy

| Role ID | Person | Job Title | Seniority | Direct Manager | Key Workstation Views |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CR-01** | **Elena Rostova** | Executive Creative Director (ECD) | Director | Marcus Sterling (GM) | Overview / Creative Manager Hub, Team Queue, Cases Governance, Workflow Engine, Master Table, Champions, Organogram |
| **CR-02** | **Maya Osei** | Associate Creative Director (ACD) | Associate Director | Elena Rostova (ECD) | Studio Overview, Creative Allocations, Workflow Review, Cases Governance, Organogram |
| **CR-03** | **Sarah Jenkins** | Art Director & Brand Lead | Team Lead / Lead | Maya Osei (ACD) | Lead Dashboard, Studio Queue, Brief Acceptance, Review Sign-off, Evidence & Capacity, Organogram |
| **CR-04** | **Amara Okafor** | Motion & Digital Specialist | Specialist | Sarah Jenkins (Lead) | Employee Dashboard, My Work Queue, Evidence & Deliverables, Overtime Modal, Champions, Organogram |
| **CR-05** | **Priyah Sharma** | Junior Visual & Packaging Designer | Junior | Sarah Jenkins (Lead) | Employee Dashboard, My Work, Deliverables Submission, Evidence, Champions, Organogram |
| **CR-06** | **Kofi Boateng** | Creative NSS / NSP Assistant | NSS Intern | Sarah Jenkins (Lead) | Intern Dashboard, Task Queue, Mentorship Evidence, Learning Hours, Champions, Organogram |

---

## Role 1: Executive Creative Director (ECD) — Elena Rostova

### Screen 1.1: Creative Leadership Dashboard (`activeView === 'overview'`)
- **Target Persona:** `usr-elena-rostova` (Role: `director`, Department: `creative`)
- **Key Layout Elements:**
  - Creative studio velocity indicators, capacity utilization gauge, total active briefs.
  - Department workload distribution (Art Direction, Motion, Junior, Intern).
  - Open creative reviews & pending director sign-offs.
- **Workflow & Audit Items:**
  - [ ] **Layout Audit:** Verify density, card aspect ratios, and responsiveness across desktop, tablet, and mobile.
  - [ ] **Thematic Color:** Ensure all badges, icons, borders, and accents strictly use Creative Yellow (`#EAB308`).
  - [ ] **Action Integrity:** Test direct jump from high-priority creative brief to review stage.
  - [ ] **User Change Items:** *(Ready for user inputs)*

### Screen 1.2: Creative Team Queue (`activeView === 'my_work' | 'team_queue'`)
- **Workflow & Audit Items:**
  - [ ] **Filter Audit:** Verify filter allows switching between all Creative members, sub-disciplines, and priority tiers.
  - [ ] **Discipline Tags:** Confirm zero unnecessary discipline tags appear for Creative staff (strictly reserved for Client Services).
  - [ ] **User Change Items:** *(Ready for user inputs)*

### Screen 1.3: Progression Cases & Governance (`activeView === 'cases'`)
- **Workflow & Audit Items:**
  - [ ] **Review Actions:** ECD approval, feedback remarks, escalation to GM.
  - [ ] **Audit Trail:** Verify immutable audit logs capture review decisions.
  - [ ] **User Change Items:** *(Ready for user inputs)*

### Screen 1.4: Agency Workflow Engine (`activeView === 'agency_workflow'`)
- **Workflow & Audit Items:**
  - [ ] **Pipeline Stages:** Intake -> Creative Conception -> Internal Review -> Client Revert -> Final Proof.
  - [ ] **Bottleneck Highlights:** Visual indicators when assets exceed SLA turnaround.
  - [ ] **User Change Items:** *(Ready for user inputs)*

---

## Role 2: Associate Creative Director (ACD) — Maya Osei

### Screen 2.1: Studio Workload & Allocation Hub
- **Target Persona:** `usr-maya-osei` (Role: `director`, Seniority: `associate_director`)
- **Workflow & Audit Items:**
  - [ ] **Allocation Tools:** Reassigning briefs between Art Director, Motion Specialist, and Juniors.
  - [ ] **Capacity Balance:** Verification that 40-hour weekly caps are honored before assignment.
  - [ ] **User Change Items:** *(Ready for user inputs)*

### Screen 2.2: Creative Quality & Critique Reviews
- **Workflow & Audit Items:**
  - [ ] **Proofing Interface:** Reviewing uploaded assets, proof markups, and revision notes.
  - [ ] **User Change Items:** *(Ready for user inputs)*

---

## Role 3: Art Director & Brand Lead — Sarah Jenkins

### Screen 3.1: Team Lead Workspace & Active Sprints
- **Target Persona:** `usr-sarah-jenkins` (Role: `team_lead`, Seniority: `art_director`)
- **Workflow & Audit Items:**
  - [ ] **Lead Overview:** Direct supervision of Amara (Specialist), Priyah (Junior), and Kofi (Intern).
  - [ ] **Timesheet Verification:** Weekly sign-off on creative hours submitted by squad.
  - [ ] **User Change Items:** *(Ready for user inputs)*

### Screen 3.2: My Work & Brand Architecture Deliverables
- **Workflow & Audit Items:**
  - [ ] **Brief Acceptance:** Ability to accept or request clarifications on incoming briefs from Client Services.
  - [ ] **User Change Items:** *(Ready for user inputs)*

---

## Role 4: Motion & Digital Specialist — Amara Okafor

### Screen 4.1: Specialist Daily Workspace (`activeView === 'overview'`)
- **Target Persona:** `usr-amara-okafor` (Role: `employee`, Seniority: `specialist`)
- **Workflow & Audit Items:**
  - [ ] **Daily Task Prioritization:** Due-today items, active rendering pipelines, feedback tickets.
  - [ ] **Timer / Hour Tracking:** Accuracy of time logging per deliverable.
  - [ ] **User Change Items:** *(Ready for user inputs)*

### Screen 4.2: My Evidence & Portfolio Vault (`activeView === 'evidence'`)
- **Workflow & Audit Items:**
  - [ ] **Submission Flow:** Attaching motion clips, project links, impact logs.
  - [ ] **Overtime Logging:** Modal for logging extra hours with client-billable tagging.
  - [ ] **User Change Items:** *(Ready for user inputs)*

---

## Role 5: Junior Visual & Packaging Designer — Priyah Sharma

### Screen 5.1: Junior Execution Workspace
- **Target Persona:** `usr-priyah-sharma` (Role: `employee`, Seniority: `junior`)
- **Workflow & Audit Items:**
  - [ ] **Task Clarity:** Step-by-step asset spec guidelines and checklist.
  - [ ] **Feedback Loops:** Clear visibility of revisions requested by Sarah Jenkins or Maya Osei.
  - [ ] **User Change Items:** *(Ready for user inputs)*

---

## Role 6: Creative NSS / NSP Assistant — Kofi Boateng

### Screen 6.1: Intern Guided Workspace
- **Target Persona:** `usr-kofi-boateng` (Role: `employee`, Seniority: `nsp_intern`)
- **Workflow & Audit Items:**
  - [ ] **Onboarding & Guardrails:** Guided task templates, learning hours vs production hours.
  - [ ] **Mentorship Feedback:** Evaluation cards from Art Director.
  - [ ] **User Change Items:** *(Ready for user inputs)*

---

## Shared Creative Views Audit (All Roles)

### Screen C.1: Agency Organogram (`activeView === 'organogram'`)
- [ ] **Lateral Hierarchy:** Lateral branching from Executive apex into Creative branch.
- [ ] **Yellow Thematic Standard:** Creative nodes and connectors strictly use Creative Yellow (`#EAB308`).
- [ ] **No Admin Node:** Confirm Platform Architect/Admin (`usr-tariq-afriq`) is completely excluded.
- [ ] **No Unnecessary Tags:** Confirm Creative members have no discipline tags (only Client Services).
- [ ] **Line Continuity:** SVG connection paths connect cleanly without disjointed gaps.
- [ ] **Responsive Modes:** Mobile, Tablet, and Desktop scale presets work seamlessly.

### Screen C.2: Sidebar Motivation Card
- [ ] **Library:** 250 image + message combinations across all 3 teams.
- [ ] **Rotation:** 4 items per day, 2-hour cycles across 8-hour workday.
- [ ] **UI:** Clean photographic presentation with zero scroller or cluttered badges.

---

## Audit Change Log & Execution History

| Date | Role / Screen | Scope | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Current** | **Non-Director Creative Staff** | Sarah Jenkins, Amara Okafor, Priyah Sharma, Kofi Boateng | `Changes Implemented` | Implemented full change list: Home tab-free minimalist view with Personal Workload Balance, universal 'Home' renaming across all roles, workflow Kanban with 'Accept Task', auto-duration calculation for Exceptional Effort, and dynamic audit-log metrics with outcome synthesis for My Cases. |
| **Next** | **Director Creative Staff** | Elena Rostova (ECD), Maya Osei (ACD) | `Awaiting Review` | Executive overview, allocation engine, proofing & creative governance views. |


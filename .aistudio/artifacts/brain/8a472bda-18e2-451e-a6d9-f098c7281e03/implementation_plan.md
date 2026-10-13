# Agency-Wide Interactive Organogram Directory

A dedicated, interactive visual organogram for Tibule Control Tower, establishing an agency-wide top-down reporting hierarchy with General Manager Marcus Sterling at the apex, branching cleanly into the three operational pillars: **Client Services**, **Creative**, and **Traffic & Operations**. Features interactive branch collapse/expand toggles, department filter pills, rich practitioner cards with live 40-hour capacity meters and alerts, and a read-only directory inspection drawer.

## User Decisions & Clarifications Confirmed

> [!IMPORTANT]
> **Confirmed Architecture & Scope**:
> 1. **GM at the Apex**: Managing Partner & General Manager (Marcus Sterling) sits at the top root of the organogram.
> 2. **Department Branches**: Directly branches into:
>    - **Client Services**: Director of Client Services (David Vance) → Senior AMs (Michael Chen, Noah Thorne) → AMs (Selorm Adams) → AEs (Liam O'Connor) → NSS Interns (Abena Mensah).
>    - **Creative**: Executive Creative Director (Elena Rostova) → Associate Creative Director (Maya Osei) → Art Directors & Leads (Sarah Jenkins, Amara Okafor) → Specialists (Priyah Sharma, Kofi Boateng).
>    - **Traffic & Operations**: Studio Traffic Manager (Kwame Mensah) → Traffic Intake Specialist & Coordinators (Kweku Asare).
> 3. **Department Filtering**: Quick filter toggles (`All Agency`, `Client Services`, `Creative`, `Traffic & Operations`) to focus the view on specific reporting lines while maintaining clear executive root context.
> 4. **Expandable Branch Toggles**: Interactive buttons on manager nodes (`▼ N Direct Reports` / `▲ Collapse`) allowing smooth collapsing and expanding of sub-trees with clean connection line rendering.
> 5. **Rich Practitioner Cards**: Each card displays role, seniority, department color theme, universal 40.0-hour capacity gauge, direct reports count, and live alert badges (overtime >40h or job allocation variances).
> 6. **Read-Only Directory Inspection**: Clicking any card opens a slide-over drawer displaying the complete upward chain of command, assigned accounts, and timesheet summary.

---

## 1. User Experience & Visual Design

### Native Visual Styling & Theme Integration
- 100% styled to match Control Tower's design system:
  - Theme background tokens: `bg-surface`, `bg-surface-elevated`, root `var(--color-canvas)`.
  - Borders: `border border-border/80 rounded-2xl`.
  - Department Accent Colors:
    - **Client Services**: Tibule Sky Blue (`#0284c7` / `text-sky-400 bg-sky-500/10 border-sky-500/20`).
    - **Creative**: Indigo Violet (`#8b5cf6` / `text-violet-400 bg-violet-500/10 border-violet-500/20`).
    - **Traffic & Operations**: Studio Emerald (`#10b981` / `text-emerald-400 bg-emerald-500/10 border-emerald-500/20`).
    - **Executive / GM**: Sovereign Gold/Amber (`#f59e0b` / `text-amber-400 bg-amber-500/10 border-amber-500/20`).
- Monospace Data Readouts: `font-mono tabular-nums` for capacity hours, utilization percentages, and headcount tallies.
- SVG Connectors: Smooth bezier or orthogonal lines connecting parent nodes to subordinate branches with high-contrast theme border strokes.

### Visual Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AGENCY ORGANOGRAM DIRECTORY                           │
│  [Search team member...]   [All Agency] [Client Services] [Creative] [Traffic]│
│  [+ Zoom In] [- Zoom Out] [Fit Canvas] [Expand All] [Collapse All]          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                        ┌────────────────────────┐                           │
│                        │    Marcus Sterling     │  Managing Partner & GM    │
│                        │ [40.0h Baseline: 38h]  │  Executive Lead           │
│                        │     [3 Direct Rpts]    │                           │
│                        └───────────┬────────────┘                           │
│                 ┌──────────────────┼──────────────────┐                     │
│                 ▼                  ▼                  ▼                     │
│        ┌─────────────────┐┌─────────────────┐┌─────────────────┐             │
│        │   David Vance   ││  Elena Rostova  ││  Kwame Mensah   │             │
│        │  Director of CS ││  Exec Creative  ││ Traffic Manager │             │
│        │ [40.0h] [4 Rpts]││ [40.0h] [5 Rpts]││ [40.0h] [2 Rpts]│             │
│        └────────┬────────┘└────────┬────────┘└────────┬────────┘             │
│                 │                  │                  │                     │
│         [Expand/Collapse]  [Expand/Collapse]  [Expand/Collapse]             │
│                 │                                                           │
│        ┌────────┴────────┐                                                  │
│        ▼                 ▼                                                  │
│ ┌───────────────┐ ┌───────────────┐                                         │
│ │ Michael Chen  │ │  Noah Thorne  │                                         │
│ │ Senior AM     │ │ Senior AM     │                                         │
│ │ [42.5h OT !]  │ │ [39.0h]       │                                         │
│ └───────┬───────┘ └───────────────┘                                         │
│         ▼                                                                   │
│ ┌───────────────┐                                                           │
│ │ Selorm Adams  │                                                           │
│ │ Account Mgr   │                                                           │
│ └───────┬───────┘                                                           │
│         ├───────────────┐                                                   │
│         ▼               ▼                                                   │
│ ┌───────────────┐ ┌───────────────┐                                         │
│ │ Liam O'Connor │ │ Abena Mensah  │                                         │
│ │ Account Exec  │ │ NSS Intern    │                                         │
│ │ [Variance !]  │ │ [34.0h]       │                                         │
│ └───────────────┘ └───────────────┘                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Rich Practitioner Node Card Structure
1. **Department Tag & Seniority Pill**:
   - `CLIENT SERVICES • DIRECTOR` or `CREATIVE • ASSOCIATE DIRECTOR`
2. **Avatar & Identity**:
   - Two-letter initials avatar with subtle colored ring.
   - Practitioner Name and official Job Title.
3. **40-Hour Capacity Baseline Bar**:
   - Visual progress bar showing weekly logged hours against `40.0h`.
   - Percentage readout (e.g. `95% Utilized`).
   - Crimson badge if exceeding 40h (e.g. `+2.5h Overtime`).
4. **Discipline Tags**:
   - Primary assigned functional discipline (e.g. `Digital Media`, `Strategy`, `Motion Design`).
5. **Direct Reports Collapse/Expand Trigger**:
   - Pill button: `▼ 4 Reports` (expanded) / `▶ 4 Reports` (collapsed).
   - Clicking toggles the child branch without changing page context.

---

## 2. Technical Architecture & Component Breakdown

### 1. `src/utils/organogramTreeEngine.ts`
- **Data Models**:
  ```typescript
  export interface OrganogramNode {
    id: string;
    user: User;
    department: AgencyDepartment | 'executive';
    reportingLevel: string;
    totalDirectReports: number;
    totalBranchHeadcount: number;
    weeklyLoggedHours: number;
    capacityHours: number;
    utilizationPercentage: number;
    hasOvertime: boolean;
    hasAlerts: boolean;
    activeAlertsCount: number;
    primaryDiscipline?: string;
    children: OrganogramNode[];
  }
  ```
- **Recursive Tree Construction**:
  - Traverses `users` array, finds apex node (`managerId === undefined` or GM Marcus Sterling).
  - Recursively attaches subordinates matching `user.managerId === parent.id`.
  - Aggregates branch metrics and timesheet telemetry.
- **Department Filtering**:
  - When filtering by `client_services`, preserves GM at apex and returns the Client Services branch while collapsing or hiding other branches.

### 2. `src/components/organogram/OrganogramTreeNode.tsx`
- Renders the individual rich card and its subordinate branch grid.
- Manages local expanded state with smooth transitions.
- Renders connecting vertical/horizontal line stems using Tailwind borders.
- Implements search matching highlight (ring glow when matching search query).
- Click trigger to open `OrganogramDetailDrawer`.

### 3. `src/components/organogram/OrganogramDetailDrawer.tsx`
- Read-only slide-over inspection drawer:
  - Header with avatar, title, department chip, and email.
  - **Reporting Line Chain**: Visual breadcrumb ascending to GM and descending to immediate direct reports.
  - **Operational Telemetry**: 40-hour capacity pool meter, account management vs execution split.
  - **Assigned Functional Disciplines**: Badges for assigned disciplines and proficiency ratings.
  - **Active Deliverables**: List of active jobs assigned with status and deadlines.
  - **Discrepancy & Overtime Records**: Detailed view of any active discrepancy flags.

### 4. `src/components/organogram/AgencyOrganogramView.tsx`
- Main page container:
  - Header with title, subtitle, and total agency headcount counter.
  - Filter bar: `All Agency`, `Client Services`, `Creative`, `Traffic & Operations`.
  - Search input for instant team member lookup.
  - View controls: Zoom In (`+`), Zoom Out (`-`), Reset Fit, Expand All Branches, Collapse All Branches.
  - Overflow scroll container with canvas drag/pan support.

### 5. Routing & Sidebar Navigation
- Add `'organogram'` to `activeView` union type.
- Add "Organogram Directory" navigation item in `src/components/layout/Sidebar.tsx` with `Network` icon under Agency Governance.
- Mount `AgencyOrganogramView` in `src/App.tsx`.

---

## 3. Implementation Steps

1. **Tree Transformer (`src/utils/organogramTreeEngine.ts`)**:
   - Implement hierarchical tree builder from `users`, `timesheetEntries`, and `discrepancyAlerts`.
2. **Rich Node Component (`src/components/organogram/OrganogramTreeNode.tsx`)**:
   - Construct card UI with 40h meter, direct reports toggle, and branch connectors.
3. **Detail Drawer (`src/components/organogram/OrganogramDetailDrawer.tsx`)**:
   - Build read-only slide-over inspection drawer.
4. **Organogram Main View (`src/components/organogram/AgencyOrganogramView.tsx`)**:
   - Assemble filter tabs, search bar, zoom/pan controls, and tree layout.
5. **Sidebar & View Integration**:
   - Add `organogram` view into `Sidebar.tsx` and `App.tsx`.
6. **Compilation & Verification**:
   - Run `compile_applet` and `lint_applet` to ensure zero compilation or lint errors.

---

## 4. Verification & Testing Plan

1. **Apex & Department Branches**: Verify GM Marcus Sterling is at the apex, branching accurately into Client Services (David Vance), Creative (Elena Rostova), and Traffic (Kwame Mensah).
2. **Department Filtering**: Toggle `All Agency`, `Client Services`, `Creative`, and `Traffic & Operations` to verify proper branch filtering.
3. **Branch Toggle Interaction**: Click direct report buttons (`▼ N Reports`) to verify expanding and collapsing branches cleanly.
4. **Live 40h Telemetry & Alerts**: Verify Michael Chen reflects the overtime badge (>40h), Liam reflects job allocation variance, and compliant members show on-track meters.
5. **Search & Drawer**: Search for a practitioner to confirm node focus highlight, and click to verify the detail inspection drawer opens with full reporting and workload telemetry.

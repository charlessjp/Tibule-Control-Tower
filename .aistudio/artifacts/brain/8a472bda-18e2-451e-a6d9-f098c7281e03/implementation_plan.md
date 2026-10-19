# Implementation Plan: Cross-Departmental Management Rewards Catalogue & Emoji Purge

Transform the management rewards catalogue into an authentic, agency-wide excellence framework that spans all three departments—**Creative Studio**, **Client Service**, and **Studio Traffic**—with grounded descriptions, transparent system calculation formulas, clean SVG iconography, total removal of emojis, and clearing "Accra Studio" regional branding in favor of clean studio terminology.

---

## 1. Architectural Principles & Requirements

1. **True Cross-Departmental Eligibility**:
   - Every award can be won by a Creative (Designer/Art Director), Client Service practitioner (Account Manager/Executive), or Studio Traffic operator (Traffic Manager/Dispatch Specialist).
   - Expand candidate selection in the award modal to include all practitioners across the 3 departments (`role === 'employee' || role === 'team_lead' || role === 'client_service' || role === 'traffic_manager'`).
2. **Authentic Agency Tone & Brand Neutrality**:
   - Clear "Accra Studio" regional branding from reward titles, badges, and prizes (renaming to universal honors such as **Studio MVP of the Month**).
   - Use grounded industry terminology instead of generic buzzwords.
   - Each award includes explicit operational definitions across Creative, Client Service, and Studio Traffic.
3. **Transparent System Calculation Formulas**:
   - Each reward card explicitly displays how the underlying system engine scores and qualifies practitioners.
4. **Complete Emoji Purge**:
   - Remove every emoji (🥇, 🥈, 🥉, ⚡, 🎯, 🤝, 🏆, 🎉, etc.) from reward titles, badges, toast popups, select options, and alert subjects.
   - Replace with clean Lucide SVG icons (`Award`, `Zap`, `CheckCircle2`, `Users`, `Target`, `ShieldCheck`), subtle 1px border lines, tabular numbers (`font-mono`), and unboxed text hierarchy.

---

## 2. Cross-Departmental Catalogue Architecture

### Category 1: Studio MVP of the Month (`mvp_of_the_month`)
* **Agency Scope**:
  * *Creative*: Flawless delivery on high-visibility client sprints with standout visual or conceptual craft.
  * *Client Service*: Flawless account stewardship, protecting project profitability, and retaining key tier-1 accounts.
  * *Studio Traffic*: Master dispatch governance, zero SLA breach slippage, and balancing workloads across pressured teams.
* **System Calculation Formula**:
  $$\text{Points} = (\text{Deliverables Completed} \times 50) + (\text{On-Time Rate \%} \times 10) + (\text{Zero-Revert \%} \times 10) + \text{Velocity Bonus}$$
  *Eligibility criteria*: Overall leaderboard top rank or $\ge 1,500$ points with $\ge 95\%$ on-time rate.
* **Icon**: Lucide `Award` (Gold/Brand accent, zero emojis).
* **Prize Structure**: Direct Cash Bonus + Executive Lunch with General Manager.

### Category 2: Turnaround Titan (Delivery Velocity) (`turnaround_titan`)
* **Agency Scope**:
  * *Creative*: Delivering high-complexity motion/visual/copy assets ahead of estimated benchmark hours with zero craft compromise.
  * *Client Service*: Fast brief formulation, rapid client debrief synthesis, and immediate commercial variation reconciliation.
  * *Studio Traffic*: Fastest dispatch turnaround ($< 1.5$ hours from brief intake to team assignment).
* **System Calculation Formula**:
  $$\text{Velocity Score} = \max\left(0, \text{round}\left(\frac{\text{Estimated Hours} - \text{Actual Hours}}{\text{Estimated Hours}} \times 100\right)\right)$$
  *Eligibility criteria*: Positive velocity score ($\ge 10\%$) with an active on-time delivery streak $\ge 6$ tasks.
* **Icon**: Lucide `Zap` (Amber accent, zero emojis).
* **Prize Structure**: 1 Paid Agency Flex-Day + Studio Hamper.

### Category 3: Sharp Shooter (First-Pass Precision) (`sharp_shooter`)
* **Agency Scope**:
  * *Creative*: First-time client approval on Stage 10 sign-off with zero revert rounds or prepress corrections.
  * *Client Service*: 100% brief completeness audit score with zero missing assets or unclarified specifications.
  * *Studio Traffic*: Zero client revert schedule collisions and zero unmitigated timeline disputes.
* **System Calculation Formula**:
  $$\text{First-Pass Rate} = \frac{\text{Zero-Revert Tasks}}{\text{Total Completed Tasks}} \times 100$$
  *Eligibility criteria*: Revert-free rate $\ge 90\%$ across at least 10 completed or reviewed assignments.
* **Icon**: Lucide `CheckCircle2` (Emerald accent, zero emojis).
* **Prize Structure**: Professional Masterclass Sponsorship + Learning Allowance.

### Category 4: Studio Anchor (Cross-Team Collaboration) (`team_rockstar`)
* **Agency Scope**:
  * *Creative*: Mentoring junior designers, assisting on emergency crunch deliverables, and building shared token assets.
  * *Client Service*: Proactive scope shielding, protecting creative team runway, and resolving client pushbacks diplomatically.
  * *Studio Traffic*: Proactive workload leveling, mediating inter-department friction, and maintaining healthy studio flow.
* **System Calculation Formula**:
  $$\text{Anchor Score} = \text{Verified Contributions Count} \times 50 + \text{Lead Endorsement Index}$$
  *Eligibility criteria*: Minimum 3 verified strategic contributions in the studio evidence vault.
* **Icon**: Lucide `Users` (Purple accent, zero emojis).
* **Prize Structure**: Cross-Team Recognition Award + Operational Excellence Bonus.

---

## 3. Implementation Steps

### Step 1: Emoji Purge & Branding Normalization (`src/data/competitionData.ts`)
- Clear "Accra Studio" branding from all seed rewards and tier labels (e.g. `Accra Creative MVP` -> `Studio MVP of the Month`).
- Strip emojis from all seed reward titles, descriptions, and notification templates.
- Update `INITIAL_REWARDS` to reflect cross-departmental recipients.

### Step 2: Rewards Catalogue Overhaul (`src/components/competition/StudioChampionsView.tsx`)
- **Purge Emojis**:
  - Remove all emoji characters from toast notifications, select options, leaderboard tier labels, and cards.
  - Replace league leader labels (`🥇 Current League Leader` -> `League Leader`, `Silver Contender`, `Bronze Contender`) with clean typography and Lucide SVG icons.
- **Candidate Selector Expansion**:
  - Update user filter from `u.role === 'employee' || u.role === 'team_lead'` to include all practitioners across Creative, Client Service, and Studio Traffic: `u.role === 'employee' || u.role === 'team_lead' || u.role === 'client_service' || u.role === 'traffic_manager'`.
- **Clear "Accra Studio" References**:
  - Replace `Accra Creative MVP of the Month` with `Studio MVP of the Month`.
  - Clean prize text (e.g. `Skybar Accra` -> executive dining).
- **Catalogue Cards Display**:
  - Add clean, structured cards detailing each of the 4 cross-department awards, explaining what it means for Creative, Client Service, and Studio Traffic, alongside the explicit mathematical calculation formula.

### Step 3: Citation Engine & Alert Template Cleanup (`src/utils/narrativeEngine.ts` & `src/context/AppContext.tsx`)
- Update `generateExecutiveCitation` to produce natural, professional citations without emojis or regional restrictions, tailoring the phrasing to the practitioner's department (Creative, CS, or Traffic).
- Purge emoji prefixes from alert subjects in `AppContext.tsx` (`🎯 [Task Assignment]` -> `[Task Assignment]`, `🏆 [Agency Honor]` -> `[Agency Honor]`).

---

## 4. Verification & Testing

- **Compilation**: Run `lint_applet` (`tsc --noEmit`) and `compile_applet`.
- **Visual & Functional Inspection**:
  - Open **Studio Champions** (`/champions`): Verify zero emojis anywhere on the screen and no "Accra Studio" branding in reward titles.
  - Open **Confer Efficiency Reward** modal as GM: Verify all staff from Creative, Client Service, and Traffic appear in the dropdown.
  - Verify selecting an award dynamically displays its cross-department definition and system formula.
  - Grant an award and verify the toast message is clean, elegant, and emoji-free.

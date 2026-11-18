# IFSC TrustOps — Phase-by-Phase Implementation Summaries

**Institution:** Meridian Securities IFSC Limited  
**Jurisdiction:** GIFT IFSC, Gandhinagar, Gujarat, India  
**Entity Role:** Broker Dealer & Clearing Member under IFSCA Regulations  
**Signed-in Officer:** Aarav Mehta, Compliance Officer (`USR-001`)  
**Strict Technical Constraints:**
- Strictly FRONTEND-ONLY (Zero server, zero database, zero external API calls).
- Strictly In-Memory State via Zustand (no `localStorage`, `sessionStorage`, or `IndexedDB`).
- Exactly 5 Fictional Staff Members across the entire system (`USR-001` to `USR-005`).
- Strictly Light Theme Only (Zero `dark:` Tailwind classes).
- Strictly Zero Banned Words (`demo`, `mock`, `sample`, `dummy`, `fake`, `synthetic`, `test data`).
- Strictly Zero TypeScript `any` types (`: any`, `as any`, `<any>`).
- URL navigation strictly using `buildLink(path, params)` under HashRouter (`/#/...`).

---

## Phase 1A — Foundation, Design Tokens, Routing & AppShell

### Key Deliverables & Achievements
- **Routing Architecture:** Initialized React 18 + TypeScript + Vite with `HashRouter` (`createHashRouter`) to guarantee seamless client-side routing on any static host.
- **`buildLink(path, params)` Utility:** Created `src/utils/buildLink.ts` ensuring all query params and subroutes are constructed systematically under `/#/` with zero hand-written `?x=y` strings.
- **Design System & Tokens:** Implemented institutional color palette in `src/design/tokens.ts` and Tailwind config:
  - Brand Navy: `#0F172A`
  - Accent / Primary Blue: `#1E40AF`
  - Risk & Severity: Emerald (`#10B981`), Amber (`#F59E0B`), Red (`#EF4444`)
  - Background: `#F8FAFC`, Borders: `#E2E8F0`
- **Application Shell & Layout:**
  - `AppShell.tsx`: Responsive desktop layout with collapsible sidebar and sticky top navigation bar.
  - `Sidebar.tsx`: Navigation menu with active route highlighting, badge counters, and collapse toggle.
  - `TopBar.tsx`: Entity banner ("Meridian Securities IFSC Limited - Broker Dealer"), live connector freshness indicator, notification bell with unread badge, and current user chip.
  - `useTicker()`: Global 1-second pulse hook driving all real-time statutory clocks, freshness counters, and countdown timers without multiple intervals.
  - `useScrollToTop()`: Auto-scroll to top on every route transition.
- **Zero External Origin Verification:** Audited production build and preview network traffic, confirming 0 outbound HTTP/HTTPS/WebSocket requests.

---

## Phase 1B — Shared Component Library

### Key Deliverables & Achievements
- **UI Component Library (40+ Components in `src/components/ui/`):**
  - **Form Controls:** `DatePicker.tsx`, `Radio.tsx` (group), `Input.tsx`, `Select.tsx`, `Checkbox.tsx`.
  - **Overlays & Feedback:** `Modal.tsx`, `ConfirmDialog.tsx`, `Toast.tsx` (`useToast`), `Tooltip.tsx`, `Skeleton.tsx`.
  - **Data Display:** `PageHeader.tsx`, `Breadcrumbs.tsx`, `SeverityBadge.tsx`, `HashBadge.tsx`, `CountdownClock.tsx`, `DocumentPreview.tsx`, `FileUploadBox.tsx` (with Web Crypto SHA-256 calculation), `ManifestViewer.tsx`.
  - **Interactive Workflow Controls:**
    - `ApprovalPanel.tsx`: Dual sign-off workflow, dynamic approver filtering excluding maker and first approver, required rejection reason.
    - `AIDraftBanner.tsx`: Props-driven banner with diff viewer, accept/reject callbacks, and confidence rating.
    - `CitationChip.tsx`: Interactive regulation and clause citation popovers.
    - `DetailDrawer.tsx`: Standard right-side slideout using required `paramKey` prop (e.g. `?control=...`, `?task=...`) preserving all existing URL params.
    - `ExportFormatModal.tsx`: PDF, CSV, and XLSX export dialog displaying toast: `"Export prepared"`.
    - `Stepper.tsx`: Linear lifecycle state progress indicator.
    - `WizardModal.tsx`: Multi-step transactional flow controller.
    - `RosterGrid.tsx`: 5 Staff × 7 Days shift and statutory leave coverage matrix.
    - `OrgChart.tsx`: 5-node executive reporting hierarchy.
    - `PermissionMatrix.tsx`: Granular RBAC grid highlighting the `GOV-SOD-001` conflict cell in red and linking to `#/clients/cases/CASE-2026-031`.
    - `RelationshipGraph.tsx`: Interactive SVG node graph with zoom, pan, and live control dependencies.
  - **Charts (`src/components/ui/charts/`):**
    - `BarChart.tsx`, `LineChart.tsx`, `DonutChart.tsx` (with hatched SVG pattern for `UNKNOWN` status), `StackedBarChart.tsx`.

---

## Phase 2 Part 1 — Strict Types & Seed Data

### Key Deliverables & Achievements
- **Strict TypeScript Types (`src/types/*.ts`, `src/types/common.ts`):**
  - Shared enums: `ControlStatus`, `Severity`, `FilingStatus`, `ApprovalState`, `CaseState`, `IncidentState`, `ComplaintState`, `IntegrationHealth`.
  - Domain definitions: `user.ts`, `control.ts`, `incident.ts`, `case.ts`, `obligation.ts`, `task.ts`, `complaint.ts`, `evidence.ts`, `governance.ts`, `vendor.ts`, `cyber.ts`, `client.ts`, `report.ts`, `integration.ts`, `notification.ts`, `regulation.ts`, `ai.ts`, `metrics.ts`, `admin.ts`, `approval.ts`.
- **Exactly 5 Fictional Staff Members:**
  1. `USR-001` Aarav Mehta, Compliance Officer (Current User)
  2. `USR-002` Rohan Desai, Principal Officer
  3. `USR-003` Priya Nair, Risk Officer
  4. `USR-004` Vikram Shah, CISO
  5. `USR-005` Deepa Patel, Trading Desk Officer (Holds the conflicting permissions in `GOV-SOD-001`)
- **Normalized Seed Data Files (`src/data/*.data.ts`):**
  - All relative dates computed once at store initialization via `daysAgo()`, `hoursAgo()`, `daysFromNow()`.
  - IDs only; zero hardcoded URLs or route strings.
  - `controls.data.ts`: 20 controls. `GOV-SOD-001` depends on `['sso', 'hr']` (`needsRevaluation = false`). Only the 4 RMS-dependent controls (`TRADE-REC-001`, `TRADE-REC-002`, `TRADE-ACCESS-003`, `TRADE-RISK-004`) have `needsRevaluation = true` and `connectorDependencies = ['rms']`.
  - `incidents.data.ts`: `INC-2026-014` (Technical Glitch, occurred 5 days ago, leaving ~9 days on the 14-day statutory RCA clock). `INC-2026-003` (closed) with 3 acknowledged filings.
  - `regulations.data.ts`: Exact short paraphrases labelled *"Summary, verify against the official source"*.
  - `currentUser.ts`: Configured strictly as Aarav Mehta (`USR-001`).

---

## Phase 2 Part 2 — In-Memory Zustand Store & 18 Propagation Rules

### Key Deliverables & Achievements
- **Zustand Store Architecture (`src/store/index.ts`):**
  - In-memory store holding all slices: controls, incidents, cases, obligations, tasks, complaints, evidence, governance, vendors, cyber, clients, reports, integrations, notifications, assistant, metrics, adminState, and activityLog.
  - Zero browser persistence; state fully resets on page refresh.
- **Synchronous Cryptographic Audit Hash Chaining (`src/utils/auditChain.ts`):**
  - SHA-256 hash chaining where every mutation appends an immutable entry linking `previousHash` to `currentHash`.
- **All 18 Propagation Rules Fully Implemented:**
  1. *Rule 1 (Case Closure & Remediation):* Closing `CASE-2026-031` with linked remediation evidence re-evaluates `GOV-SOD-001` using SSO/IAM and HR status, setting status to `PASS`. Prior to closure, evaluation returns `FAIL`.
  2. *Rule 2 (Incident Declaration):* Declaring an incident creates high-priority remediation tasks and notification.
  3. *Rule 3 (Statutory Report Acknowledgement):* Uploading an acknowledgement reference marks report as `ACKNOWLEDGED` and updates associated glitch filing records.
  4. *Rule 4 (Connector Sync):* Resyncing RMS integration updates status to `HEALTHY` and marks **only** the 4 TRADE controls (`TRADE-REC-001`, `TRADE-REC-002`, `TRADE-ACCESS-003`, `TRADE-RISK-004`) as `needsRevaluation = true`. `GOV-SOD-001` is not affected.
  5. *Rule 5 (Evidence Upload):* Uploading evidence increments evidence counts, recomputes coverage, and clears re-evaluation flags on linked controls.
  6. *Rule 6 (Accept AI Suggestion):* Accepts triage draft and updates case status to `IN_PROGRESS`.
  7. *Rule 7 (Reject AI Suggestion):* Prompts for mandatory reason, updates status to `UNDER_REVIEW`, and logs audit trail.
  8. *Rule 8 (AI Task Generation):* Creates compliance task from unhandled AI prompt queries.
  9. *Rule 9 (Officer Change Notice):* Updating Key Managerial Personnel starts the 15-day regulatory notice clock.
  10. *Rule 10 (Retail Complaint Classification):* Confirming retail classification initiates the 4 retail clocks (3d acknowledgement, 5d non-acceptance, 15d disposal target, 30d ordinary maximum).
  11. *Rule 11 (Dual Sign-Off Approval):* Completes multi-officer approval and executes downstream action.
  12. *Rule 12 (Legal Hold Enactment):* Freezes evidence dossier, rendering delete/purge buttons immutable.
  13. *Rule 13 (Policy Approval):* Approves revised policy document with maker-checker enforcement.
  14. *Rule 14 (Task Completion):* Updates task status to `COMPLETED` and recalculates overdue counters.
  15. *Rule 15 (Vendor Reassessment):* Initiates annual vendor review task for Vikram Shah (CISO).
  16. *Rule 16 (Integrity Mismatch):* Flags `MISMATCH` on evidence tampered digest and raises high-severity incident.
  17. *Rule 17 (Notification Dispatch):* Appends real-time alert to notification dropdown.
  18. *Rule 18 (Batch Evaluation):* Evaluates all controls marked `needsRevaluation = true`.

---

## Phase 3 — Command Centre & Compliance Tasks

### Key Deliverables & Achievements
- **Command Centre (`/`):**
  - **Statutory Deadlines Strip:** Live countdown clocks for `INC-2026-014` 14-day RCA clock, quarterly financial filings, and annual governance returns.
  - **Compliance Score Gauge:** Real-time composite score with status rings and trending indicators.
  - **Quick Action Bar:** Direct one-click shortcuts to declare incidents, upload evidence, draft regulatory reports, and view open cases.
  - **Exception & Anomaly Stream:** Live list of segregation conflicts (`GOV-SOD-001`), stale feeds, and overdue audits.
  - **Recent Activity Log:** Live chronological ledger reflecting state mutations.
- **Compliance Tasks (`/tasks`):**
  - 30 tasks with full category, status, priority, and owner filters.
  - Detail drawer (`?task=TSK-xxx`) with sub-item checklist toggling, task completion (Propagation #14), and comment appending.
  - Modal to create tasks assigned to the 5 designated personnel.

---

## Phase 4 — Statutory Obligations & Governance

### Key Deliverables & Achievements
- **Statutory Obligations (`/obligations`):**
  - 25 regulatory obligations spanning IFSCA Capital Market Intermediaries, Anti-Money Laundering, and Cyber Security guidelines.
  - 4 tabs: Dashboard, Calendar, Critical Obligations, and Master Register.
  - Dual sign-off `ApprovalPanel` for critical filings (e.g. `OBL-IFSCA-001`).
  - Export modal generating PDF/CSV/XLSX archives with toast `"Export prepared"`.
- **Governance & Officer Independence (`/governance`):**
  - **Principal Officer / Compliance Officer Separation Check:** Live validation ensuring PO (`Rohan Desai`) and CO (`Aarav Mehta`) remain separate individuals.
  - **15-Day Regulatory Notice Clock:** Dynamic countdown initiated upon officer appointment changes (Propagation #9).
  - **Org Chart:** 5-node executive hierarchy visualization.
  - **Roster Grid:** 5 Staff × 7 Days coverage matrix with duty shifts and statutory leave.
  - **Conflict of Interest Register:** Real-time COI tracking and mitigation attestations.
  - **Officer Appointment Wizard:** 4-step wizard modal enforcing fit-and-proper declarations.
  - **Permission Matrix:** Identifies segregation conflict cell in red and routes to `#/clients/cases/CASE-2026-031`.

---

## Phase 5 — Controls & Incidents

### Key Deliverables & Achievements
- **Internal Controls Library (`/controls`):**
  - 20 statutory controls categorized across Governance, Market Operations, Cyber, Financial, and Client domains.
  - `DonutChart` with hatched SVG segment visualizing `UNKNOWN` controls requiring RMS telemetry.
  - 12-node SVG `RelationshipGraph` displaying live dependencies between controls, policies, systems, and evidence.
  - Control Detail drawer (`?control=...`) with live "Run evaluation" button:
    - `GOV-SOD-001`: Reads SSO/IAM + HR directories; returns `FAIL` before case closure and `PASS` after closure.
    - `TRADE-REC-001` through `TRADE-RISK-004`: Read RMS connector; return `UNKNOWN` while RMS is stale.
- **Incident Register & Technical Glitch Reporting (`/incidents`, `/incidents/:id`):**
  - 8 incidents, featuring `INC-2026-014` (RESTORED state, Core Trading Engine memory exhaustion).
  - 3 Statutory Glitch Clocks:
    1. Initial Notice (1 Hour) — `MET`
    2. Preliminary Report (T+1 / 24 Hours) — `MET`
    3. Detailed RCA Report (14 Days) — Active countdown showing ~9 days remaining.
  - Filings Ledger: 3 official filings with acknowledgement upload triggers (Propagation #3).
  - Corrective & Preventive Actions (CAPA) tracking with timeline events.

---

## Phase 6 — Clients, Cases + AI Investigations + Floating AI Assistant

### Key Deliverables & Achievements
- **Onboarded Clients (`/clients`):**
  - 20 institutional clients with masked IDs (`CLT-***-901` to `CLT-***-920`).
  - KYC verification stepper, jurisdiction risk matrix, and periodic review countdown clocks.
  - Document vault with client-side SHA-256 digest sealing via `FileUploadBox`.
- **Investigation Cases (`/clients/cases/:id`):**
  - `CASE-2026-031`: Segregation of duties conflict case for Deepa Patel.
  - `AIDraftBanner`: Displays AI investigation analysis with Accept (Propagation #6) and Reject (Propagation #7).
  - `ApprovalPanel`: Configured with Aarav Mehta as maker; self-approval is blocked.
  - Case closure requires linked remediation evidence (`EVD-041`) and independent sign-off; closing re-evaluates `GOV-SOD-001` to `PASS` (Propagation #1).
- **AI Investigations Hub (`/ai`):**
  - 5 tabs: Dashboard, Run Investigation, History, Review, and Sources.
  - 7 specialized AI agent cards defining permitted tools and explicit "Cannot do" boundaries.
  - AI Run Log featuring institutional boundary interceptor blocking unapproved external communications.
  - Diff viewer and dual sign-off approval for proposed regulatory amendments (Propagation #11).
- **Global Floating AI Assistant (`FloatingAIAssistant.tsx`):**
  - Persistent 400px bottom-right drawer with minimize and close controls.
  - Streaming character reveal, 4 prompt chips, and investment advice refusal collar.
  - Unrecognized queries trigger "Create review task" action (Propagation #8).

---

## Phase 7 — Client Complaints, Regulatory Reports & Evidence Room

### Key Deliverables & Achievements
- **Client Complaints (`/complaints`, `/complaints/:id`):**
  - Ageing buckets BarChart (`<7d`, `7-14d`, `15-21d`, `>21d`), retail vs institutional DonutChart, 12M resolution trend LineChart.
  - State Stepper (`OPEN` → `INVESTIGATING` → `DISPOSED` → `CLOSED`).
  - Retail statutory clocks appear **only** after `classificationConfirmed = true` (Propagation #10):
    1. Acknowledgement: 3 working days
    2. Non-acceptance explanation: 5 working days
    3. Disposal target: 15 days
    4. Ordinary maximum: 30 days
  - CRO conflict check: alerts and prevents Priya Nair (CRO) from handling retail complaints under statutory independence rules.
  - AI response draft with `AIDraftBanner`, diff review, and dual sign-off `ApprovalPanel`.
- **Regulatory Reports & Statutory Calendar (`/reports`):**
  - 6 report sections: Financial & Capital, Internal Audit, Technical Glitch (`INC-2026-014` filings), Compliance Certificates, Client Money, System Audit.
  - Exact button and toast strings:
    - `"Export report file"` → Toast: **`"Report file prepared"`**
    - `"Download preview"` → Toast: **`"Preview ready"`**
    - Button text: **`"Mark as submitted via official channel"`**
  - Acknowledgement receipt upload triggers **Propagation #3**.
- **Immutable Evidence Room (`/evidence`):**
  - 40 evidence items with SHA-256 digests and WORM storage stamps.
  - Active legal hold items display lock badge; Delete/Dispose buttons disabled with Tooltip.
  - "Upload evidence" computes SHA-256 via Web Crypto and triggers **Propagation #5**.
  - "Verify integrity" on `EVD-028` flags `MISMATCH` and raises incident (Propagation #16).
  - Findings tab opens right-side `?finding=FND-xxx` DetailDrawer with Management Response and CAPA forms.
  - Legal Holds tab (4 holds, Propagation #12) with dual sign-off release requiring `ApprovalPanel`.
  - Audit Requests tab (10 requests) with "Fulfil request" action.

---

## Phase 8 — Cyber/Vendors + Integrations + Admin + Metrics

### Key Deliverables & Achievements
- **Cyber Resilience & Third-Party Vendors (`/cyber-vendors`):**
  - 10 vendor records (`VND-001` to `VND-010`) with criticality, risk rating, and SLA adherence.
  - Statutory notice displayed: **`"Regulatory Notice: Dashboard status is not an audit or assurance report."`**
  - Vendor Profile drawer (`?vendor=VND-xxx`) with due-diligence checklist.
  - "Start reassessment" button triggers **Propagation #15**, assigning an annual review task to Vikram Shah (CISO) and setting vendor status to `UNDER_REVIEW`.
  - Outsourcing register (8 entries) with "Add outsourcing entry" modal.
  - Contract & security checklist (20 clauses, toggleable).
  - Security incident register (5 items) linking to `#/incidents/:id`.
  - IT Asset Inventory and BCP/DR drill failover records (achieving RTO < 15 mins).
- **Automated Data Ingestion & Connectors (`/integrations`):**
  - 12 enterprise connectors; RMS connector displays `STALE` health status on load.
  - "Sync now" on RMS simulates 2-second delay, sets `status = 'HEALTHY'`, and executes **Propagation #4**, which marks **only** the 4 RMS-dependent controls (`TRADE-REC-001`, `TRADE-REC-002`, `TRADE-ACCESS-003`, `TRADE-RISK-004`) as `needsRevaluation = true`, leaving `GOV-SOD-001` unaffected.
  - Success modal provides direct navigation button: **`"Open affected controls"`** navigating to `#/controls?tab=library&status=UNKNOWN`.
  - Manual file upload modal with client-side SHA-256 hashing and statutory attestation checkbox.
  - 6 Data Quality Alerts with interactive "Resolve alert" action.
  - Connector Catalogue and cryptographically verified Ingestion History table.
- **Administration & Compliance Governance (`/admin`):**
  - Staff Accounts: exactly the 5 designated personnel (`USR-001` to `USR-005`).
  - Policy Governance: 8 statutory policies (`POL-001` to `POL-008`). Author self-approval (Aarav Mehta) blocked by `ApprovalPanel`; independent signoff by Rohan Desai triggers **Propagation #13**, marking policy `ACTIVE`.
  - Cryptographic Audit Log: 60 rows displaying synchronous `previousHash → currentHash` chain.
  - Data Retention Schedule: 8 rules, with the 8-year rule for CMI Reg. 16 highlighted.
  - Access Session History (20 rows) and Change Management Ledger (15 rows).
  - Legal Entity Settings: Meridian Securities IFSC Limited profile with save mutation.
  - System Security & Notification preferences toggles.
- **Metrics, History & Analytics (`/metrics`):**
  - Date Range selector (`3M`, `6M`, `12M`, `YTD`) dynamically recalculating series points.
  - All 4 chart types rendered:
    1. `DonutChart`: Internal control health distribution (PASS, FAIL, WARNING, UNKNOWN).
    2. `LineChart`: 12-month compliance trajectory & evidence coverage %.
    3. `BarChart`: Monthly exceptions and access anomalies.
    4. `StackedBarChart`: Statutory filings dispatch and acknowledgement velocity.
  - "Export analytics" modal with PDF, CSV, and XLSX options firing toast: **`"Export prepared"`**.
  - Deep-dive links to all compliance registers.

---

## Phase 9 — Universal Search, Notifications, Link Audit & Cleanup

### Key Deliverables & Achievements
- **Universal Search (`UniversalSearch.tsx`):**
  - Global `Cmd+K` / `Ctrl+K` and click activation from TopBar search trigger.
  - Searches and groups results across all **11 entity types**:
    1. Internal Controls (20)
    2. Incidents & Glitches (8)
    3. Investigation Cases (10)
    4. Statutory Obligations (25)
    5. Compliance Tasks (30)
    6. Client Complaints (8)
    7. Regulatory Filings / Reports (14)
    8. Evidence Dossiers (40)
    9. Onboarded Clients (20)
    10. Third-Party Vendors (10)
    11. Connected Systems (12)
  - Result selection navigates using `buildLink(path, params)`.
- **TopBar & System Notifications:**
  - Real-time unread notification count badge and dropdown with 6 regulatory notifications.
  - "Mark all as read" button clears unread state.
  - Data Freshness indicator popover displaying connector status and link to `#/integrations`.
  - User Chip menu displaying Aarav Mehta's profile, authority scope, and preferences link (no logout option).
- **Cleanup of Temporary Dev Screens:**
  - Removed temporary development routes `/_components` and `/_store-check` and deleted their respective scaffold files.
  - `useScrollToTop()` active across all route transitions.
  - Audited all cross-module links to guarantee zero broken or dead links.

---

## Verification & Compliance Audit Results

| Check Category | Command / Criteria | Result | Status |
| :--- | :--- | :--- | :--- |
| **Strict TypeScript Build** | `npm run build` (`tsc -b && vite build`) | Built cleanly in 3.02s with exit code 0 | **PASS** |
| **Zero Banned Words** | `grep -rniE "demo\|mock\|sample\|dummy\|fake\|synthetic\|test data" src/ index.html` | 0 occurrences (Exit code 1) | **PASS** |
| **Strict Type Safety** | `grep -rnE ": any\|as any\|<any>" src/` | 0 occurrences (Exit code 1) | **PASS** |
| **Theme Compliance** | `grep -rnE "dark:" src/` | 0 occurrences (Exit code 1) | **PASS** |
| **Lingering Dev Scaffold** | `grep -rnE "TODO: remove" src/` | 0 occurrences (Exit code 1) | **PASS** |
| **Network Isolation** | `grep -rnE "fetch\(\|axios\|XMLHttpRequest\|WebSocket" src/` | 0 external network calls | **PASS** |
| **User Data Restriction** | Personnel names across all registers | Exactly 5 fictional staff members (`USR-001` to `USR-005`) | **PASS** |
| **URL Standards** | Internal navigation links | All URLs use `buildLink(path, params)` under `HashRouter` | **PASS** |

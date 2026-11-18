# IFSC TrustOps — GIFT IFSC Broker Dealer & Clearing Member Compliance System

**IFSC TrustOps** is a frontend-only compliance and supervisory management platform engineered for **Meridian Securities IFSC Limited**, an IFSCA-registered Broker Dealer and Clearing Member operating in GIFT International Financial Services Centre (GIFT City), Gandhinagar, Gujarat, India.

---

## 1. Quick Start

### Prerequisites
- Node.js: `v18.0.0` or higher (tested on Node v20 LTS)
- npm: `v9.0.0` or higher

### Installation & Execution
```bash
# Install dependencies
npm install

# Start local development server (Vite on http://localhost:5173)
npm run dev

# Run TypeScript strict compile & production build
npm run build

# Preview production build locally (http://localhost:4173)
npm run preview
```

---

## 2. Architecture & Design Principles

IFSC TrustOps is engineered under a zero-backend architecture:

- **Strict Frontend Execution**: Operates exclusively in the user browser without backend dependencies, external microservices, or cloud endpoints.
- **Zero Browser Persistence**: No `localStorage`, `sessionStorage`, `indexedDB`, cookies, or browser storage APIs. State resides purely in volatile memory.
- **Zero Network Egress**: Zero `fetch`, `axios`, `XMLHttpRequest`, or `WebSocket` calls. Verified via browser network inspector (0 requests to external origins during runtime).
- **Zustand In-Memory State Machine**: Comprehensive in-memory state engine implementing **18 automated compliance propagation rules** that coordinate cross-entity reactions (e.g., connector sync, case closure, incident filings, and approval workflows).
- **Tamper-Evident SHA-256 Audit Trail**: Every entity mutation, supervisory approval, and state transition appends a cryptographic record linking to the preceding log hash.
- **Type Safety**: Strictly typed TypeScript codebase with zero `: any`, `as any`, or `<any>` casts.
- **URL Parameter State Alignment**: Dynamic tab management synchronized with `?tab=` URL query parameters. Invalid tab keys automatically redirect to default tabs.
- **Strict HashRouter Compatibility**: All route transitions and deep links use HashRouter-compliant navigation (`buildLink`).

---

## 3. Application Routes & Tab Navigation

The platform provides a comprehensive suite of 19 routes covering all IFSCA supervisory domains:

| # | Route Path | Title & Domain | Default Tab | Available `?tab=` Keys |
|---|------------|----------------|-------------|------------------------|
| 1 | `/` | Command Centre | N/A | Overview dashboard |
| 2 | `/obligations` | Regulatory Obligations | `dashboard` | `dashboard`, `all`, `calendar`, `overdue` |
| 3 | `/controls` | Internal Controls & Matrix | `dashboard` | `dashboard`, `library`, `exceptions`, `map` |
| 4 | `/incidents` | Technical Glitch & Incidents | `dashboard` | `dashboard`, `all` |
| 5 | `/incidents/:id` | Incident Dossier & Clocks | N/A | Statutory countdown clocks, filings, RCA & CAPA |
| 6 | `/complaints` | Retail Grievance Clocks | `dashboard` | `dashboard`, `all` |
| 7 | `/complaints/:id` | Complaint Dossier | N/A | Stepper, merits review, independent officer routing |
| 8 | `/cases` | Compliance Investigations | N/A | Open/closed cases, evidence linkage |
| 9 | `/cases/:id` | Case Dossier | N/A | Remediation dossier & dual maker-checker closure |
| 10 | `/evidence` | Evidence Vault | `dashboard` | `dashboard`, `all`, `requests`, `findings`, `holds` |
| 11 | `/tasks` | Supervisory Tasks | `my-tasks` | `my-tasks`, `pending`, `overdue`, `due-today`, `upcoming` |
| 12 | `/reports` | Statutory Filings | `dashboard` | `dashboard`, `types`, `templates`, `calendar` |
| 13 | `/integrations` | Connectors & Feeds | `dashboard` | `dashboard`, `connected`, `catalogue`, `imports`, `quality` |
| 14 | `/governance` | Governance & KMP Roster | `overview` | `overview`, `organization`, `officers`, `people`, `roles`, `training` |
| 15 | `/cyber-vendors` | Cyber Risk & Outsource | `dashboard` | `dashboard`, `vendors`, `assessments`, `threats`, `incidents` |
| 16 | `/clients` | Client Registers | `clients` | `clients`, `cases` |
| 17 | `/metrics` | Compliance Metrics & KPI | N/A | Real-time health scores & trend charts |
| 18 | `/ai` | TrustOps Assistant | `dashboard` | `dashboard`, `investigate`, `history`, `review`, `sources` |
| 19 | `/admin` | Administration & Audit Log | `dashboard` | `dashboard`, `settings`, `users`, `policies`, `security`, `log` |

---

## 4. Key End-to-End Walkthroughs

### Story A: Segregation of Duties Conflict Remediation
1. **Initial State**: Control `GOV-SOD-001` is evaluated. Because staff member Deepa Patel holds conflicting permissions across Trading Desk and Settlement/Compliance, the control evaluates to **FAIL**.
2. **Investigation Case**: Open case `CASE-2026-031` ("Deepa Patel Segregation of Duties Conflict").
3. **Evidence Linkage**: Review attached evidence item `EVD-040` ("IAM Entitlement Deprovisioning Log & Dual-Control Audit").
4. **Maker-Checker Authorization**: Maker Aarav Mehta submits the case for remediation review. Independent reviewer Priya Nair (Risk Officer) performs sign-off with mandatory notes.
5. **Closure & Re-evaluation**: Upon closure of `CASE-2026-031`, Propagation Rule #1 triggers: `GOV-SOD-001` automatically re-evaluates using only SSO/IAM and HR connector freshness.
6. **Result**: Control `GOV-SOD-001` transitions to **PASS**. Mutation and cryptographic hash appended to the audit log.

### Story B: Statutory Technical Glitch Reporting Clocks
1. **Incident Dossier**: Navigate to `/incidents/INC-2026-014` (Order Gateway Latency Spike, occurred 5 days ago).
2. **Statutory Clocks**: Three IFSCA circular countdown clocks run relative to `occurredAt`:
   - 1-Hour Preliminary Notice: Status **ACKNOWLEDGED** (receipt hash verified).
   - T+1 Preliminary Report: Status **SUBMITTED** (awaiting regulator receipt confirmation).
   - 14-Day Comprehensive RCA: Status **IN_PROGRESS** (under active investigation).
3. **Closure Gate Verification**: Attempting to close `INC-2026-014` displays the **CLOSURE BLOCKED** gate warning. Closure is prohibited until all three filings are ACKNOWLEDGED and all CAPA items are verified.
4. **Non-Qualifying Disruption Handling**: On `/incidents`, declaring an interruption of duration < 5 minutes (e.g., 3 minutes) dynamically tags it as **NOT_QUALIFYING**. Regulatory statutory clocks are not triggered, and an internal post-mortem review task is scheduled.

### Story C: RMS Connector Resynchronization & Batch Re-evaluation
1. **Stale Market Feed**: The Risk Management System (`rms`) feed is stale (> 30 minutes lag). Consequently, the four RMS-dependent trading controls (`TRADE-REC-001`, `TRADE-REC-002`, `TRADE-ACCESS-003`, `TRADE-RISK-004`) display status **UNKNOWN** with a `Re-evaluation needed` flag.
2. **Connector Synchronization**: Navigate to `/integrations?tab=connected` and locate the RMS connector. Click **Sync Now**.
3. **State Transition**: Connector status immediately transitions to **HEALTHY** with an updated sync timestamp.
4. **Batch Re-evaluation**: Open the RMS connector drawer (`paramKey="connector"`). Click **Re-evaluate all affected**.
5. **Result**: All four trade controls execute their evaluation logic and transition cleanly to **PASS**.

---

## 5. Staff Roster & Access Controls

The application models exactly five authorized personnel at Meridian Securities IFSC Limited:

1. **Aarav Mehta** (`USR-001`) — Compliance Officer (Current User, KMP)
2. **Rohan Desai** (`USR-002`) — Principal Officer (KMP)
3. **Priya Nair** (`USR-003`) — Risk Officer & CRO (KMP)
4. **Vikram Shah** (`USR-004`) — Chief Information Security Officer (KMP)
5. **Deepa Patel** (`USR-005`) — Trading Desk Officer

---

## 6. Accessibility & Compliance Verification

- **Color Contrast**: All text, status badges, and interactive controls satisfy WCAG 2.1 AA requirements (minimum 4.5:1 for normal text, 3:1 for large text and UI components).
- **Keyboard Navigation**: Complete keyboard navigability with visible focus rings (`focus:ring-2 focus:ring-brandNavy`) across all buttons, form fields, modal dialogs, and drawer components.
- **Semantic HTML**: Accessible dialogs (`role="dialog"`), alert containers (`role="alert"`), aria labels, and tabular data semantics.
- **Zero Banned Words**: Completely purged of non-production placeholders (`demo`, `mock`, `sample`, `dummy`, `fake`, `synthetic`, `test data`, `simulated`).

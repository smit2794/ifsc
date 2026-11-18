// src/data/aiResponses.data.ts
import { ScriptedAIResponseItem, AIAgentCardItem, PromptChipItem } from '../types/ai';

export const SEED_AI_RESPONSES: ScriptedAIResponseItem[] = [
  {
    id: 'AI-RESP-001',
    triggerKeywords: ['sod', 'gov-sod-001', 'conflict', 'separation', 'deepa'],
    intent: 'INVESTIGATE_SOD_CONFLICT',
    headline: 'Control GOV-SOD-001 Separation of Duties Conflict Analysis',
    responseMarkdown: `### Investigation Finding: GOV-SOD-001 Exception
**Root Cause Identified:** Okta IAM directory groups indicate that **Deepa Patel (USR-005, Trading Desk Officer)** holds an active membership in the \`IAM-GRP-COMPLIANCE-REVIEW\` group.

Under **IFSCA (Capital Market Intermediaries) Regulations, 2021 (Reg. 9)**, trading execution personnel are strictly prohibited from possessing compliance sign-off or oversight privileges.

**Recommended Remediation:**
1. Execute immediate de-provisioning of \`IAM-GRP-COMPLIANCE-REVIEW\` for user Deepa Patel in the Okta IAM connector.
2. Confirm that zero compliance sign-offs were executed using this role via cryptographic audit log review.
3. Link the sealed remediation attestation to **CASE-2026-031** to re-evaluate GOV-SOD-001 back to **PASS**.`,
    confidenceScore: 96,
    citations: [
      { code: 'S2', clause: 'IFSCA CMI Reg. 9', title: 'Separation of Principal Officer and Compliance Officer Appointments' },
      { code: 'S2', clause: 'Schedule III Code of Conduct', title: 'Chinese Walls & Information Barriers' },
    ],
    suggestedActions: [
      { label: 'Inspect CASE-2026-031', targetType: 'CASES', targetId: 'CASE-2026-031' },
      { label: 'View Control GOV-SOD-001', targetType: 'CONTROLS', targetId: 'GOV-SOD-001', targetParams: { control: 'GOV-SOD-001' } },
    ],
  },
  {
    id: 'AI-RESP-002',
    triggerKeywords: ['glitch', 'inc-2026-014', 'outage', 'technical glitch', 'clock'],
    intent: 'INVESTIGATE_TECHNICAL_GLITCH',
    headline: 'INC-2026-014 Technical Glitch Clocks and Statutory Deadlines',
    responseMarkdown: `### Incident Status: INC-2026-014 (7-Minute FIX Gateway Outage)
**Regulatory Threshold Evaluation:** An unplanned trading system interruption of **7 minutes** exceeded the 5-minute qualifying threshold under the **IFSCA Technical Glitch Circular 2024**.

**Mandatory Statutory Clock Progress:**
- **1-Hour Notice:** MET (Filed at 10:38 IST; Acknowledgment Ref: \`IFSCA/ACK/GLT/2026/014-N1\`).
- **T+1 Preliminary Report:** MET (Filed at T+18 hours; Acknowledgment Ref: \`IFSCA/ACK/GLT/2026/014-R1\`).
- **14-Day Comprehensive RCA Report:** RUNNING (Approx. 9 days remaining).

*Product boundary note: TrustOps prepares and seals draft filings; formal regulatory submission must be executed by designated officers via official portal channels.*`,
    confidenceScore: 98,
    citations: [
      { code: 'S7', clause: 'Section 3.1 & 3.3', title: 'IFSCA Technical Glitch and System Downtime Reporting Circular' },
    ],
    suggestedActions: [
      { label: 'Open Incident INC-2026-014', targetType: 'INCIDENTS', targetId: 'INC-2026-014' },
      { label: 'View Glitch RCA Draft Report', targetType: 'REPORTS', targetId: 'RPT-2026-GLT-03', targetParams: { report: 'RPT-2026-GLT-03' } },
    ],
  },
  {
    id: 'AI-RESP-003',
    triggerKeywords: ['rms', 'trade-rec-001', 'stale', 'reconciliation'],
    intent: 'RMS_STALE_DIAGNOSTIC',
    headline: 'RMS Connector Stale Status & Downstream Control Dependencies',
    responseMarkdown: `### Telemetry Analysis: RMS Connector Disconnected
**Connector State:** The **Real-Time Risk Management System (RMS)** connector transitioned to **STALE** because its mTLS streaming heartbeat timed out 48 hours ago.

**Downstream Impact:**
The following 4 market operations controls depend on the RMS continuous feed and are currently evaluated as **UNKNOWN**:
1. \`TRADE-REC-001\` (Daily Trade Ledger Execution Reconciliation)
2. \`TRADE-REC-002\` (Client Margin Utilization & Collateral Haircut)
3. \`TRADE-ACCESS-003\` (DMA Algorithm Kill-Switch Readiness)
4. \`TRADE-RISK-004\` (Pre-Trade Single-Order Filtering)

**Resolution Steps:** CISO Vikram Shah is renewing the expired staging mTLS certificate. Once reconnected, clicking "Sync Now" will automatically restore continuous telemetry.`,
    confidenceScore: 94,
    citations: [
      { code: 'S4', clause: 'INX Rule 4.2', title: 'Exchange Trade Confirmation Telemetry' },
    ],
    suggestedActions: [
      { label: 'Inspect RMS Connector', targetType: 'INTEGRATIONS', targetId: 'rms', targetParams: { connector: 'rms' } },
      { label: 'View Controls Map', targetType: 'CONTROLS', targetParams: { tab: 'map' } },
    ],
  },
  {
    id: 'AI-RESP-004',
    triggerKeywords: ['net-worth', 'capital', 'fin-cap-001', 'bmc'],
    intent: 'CAPITAL_ADEQUACY_CHECK',
    headline: 'Base Minimum Capital & Net-Worth Compliance Standing',
    responseMarkdown: `### Capital Maintenance Summary: Meridian Securities IFSC
**Statutory Requirement:** Maintain an unencumbered liquid net worth of at least **USD 3,000,000** in GIFT IFSC.

**Current Financial Standing:**
- **Current Net Worth:** USD 4,820,000 (1.61x minimum threshold).
- **Base Minimum Capital (BMC):** 100% compliant and unencumbered.
- **Client Monies Segregation:** 100% balanced with zero deficit in trust escrow.`,
    confidenceScore: 97,
    citations: [
      { code: 'S1', clause: 'Section 4.1', title: 'IFSCA Capital Adequacy and Financial Resource Guidelines' },
    ],
    suggestedActions: [
      { label: 'View Control FIN-CAP-001', targetType: 'CONTROLS', targetId: 'FIN-CAP-001', targetParams: { control: 'FIN-CAP-001' } },
      { label: 'Review Capital Obligation OBL-008', targetType: 'OBLIGATIONS', targetId: 'OBL-008', targetParams: { obligation: 'OBL-008' } },
    ],
  },
  {
    id: 'AI-RESP-005',
    triggerKeywords: ['annual audit', 'compliance audit', 'nextsep30', 'deloitte'],
    intent: 'ANNUAL_AUDIT_SCHEDULE',
    headline: 'Annual Compliance Audit Schedule and Status',
    responseMarkdown: `### Statutory Assurance Schedule: Annual Compliance Audit
- **Previous FY 2024-25 Audit:** Completed by Deloitte Touche Tohmatsu India LLP; **ACKNOWLEDGED** by IFSCA on 12 Sep 2025.
- **Current FY 2025-26 Audit Due Date:** Computed dynamically as **30 September** of the current fiscal cycle.
- **Assurance Scope:** Operational governance, segregation of duties, client fund trust balances, algorithmic controls, and record retention compliance.`,
    confidenceScore: 95,
    citations: [
      { code: 'S2', clause: 'IFSCA CMI Reg. 22', title: 'Annual Compliance Audit by Independent Qualified Auditor' },
    ],
    suggestedActions: [
      { label: 'View Annual Audit Obligation OBL-003', targetType: 'OBLIGATIONS', targetId: 'OBL-003', targetParams: { obligation: 'OBL-003' } },
      { label: 'Inspect Sealed FY25 Audit Evidence', targetType: 'EVIDENCE', targetId: 'EVD-003', targetParams: { evidence: 'EVD-003' } },
    ],
  },
  {
    id: 'AI-RESP-006',
    triggerKeywords: ['retention', 'worm', '8 years', 'records', 'evd-038'],
    intent: 'RECORD_RETENTION_QUERY',
    headline: '8-Year WORM Storage Mandate and Hash Verification',
    responseMarkdown: `### Statutory Record Retention Framework: CMI Reg. 16
**Mandate:** All trade logs, orders, algorithmic executions, and customer communications must be preserved for an immutable minimum period of **8 years**.

**Vault Integrity Status:**
- Total evidence items sealed: **40 items**.
- Hash status: 39 items **VERIFIED**, 1 item flagged with **MISMATCH** (\`EVD-038\`, isolated under Legal Hold \`LH-2026-003\`).`,
    confidenceScore: 93,
    citations: [
      { code: 'S3', clause: 'Reg. 16', title: 'IFSCA Record Retention and Storage Mandate Regulations' },
    ],
    suggestedActions: [
      { label: 'Inspect Evidence Vault', targetType: 'EVIDENCE' },
      { label: 'View Mismatch Item EVD-038', targetType: 'EVIDENCE', targetId: 'EVD-038', targetParams: { evidence: 'EVD-038' } },
    ],
  },
  {
    id: 'AI-RESP-007',
    triggerKeywords: ['officer change', '15 days', 'kmp', 'appointment', 'resignation'],
    intent: 'OFFICER_CHANGE_RULES',
    headline: 'Statutory 15-Day KMP Notification Requirements',
    responseMarkdown: `### Governance Obligation: KMP & Designated Director Changes
Under **IFSCA General Clauses Reg. 14**, the Broker Dealer must notify the Authority within **15 calendar days** of:
1. Appointment or resignation of Principal Officer (Rohan Desai)
2. Appointment or resignation of Compliance Officer (Aarav Mehta)
3. Appointment or role change of any Key Management Personnel (Priya Nair, Vikram Shah)

*Note: Dual maker-checker sign-off (requiredSignoffs=2) is mandatory for filing submission packages.*`,
    confidenceScore: 96,
    citations: [
      { code: 'S2', clause: 'Reg. 14', title: 'IFSCA General Clauses Notice of Change' },
    ],
    suggestedActions: [
      { label: 'View Obligation OBL-002', targetType: 'OBLIGATIONS', targetId: 'OBL-002', targetParams: { obligation: 'OBL-002' } },
      { label: 'Inspect KMP Roster in Governance', targetType: 'GOVERNANCE', targetParams: { tab: 'officers' } },
    ],
  },
  {
    id: 'AI-RESP-008',
    triggerKeywords: ['mfa', 'cyber', 'security', 'cert-in'],
    intent: 'CYBER_SECURITY_FRAMEWORK',
    headline: 'Cyber Security Controls and Incident Escalation Protocols',
    responseMarkdown: `### Cyber Resilience Baseline: IFSCA & CERT-In Framework
**Key Controls Implemented:**
- **MFA Enforcement:** 100% of the 5 institutional staff accounts enrolled in hardware token / WebAuthn MFA.
- **Incident Escalation:** Mandatory reporting to CERT-In within **6 hours** for qualifying cyber security events.
- **Penetration Testing:** Empanelled external penetration testing executed quarterly with zero open Critical/High vulnerabilities.`,
    confidenceScore: 95,
    citations: [
      { code: 'S8', clause: 'Section 4 & 12', title: 'Cyber Security and Cyber Resilience Framework for Intermediaries' },
    ],
    suggestedActions: [
      { label: 'Open Cyber & Vendors Dashboard', targetType: 'CYBER_VENDORS' },
      { label: 'View Control CYB-MFA-001', targetType: 'CONTROLS', targetId: 'CYB-MFA-001', targetParams: { control: 'CYB-MFA-001' } },
    ],
  },
  {
    id: 'AI-RESP-009',
    triggerKeywords: ['complaint', 'grievance', 'sla', 'investor'],
    intent: 'COMPLAINT_DISPOSAL_SLA',
    headline: 'Investor Grievance Redressal SLA and Escalation Standing',
    responseMarkdown: `### Investor Protection Protocol: 30-Day Disposal SLA
- Total active complaints: **15 complaints** (11 institutional, 4 accredited retail).
- **SLA at Risk:** 3 complaints approaching 30-day regulatory boundary (\`CMP-2026-001\`, \`CMP-2026-002\`, \`CMP-2026-005\`).
- Compliance Officer Aarav Mehta has escalated \`CMP-2026-005\` directly to Principal Officer Rohan Desai.`,
    confidenceScore: 94,
    citations: [
      { code: 'S10', clause: 'Clause 8', title: 'Conduct of Business Rules and Investor Protection Norms' },
    ],
    suggestedActions: [
      { label: 'Open Complaints Dashboard', targetType: 'COMPLAINTS' },
      { label: 'Inspect Escalated Case CMP-2026-005', targetType: 'COMPLAINTS', targetId: 'CMP-2026-005' },
    ],
  },
  {
    id: 'AI-RESP-010',
    triggerKeywords: ['bcp', 'disaster recovery', 'rto', 'rpo'],
    intent: 'BCP_RESILIENCE_STATUS',
    headline: 'Business Continuity and Disaster Recovery Standing',
    responseMarkdown: `### Disaster Recovery Readiness: Tier 1 Systems
- **Recovery Time Objective (RTO):** Regulatory floor < 15 minutes. Most recent achieved drill: **8 minutes 42 seconds**.
- **Recovery Point Objective (RPO):** Zero transaction data loss via synchronous leased line replication.
- **Next Scheduled Drill:** Q4 comprehensive exchange contingency trading session.`,
    confidenceScore: 96,
    citations: [
      { code: 'S6', clause: 'Section 5', title: 'Market Infrastructure Institutions and Intermediary Resilience Framework' },
    ],
    suggestedActions: [
      { label: 'View BCP Records in Cyber Dashboard', targetType: 'CYBER_VENDORS', targetParams: { tab: 'bcp' } },
      { label: 'Inspect Control OPS-BCP-002', targetType: 'CONTROLS', targetId: 'OPS-BCP-002', targetParams: { control: 'OPS-BCP-002' } },
    ],
  },
  {
    id: 'AI-RESP-011',
    triggerKeywords: ['proposal', 'regulation change', 'amendment', 'cmi reg 9(2)'],
    intent: 'REGULATION_CHANGE_PROPOSAL',
    headline: 'Regulation Change Proposal: CMI Reg. 9(2) Filing Acceleration',
    responseMarkdown: `### Regulatory Change Tracker: PROP-CMI-9(2)
- **Proposed Amendment:** Shortens quarterly compliance assurance filing window from **21 days** to **15 calendar days** from quarter close.
- **Current Stage:** \`CO_APPROVED\` (Approved by Compliance Officer Aarav Mehta; awaiting Board attestation by Principal Officer Rohan Desai).
- **Operational Readiness:** Systems require automated pre-filing balance validation scripts to meet 15-day turnaround.`,
    confidenceScore: 95,
    citations: [
      { code: 'S2', clause: 'Proposal PROP-2026-001', title: 'IFSCA CMI Reg. 9(2) Amendment Docket' },
    ],
    suggestedActions: [
      { label: 'Review Proposal in AI Workspace', targetType: 'AI', targetParams: { tab: 'review' } },
      { label: 'View Governance Overview', targetType: 'GOVERNANCE' },
    ],
  },
  {
    id: 'AI-RESP-012',
    triggerKeywords: ['product boundary', 'what is trustops', 'regulator portal', 'submit'],
    intent: 'PRODUCT_BOUNDARY_STATEMENT',
    headline: 'IFSC TrustOps: Operational Boundary & Regulatory Role',
    responseMarkdown: `### Product Boundary Statement: IFSC TrustOps
**IFSC TrustOps** is an institution-side governance, operations, controls, and regulatory-assurance workspace built specifically for Meridian Securities IFSC Limited.

**Key Operating Principles:**
- **Institution-Side Workspace:** TrustOps detects control failures, monitors reporting clocks, and seals audit-ready evidence with SHA-256 hashes.
- **Not an Exchange or Regulator Portal:** TrustOps never submits statutory filings to IFSCA or exchanges autonomously.
- **Human-in-the-Loop Governance:** AI drafts and investigates only; qualified human officers approve every regulatory decision and sign-off.`,
    confidenceScore: 99,
    citations: [
      { code: 'S2', clause: 'Governance Preamble', title: 'Internal Controls of Capital Market Intermediaries' },
    ],
    suggestedActions: [
      { label: 'Go to Command Centre', targetType: 'COMMAND_CENTRE' },
      { label: 'View Governance Overview', targetType: 'GOVERNANCE' },
    ],
  },
];

export const SEED_AI_AGENTS: AIAgentCardItem[] = [
  { id: 'AGT-01', name: 'Regulatory Clock Monitor Agent', specialization: 'Reporting Deadlines & Glitch Timers', domain: 'Market Operations', status: 'ACTIVE', confidenceThreshold: 95, description: 'Monitors 1-hour notices, T+1 filings, and 14-day RCA clocks with automatic escalation.', verifiedOutputsCount: 248 },
  { id: 'AGT-02', name: 'Segregation of Duties (SoD) Inspector', specialization: 'Role Overlap & Conflict Detection', domain: 'Governance', status: 'ACTIVE', confidenceThreshold: 92, description: 'Cross-checks IAM group memberships against KMP rosters to identify conflicting permissions.', verifiedOutputsCount: 182 },
  { id: 'AGT-03', name: 'Evidence Vault Integrity Seal Validator', specialization: 'SHA-256 Cryptographic Hash Auditing', domain: 'Evidence & Audit', status: 'ACTIVE', confidenceThreshold: 98, description: 'Runs background WORM storage verification and detects document checksum discrepancies.', verifiedOutputsCount: 410 },
  { id: 'AGT-04', name: 'FATF Watchlist Differential Screener', specialization: 'PEP & Sanctions Alert Triaging', domain: 'Client & AML', status: 'ACTIVE', confidenceThreshold: 90, description: 'Flags high-velocity watchlist updates and structures compliance override review workpapers.', verifiedOutputsCount: 135 },
  { id: 'AGT-05', name: 'Exchange Reconciliation Drift Analyzer', specialization: 'Trade & Margin Ledger Discrepancies', domain: 'Market Operations', status: 'ACTIVE', confidenceThreshold: 94, description: 'Identifies execution time slippage and collateral haircut shortfalls against clearing logs.', verifiedOutputsCount: 290 },
  { id: 'AGT-06', name: 'Cloud Vendor Due Diligence Evaluator', specialization: 'SOC-2 Type II Sub-Service Analysis', domain: 'Cyber & Vendor Risk', status: 'ACTIVE', confidenceThreshold: 88, description: 'Extracts critical vendor audit findings and highlights expiring reassessment windows.', verifiedOutputsCount: 94 },
  { id: 'AGT-07', name: 'Regulatory Change Impact Modeler', specialization: 'Circular Amendments & Clause Diffs', domain: 'Governance', status: 'ACTIVE', confidenceThreshold: 91, description: 'Parses draft circulars and generates side-by-side impact assessments for compliance officers.', verifiedOutputsCount: 78 },
];

export const SEED_PROMPT_CHIPS: PromptChipItem[] = [
  { id: 'CHIP-01', label: 'Investigate GOV-SOD-001 Conflict', query: 'Why did control GOV-SOD-001 fail and how can it be remediated?', category: 'CONTROL_GAP' },
  { id: 'CHIP-02', label: 'Check INC-2026-014 Glitch Clocks', query: 'What is the current status of the 14-day RCA clock for INC-2026-014?', category: 'INCIDENT_TRIAGE' },
  { id: 'CHIP-03', label: 'Explain RMS Connector Stale State', query: 'Why is the RMS connector stale and what controls are affected?', category: 'INVESTIGATION' },
  { id: 'CHIP-04', label: 'Review Annual Compliance Audit Due Date', query: 'When is the next annual compliance audit due and what are the requirements?', category: 'REGULATORY_QUERY' },
];

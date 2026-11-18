// src/store/index.ts
import { create } from 'zustand';
import {
  UserProfile,
  StaffName,
  ControlItem,
  IncidentItem,
  CaseItem,
  ObligationItem,
  TaskItem,
  ComplaintItem,
  EvidenceItem,
  AuditRequestItem,
  AuditFindingItem,
  LegalHoldItem,
  VendorItem,
  ClientItem,
  KYCStatus,
  ReportInstanceItem,
  ReportTemplateItem,
  ConnectedSystemItem,
  ConnectorCatalogueEntry,
  ImportHistoryItem,
  DataQualityAlertItem,
  NotificationItem,
  ScriptedAIResponseItem,
  AIAgentCardItem,
  PromptChipItem,
  RegulationSourceItem,
  RegulationChangeProposalItem,
  ApprovalRecord,
  MonthlyMetricSeriesPoint,
  AdminUserItem,
  PolicyDocumentItem,
  AuditLogRow,
  RetentionRuleItem,
  SecuritySettingConfig,
  NotificationSettingConfig,
  AccessHistoryRow,
  ChangeApprovalHistoryRow,
  OfficerCardData,
  KMPProfile,
  OrgNode,
  TrainingRecord,
  RosterStaffShift,
  ConflictOfInterestEntry,
  GovernanceChecklistItem,
  ITAssetItem,
  SystemInventoryItem,
  SecurityRiskItem,
  VulnerabilityItem,
  AccessReviewRecord,
  OutsourcingRegisterEntry,
  BCPRecord,
  SecurityIncidentHistoryItem,
  CyberChecklistItem,
  ActivityEntry,
  AISuggestedAction,
  CaseState,
  ComplaintState,
  FilingStatus,
} from '../types';

import { computeNextHash } from '../utils/auditChain';

// Seed data imports
import { currentUser as seedCurrentUser } from '../data/currentUser';
import { SEED_CONTROLS } from '../data/controls.data';
import { SEED_INCIDENTS } from '../data/incidents.data';
import { SEED_CASES } from '../data/cases.data';
import { SEED_OBLIGATIONS } from '../data/obligations.data';
import { SEED_TASKS } from '../data/tasks.data';
import { SEED_COMPLAINTS } from '../data/complaints.data';
import {
  SEED_EVIDENCE_ITEMS,
  SEED_LEGAL_HOLDS,
  SEED_AUDIT_REQUESTS,
  SEED_AUDIT_FINDINGS,
} from '../data/evidence.data';
import {
  SEED_STAFF,
  SEED_OFFICER_CARDS,
  SEED_KMPS,
  SEED_ORG_TREE,
  SEED_TRAINING_RECORDS,
  SEED_ROSTER,
  SEED_CONFLICT_OF_INTEREST_REGISTER,
  SEED_ONBOARDING_CHECKLIST,
  SEED_OFFBOARDING_CHECKLIST,
  SEED_OFFICE_READINESS_CHECKLIST,
} from '../data/governance.data';
import { SEED_VENDORS } from '../data/vendors.data';
import {
  SEED_IT_ASSETS,
  SEED_SYSTEM_INVENTORY,
  SEED_SECURITY_RISKS,
  SEED_VULNERABILITIES,
  SEED_ACCESS_REVIEWS,
  SEED_OUTSOURCING_REGISTER,
  SEED_BCP_RECORDS,
  SEED_SECURITY_INCIDENT_HISTORY,
  SEED_CYBER_CHECKLIST,
} from '../data/cyber.data';
import { SEED_CLIENTS } from '../data/clients.data';
import {
  SEED_REPORT_TEMPLATES,
  SEED_REPORT_INSTANCES,
} from '../data/reports.data';
import {
  SEED_CONNECTED_SYSTEMS,
  SEED_CONNECTOR_CATALOGUE,
  SEED_IMPORT_HISTORY,
  SEED_DATA_QUALITY_ALERTS,
} from '../data/integrations.data';
import { SEED_NOTIFICATIONS } from '../data/notifications.data';
import {
  SEED_AI_RESPONSES,
  SEED_AI_AGENTS,
  SEED_PROMPT_CHIPS,
} from '../data/aiResponses.data';
import {
  SEED_REGULATION_SOURCES,
  SEED_REGULATION_PROPOSALS,
} from '../data/regulations.data';
import { SEED_APPROVALS } from '../data/approvals.data';
import { SEED_MONTHLY_METRICS } from '../data/metrics.data';
import {
  SEED_ADMIN_USERS,
  SEED_POLICIES,
  SEED_AUDIT_LOG_ROWS,
  SEED_RETENTION_RULES,
  SEED_SECURITY_SETTINGS,
  SEED_NOTIFICATION_SETTINGS,
  SEED_ACCESS_HISTORY,
  SEED_CHANGE_APPROVALS,
} from '../data/admin.data';

export interface GovernanceState {
  staff: UserProfile[];
  officers: { po: OfficerCardData; co: OfficerCardData };
  kmps: KMPProfile[];
  orgTree: OrgNode;
  trainingRecords: TrainingRecord[];
  roster: RosterStaffShift[];
  coiRegister: ConflictOfInterestEntry[];
  onboardingChecklist: GovernanceChecklistItem[];
  offboardingChecklist: GovernanceChecklistItem[];
  officeReadiness: GovernanceChecklistItem[];
  changeNotice?: {
    status: 'OPEN' | 'SUBMITTED' | 'CLOSED';
    startedAt: string;
    effectiveDate: string;
    officer: string;
    role: string;
  };
  backupOfficer?: string;
}

export interface CyberState {
  itAssets: ITAssetItem[];
  systemInventory: SystemInventoryItem[];
  securityRisks: SecurityRiskItem[];
  vulnerabilities: VulnerabilityItem[];
  accessReviews: AccessReviewRecord[];
  outsourcingRegister: OutsourcingRegisterEntry[];
  bcpRecords: BCPRecord[];
  securityIncidents: SecurityIncidentHistoryItem[];
  cyberChecklist: CyberChecklistItem[];
}

export interface AssistantChatMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT' | 'SYSTEM';
  text: string;
  timestamp: string;
  citations?: Array<{ code: string; clause: string; title: string }>;
  suggestedActions?: AISuggestedAction[];
}

export interface AssistantState {
  isOpen: boolean;
  isMinimised: boolean;
  messages: AssistantChatMessage[];
}

export interface LegalEntitySettings {
  legalName: string;
  entityType: string;
  ifscRegistrationNo: string;
  registeredAddress: string;
  activities: string[];
  globalAccess: boolean;
}

export interface AdminState {
  adminUsers: AdminUserItem[];
  policies: PolicyDocumentItem[];
  auditLog: AuditLogRow[];
  retentionRules: RetentionRuleItem[];
  securitySettings: SecuritySettingConfig;
  notificationSettings: NotificationSettingConfig;
  accessHistory: AccessHistoryRow[];
  changeApprovals: ChangeApprovalHistoryRow[];
  legalEntitySettings: LegalEntitySettings;
}

export interface AIInvestigationItem {
  id: string;
  title: string;
  targetEntity: string;
  status: 'PENDING_REVIEW' | 'ACCEPTED' | 'REJECTED';
  rejectionReason?: string;
  summary: string;
  createdAt: string;
}

export interface AppState {
  // Slices
  currentUser: UserProfile;
  controls: ControlItem[];
  incidents: IncidentItem[];
  cases: CaseItem[];
  obligations: ObligationItem[];
  tasks: TaskItem[];
  complaints: ComplaintItem[];
  evidence: EvidenceItem[];
  auditRequests: AuditRequestItem[];
  auditFindings: AuditFindingItem[];
  legalHolds: LegalHoldItem[];
  governance: GovernanceState;
  vendors: VendorItem[];
  cyber: CyberState;
  clients: ClientItem[];
  reports: ReportInstanceItem[];
  reportTemplates: ReportTemplateItem[];
  integrations: ConnectedSystemItem[];
  connectorCatalogue: ConnectorCatalogueEntry[];
  importHistory: ImportHistoryItem[];
  dataQualityAlerts: DataQualityAlertItem[];
  notifications: NotificationItem[];
  aiResponses: ScriptedAIResponseItem[];
  aiAgents: AIAgentCardItem[];
  promptChips: PromptChipItem[];
  aiInvestigations: AIInvestigationItem[];
  regulations: RegulationSourceItem[];
  changeProposals: RegulationChangeProposalItem[];
  approvals: ApprovalRecord[];
  assistant: AssistantState;
  metrics: MonthlyMetricSeriesPoint[];
  adminState: AdminState;
  activityLog: ActivityEntry[];
  sidebarCollapsed: boolean;

  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  logMutation: (actor: StaffName | 'SYSTEM', action: string, targetType: string, targetId: string, details: string) => void;

  // 18 Propagation Rules
  closeCase: (caseId: string, remediationEvidenceId?: string) => void;
  declareIncident: (incident: Partial<IncidentItem>) => void;
  acknowledgeFiling: (reportId: string, acknowledgmentRef?: string) => void;
  syncConnector: (connectorId: string) => void;
  evaluateControl: (controlId: string) => 'PASS' | 'FAIL' | 'WARNING' | 'UNKNOWN';
  uploadEvidence: (evidence: Partial<EvidenceItem>) => void;
  acceptAISuggestion: (suggestionId: string) => void;
  rejectAISuggestion: (suggestionId: string, reason: string) => void;
  createTaskFromSuggestion: (task: Partial<TaskItem>) => void;
  startOfficerChange: (changeData: { officer: string; role: string; effectiveDate: string }) => void;
  confirmComplaintClassification: (complaintId: string, type: 'RETAIL' | 'INSTITUTIONAL') => void;
  approveRegulationChange: (proposalId: string) => void;
  applyLegalHold: (evidenceId: string, caseRef: string, reason: string) => void;
  approvePolicy: (policyId: string) => void;
  completeTask: (taskId: string) => void;
  startVendorReassessment: (vendorId: string) => void;
  flagIntegrityMismatch: (evidenceId: string) => void;
  pushNotification: (notification: Partial<NotificationItem>) => void;
  markAllNotificationsRead: () => void;

  // Additional helper actions
  recordApprovalSignoff: (recordId: string, approver: StaffName, code: string) => void;
  rejectApproval: (recordId: string, reason: string) => void;
  routeApproval: (recordId: string, approverName: StaffName) => void;
  submitApproval: (recordId: string) => void;
  sendAssistantMessage: (text: string) => void;
  setAssistantOpen: (open: boolean) => void;
  setAssistantMinimised: (minimised: boolean) => void;
  toggleChecklistItem: (listType: 'office' | 'onboarding' | 'offboarding', itemId: string) => void;
  createTask: (task: TaskItem) => void;
  updateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  addTaskComment: (taskId: string, author: StaffName, text: string) => void;
  toggleTaskChecklistItem: (taskId: string, checkId: string) => void;
  updateObligation: (id: string, updates: Partial<ObligationItem>) => void;
  addObligation: (obligation: ObligationItem) => void;
  addAuditRequest: (request: Partial<AuditRequestItem>) => void;
  addCOIEntry: (entry: ConflictOfInterestEntry) => void;
  setBackupOfficer: (officer: string) => void;
  updateLegalEntitySettings: (settings: Partial<LegalEntitySettings>) => void;
  updateOfficerCard: (role: 'po' | 'co', updates: Partial<OfficerCardData>) => void;
  createControl: (control: ControlItem) => void;
  updateControl: (id: string, updates: Partial<ControlItem>) => void;
  updateIncident: (id: string, updates: Partial<IncidentItem>) => void;
  addClient: (client: ClientItem) => void;
  updateClientKyc: (clientId: string, status: KYCStatus) => void;
  incrementClientDocuments: (clientId: string) => void;
  disambiguateClientAlert: (clientId: string) => void;
  addCase: (caseItem: CaseItem) => void;
  updateCaseStatus: (caseId: string, status: CaseState) => void;
  assignCaseReviewer: (caseId: string, reviewer: StaffName) => void;
  proposeCaseResolution: (caseId: string, resolution: string) => void;
  linkCaseEvidence: (caseId: string, evidenceId: string) => void;
  approveCaseResolution: (caseId: string, approver: StaffName) => void;
  sendProposalToLegalReview: (proposalId: string) => void;
  addComplaint: (complaint: ComplaintItem) => void;
  updateComplaintStatus: (complaintId: string, status: ComplaintState) => void;
  assignComplaintCRO: (complaintId: string, croName: StaffName) => void;
  resolveComplaint: (complaintId: string, resolution: string) => void;
  rejectComplaint: (complaintId: string, reason: string) => void;
  recordComplaintAcknowledgement: (complaintId: string) => void;
  addReport: (report: ReportInstanceItem) => void;
  updateReportStatus: (reportId: string, status: FilingStatus) => void;
  markReportSubmitted: (reportId: string) => void;
  updateFinding: (findingId: string, updates: Partial<AuditFindingItem>) => void;
  addFindingCAPA: (findingId: string, capaText: string) => void;
  releaseLegalHold: (holdId: string, approver: StaffName) => void;
  fulfilAuditRequest: (requestId: string) => void;
  resolveDataQualityAlert: (alertId: string) => void;
  addOutsourcingRegisterEntry: (entry: OutsourcingRegisterEntry) => void;
  toggleCyberChecklistItem: (itemId: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettingConfig>) => void;
  updateSecuritySettings: (settings: Partial<SecuritySettingConfig>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: seedCurrentUser,
  controls: SEED_CONTROLS,
  incidents: SEED_INCIDENTS,
  cases: SEED_CASES,
  obligations: SEED_OBLIGATIONS,
  tasks: SEED_TASKS,
  complaints: SEED_COMPLAINTS,
  evidence: SEED_EVIDENCE_ITEMS,
  auditRequests: SEED_AUDIT_REQUESTS,
  auditFindings: SEED_AUDIT_FINDINGS,
  legalHolds: SEED_LEGAL_HOLDS,
  governance: {
    staff: SEED_STAFF,
    officers: SEED_OFFICER_CARDS,
    kmps: SEED_KMPS,
    orgTree: SEED_ORG_TREE,
    trainingRecords: SEED_TRAINING_RECORDS,
    roster: SEED_ROSTER,
    coiRegister: SEED_CONFLICT_OF_INTEREST_REGISTER,
    onboardingChecklist: SEED_ONBOARDING_CHECKLIST,
    offboardingChecklist: SEED_OFFBOARDING_CHECKLIST,
    officeReadiness: SEED_OFFICE_READINESS_CHECKLIST,
  },
  vendors: SEED_VENDORS,
  cyber: {
    itAssets: SEED_IT_ASSETS,
    systemInventory: SEED_SYSTEM_INVENTORY,
    securityRisks: SEED_SECURITY_RISKS,
    vulnerabilities: SEED_VULNERABILITIES,
    accessReviews: SEED_ACCESS_REVIEWS,
    outsourcingRegister: SEED_OUTSOURCING_REGISTER,
    bcpRecords: SEED_BCP_RECORDS,
    securityIncidents: SEED_SECURITY_INCIDENT_HISTORY,
    cyberChecklist: SEED_CYBER_CHECKLIST,
  },
  clients: SEED_CLIENTS,
  reports: SEED_REPORT_INSTANCES,
  reportTemplates: SEED_REPORT_TEMPLATES,
  integrations: SEED_CONNECTED_SYSTEMS,
  connectorCatalogue: SEED_CONNECTOR_CATALOGUE,
  importHistory: SEED_IMPORT_HISTORY,
  dataQualityAlerts: SEED_DATA_QUALITY_ALERTS,
  notifications: SEED_NOTIFICATIONS,
  aiResponses: SEED_AI_RESPONSES,
  aiAgents: SEED_AI_AGENTS,
  promptChips: SEED_PROMPT_CHIPS,
  aiInvestigations: [
    {
      id: 'INV-2026-001',
      title: 'Segregation of Duties Conflict Analysis (CASE-2026-031)',
      targetEntity: 'GOV-SOD-001',
      status: 'PENDING_REVIEW',
      summary: 'Automated policy comparison confirms Deepa Patel possesses conflicting compliance privilege in Okta directory.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'INV-2026-002',
      title: 'Technical Glitch RCA Draft Synthesis (INC-2026-014)',
      targetEntity: 'INC-2026-014',
      status: 'PENDING_REVIEW',
      summary: 'Generated 14-day root-cause breakdown linking BGP router flap to co-location cross-connect failover latency.',
      createdAt: new Date().toISOString(),
    },
  ],
  regulations: SEED_REGULATION_SOURCES,
  changeProposals: SEED_REGULATION_PROPOSALS,
  approvals: SEED_APPROVALS,
  assistant: {
    isOpen: false,
    isMinimised: false,
    messages: [
      {
        id: 'msg-01',
        sender: 'ASSISTANT',
        text: 'Greetings Aarav. I am your IFSC TrustOps Assistant. Ask me about control status, statutory reporting clocks, or evidence hashes.',
        timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
      },
    ],
  },
  metrics: SEED_MONTHLY_METRICS,
  adminState: {
    adminUsers: SEED_ADMIN_USERS,
    policies: SEED_POLICIES,
    auditLog: SEED_AUDIT_LOG_ROWS,
    retentionRules: SEED_RETENTION_RULES,
    securitySettings: SEED_SECURITY_SETTINGS,
    notificationSettings: SEED_NOTIFICATION_SETTINGS,
    accessHistory: SEED_ACCESS_HISTORY,
    changeApprovals: SEED_CHANGE_APPROVALS,
    legalEntitySettings: {
      legalName: 'Meridian Securities IFSC Limited',
      entityType: 'Broker Dealer & Clearing Member',
      ifscRegistrationNo: 'IFSCA/BD-CM/2024/089',
      registeredAddress: 'Unit 402, Signature Tower, GIFT SEZ, Gandhinagar, Gujarat 382355',
      activities: ['Trading in Derivatives', 'Cash Equities Execution', 'Direct Market Access (DMA)', 'Proprietary Clearing'],
      globalAccess: false,
    },
  },
  activityLog: [
    {
      id: 'act-001',
      timestamp: new Date(Date.now() - 15 * 60_000).toISOString(),
      actor: 'Aarav Mehta',
      action: 'CASE_TRIAGED',
      targetType: 'CASE',
      targetId: 'CASE-2026-031',
      details: 'Triaged High-severity segregation of duties conflict for Deepa Patel.',
    },
    {
      id: 'act-002',
      timestamp: new Date(Date.now() - 45 * 60_000).toISOString(),
      actor: 'Vikram Shah',
      action: 'REPORT_SUBMITTED',
      targetType: 'REPORT',
      targetId: 'RPT-2026-GLT-02',
      details: 'Submitted T+1 preliminary incident report for INC-2026-014 to IFSCA.',
    },
  ],
  sidebarCollapsed: false,

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Propagation rule #17: Central mutation logger for activity and cryptographic audit chain
  logMutation: (actor, action, targetType, targetId, details) => {
    const timestamp = new Date().toISOString();
    const actId = `act-${Date.now().toString().slice(-6)}`;
    const newActivity: ActivityEntry = {
      id: actId,
      timestamp,
      actor,
      action,
      targetType,
      targetId,
      details,
    };

    set((state) => {
      const auditLog = state.adminState.auditLog;
      const latestRow = auditLog[0];
      const prevHash = latestRow ? latestRow.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
      const payload = `${actor}|${action}|${targetId}|${timestamp}`;
      const currentHash = computeNextHash(prevHash, payload);

      const newAuditRow: AuditLogRow = {
        id: `LOG-${(auditLog.length + 1001).toString()}`,
        timestamp,
        actor: actor || 'SYSTEM',
        action,
        targetEntity: targetType,
        entityId: targetId,
        details,
        ipAddress: '10.14.40.101',
        currentHash,
        previousHash: prevHash,
      };

      return {
        activityLog: [newActivity, ...state.activityLog],
        adminState: {
          ...state.adminState,
          auditLog: [newAuditRow, ...auditLog],
        },
      };
    });
  },

  // Propagation rule #1: Closing CASE-2026-031 with linked remediation evidence evaluates GOV-SOD-001
  // using only SSO/IAM and HR freshness (both HEALTHY); sets PASS. RMS is NOT checked.
  closeCase: (caseId, remediationEvidenceId) => {
    const state = get();
    const now = new Date().toISOString();

    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status: 'CLOSED',
              closedAt: now,
              remediationEvidenceId: remediationEvidenceId || c.remediationEvidenceId || 'EVD-040',
            }
          : c
      ),
    }));

    if (caseId === 'CASE-2026-031') {
      // Rule 1 side-effect: check SSO/IAM and HR freshness (RMS is intentionally bypassed)
      const ssoHealthy = state.integrations.some((i) => (i.id === 'sso' || i.id === 'sso_iam' || i.code.includes('IAM') || i.code.includes('SSO')) && (i.status === 'HEALTHY' || i.status === 'WARNING'));
      const hrHealthy = state.integrations.some((i) => (i.id === 'hr' || i.id === 'hr_directory' || i.code.includes('HR')) && (i.status === 'HEALTHY' || i.status === 'WARNING'));

      if (ssoHealthy && hrHealthy) {
        set((s) => ({
          controls: s.controls.map((ctrl) =>
            ctrl.id === 'GOV-SOD-001'
              ? {
                  ...ctrl,
                  status: 'PASS',
                  needsRevaluation: false,
                  lastEvaluated: now,
                  exceptionDetail: undefined,
                }
              : ctrl
          ),
        }));
      }
    }

    get().logMutation(
      state.currentUser.name,
      'CASE_CLOSED',
      'CASE',
      caseId,
      `Case ${caseId} marked as CLOSED with remediation evidence linked. GOV-SOD-001 re-evaluated to PASS.`
    );
  },

  // Propagation rule #2: Incident declared (new) pushes clock records, task, notification,
  // sets technical glitch control to WARNING (if qualifying glitch >= 5 min), and generates 3 report instances.
  declareIncident: (incidentData) => {
    const id = `INC-2026-${(get().incidents.length + 15).toString().padStart(3, '0')}`;
    const now = new Date();
    const occurredAt = incidentData.occurredAt || now.toISOString();
    const durationMinutes = incidentData.durationMinutes !== undefined ? incidentData.durationMinutes : 7;
    const isGlitch = durationMinutes >= 5;

    const newIncident: IncidentItem = {
      id,
      title: incidentData.title || (isGlitch ? 'Unscheduled Trading System Interruption' : 'Minor Technical Interruption (< 5 min)'),
      severity: incidentData.severity || (isGlitch ? 'CRITICAL' : 'LOW'),
      status: 'OPEN',
      isGlitch,
      occurredAt,
      detectedAt: now.toISOString(),
      durationMinutes,
      owner: 'Vikram Shah',
      ownerId: 'USR-004',
      clocks: isGlitch
        ? {
            initialNotice: {
              label: '1-Hour Initial Notice',
              deadline: new Date(now.getTime() + 60 * 60_000).toISOString(),
              status: 'RUNNING',
            },
            preliminaryReport: {
              label: 'T+1 Preliminary Report',
              deadline: new Date(now.getTime() + 24 * 3600_000).toISOString(),
              status: 'RUNNING',
            },
            rcaReport: {
              label: '14-Day RCA Report',
              deadline: new Date(now.getTime() + 14 * 86_400_000).toISOString(),
              status: 'RUNNING',
            },
          }
        : {
            initialNotice: {
              label: '1-Hour Initial Notice (Exempt)',
              deadline: new Date(now.getTime() + 60 * 60_000).toISOString(),
              status: 'MET',
            },
            preliminaryReport: {
              label: 'T+1 Preliminary Report (Exempt)',
              deadline: new Date(now.getTime() + 24 * 3600_000).toISOString(),
              status: 'MET',
            },
            rcaReport: {
              label: '14-Day RCA Report (Internal)',
              deadline: new Date(now.getTime() + 14 * 86_400_000).toISOString(),
              status: 'RUNNING',
            },
          },
      filings: isGlitch
        ? [
            {
              id: `FIL-${Date.now().toString().slice(-6)}-01`,
              type: 'INITIAL_NOTICE',
              filingNumber: `IFSCA/GLITCH/2026/${id}-N1`,
              status: 'DRAFT',
              recipient: 'IFSCA Market Infrastructure Division',
              hash: 'pending-filing-hash',
              signatory: 'Aarav Mehta',
            },
          ]
        : [],
      description: incidentData.description || 'System interruption recorded.',
      impactedSystems: incidentData.impactedSystems || ['FIX Gateway 01'],
    };

    if (isGlitch) {
      // 3 Report Instances of type TECHNICAL_GLITCH_REPORT
      const report1: ReportInstanceItem = {
        id: `RPT-GLT-${Date.now().toString().slice(-4)}-01`,
        templateId: 'TMPL-004',
        title: `${id} 1-Hour Preliminary Technical Glitch Notice`,
        category: 'TECHNICAL_GLITCH_REPORT',
        period: 'Incident Event',
        dueDate: new Date(now.getTime() + 60 * 60_000).toISOString(),
        status: 'DRAFT',
        preparedBy: 'Aarav Mehta',
        approver: 'Rohan Desai',
        hash: 'pending-glitch-hash-01',
        linkedIncidentId: id,
      };
      const report2: ReportInstanceItem = {
        id: `RPT-GLT-${Date.now().toString().slice(-4)}-02`,
        templateId: 'TMPL-005',
        title: `${id} T+1 Preliminary Technical Glitch Report`,
        category: 'TECHNICAL_GLITCH_REPORT',
        period: 'Incident Event',
        dueDate: new Date(now.getTime() + 24 * 3600_000).toISOString(),
        status: 'DRAFT',
        preparedBy: 'Vikram Shah',
        approver: 'Aarav Mehta',
        secondApprover: 'Rohan Desai',
        hash: 'pending-glitch-hash-02',
        linkedIncidentId: id,
      };
      const report3: ReportInstanceItem = {
        id: `RPT-GLT-${Date.now().toString().slice(-4)}-03`,
        templateId: 'TMPL-006',
        title: `${id} 14-Day Comprehensive RCA Report`,
        category: 'TECHNICAL_GLITCH_REPORT',
        period: 'Incident Event',
        dueDate: new Date(now.getTime() + 14 * 86_400_000).toISOString(),
        status: 'DRAFT',
        preparedBy: 'Vikram Shah',
        approver: 'Rohan Desai',
        hash: 'pending-glitch-hash-03',
        linkedIncidentId: id,
      };

      const newTask: TaskItem = {
        id: `TSK-${(get().tasks.length + 1).toString().padStart(3, '0')}`,
        title: `File mandatory 1-Hour initial technical glitch notice for ${id}`,
        priority: 'CRITICAL',
        status: 'OPEN',
        owner: 'Aarav Mehta',
        ownerId: 'USR-001',
        dueDate: new Date(now.getTime() + 60 * 60_000).toISOString(),
        category: 'REGULATORY_FILING',
        linkedEntityType: 'INCIDENT',
        linkedEntityId: id,
        description: 'Prepare, sign, and submit initial 1-hour notice to IFSCA and exchange surveillance.',
      };

      set((s) => ({
        incidents: [newIncident, ...s.incidents],
        reports: [report1, report2, report3, ...s.reports],
        tasks: [newTask, ...s.tasks],
        controls: s.controls.map((c) =>
          c.id === 'TECH-GLITCH-005' || c.code === 'CTL-OPS-003'
            ? { ...c, status: 'WARNING', needsRevaluation: true }
            : c
        ),
      }));

      get().pushNotification({
        title: `Critical Technical Glitch Declared: ${id}`,
        description: '1-Hour statutory notification clock has started. Action required immediately.',
        severity: 'CRITICAL',
        targetType: 'INCIDENTS',
        targetId: id,
      });
    } else {
      // Non-qualifying interruption (< 5 minutes)
      const internalTask: TaskItem = {
        id: `TSK-${(get().tasks.length + 1).toString().padStart(3, '0')}`,
        title: `Internal post-incident review for ${id} (${durationMinutes} min lag)`,
        priority: 'MEDIUM',
        status: 'OPEN',
        owner: 'Vikram Shah',
        ownerId: 'USR-004',
        dueDate: new Date(now.getTime() + 7 * 86_400_000).toISOString(),
        category: 'Incidents',
        linkedEntityType: 'INCIDENT',
        linkedEntityId: id,
        description: `Verify root cause of sub-threshold lag (${durationMinutes} min < 5 min statutory threshold). No regulatory clocks required.`,
      };

      set((s) => ({
        incidents: [newIncident, ...s.incidents],
        tasks: [internalTask, ...s.tasks],
      }));

      get().pushNotification({
        title: `Technical Interruption Logged: ${id}`,
        description: `Outage duration (${durationMinutes} min) is below the 5-minute IFSCA statutory threshold. Logged for internal oversight.`,
        severity: 'LOW',
        targetType: 'INCIDENTS',
        targetId: id,
      });
    }

    get().logMutation('Vikram Shah', 'INCIDENT_DECLARED', 'INCIDENT', id, `Technical glitch incident ${id} declared.`);
  },

  // Propagation rule #3: Filing ACKNOWLEDGED (receipt uploaded)
  acknowledgeFiling: (reportId, acknowledgmentRef) => {
    const ref = acknowledgmentRef || `IFSCA/ACK/GLT/${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    set((s) => {
      const updatedReports = s.reports.map((r) =>
        r.id === reportId ? { ...r, status: 'ACKNOWLEDGED' as const, acknowledgmentRef: ref, submissionDate: now } : r
      );

      const targetReport = s.reports.find((r) => r.id === reportId);
      let updatedIncidents = s.incidents;

      if (targetReport && targetReport.linkedIncidentId) {
        updatedIncidents = s.incidents.map((inc) => {
          if (inc.id === targetReport.linkedIncidentId) {
            return {
              ...inc,
              filings: inc.filings.map((f) =>
                f.status === 'SUBMITTED' ? { ...f, status: 'ACKNOWLEDGED' as const, acknowledgedAt: now } : f
              ),
            };
          }
          return inc;
        });
      }

      return {
        reports: updatedReports,
        incidents: updatedIncidents,
      };
    });

    get().logMutation(get().currentUser.name, 'FILING_ACKNOWLEDGED', 'REPORT', reportId, `Report ${reportId} acknowledged with ref ${ref}.`);
  },

  // Propagation rule #4: Integration "Sync now" or attested file upload marks dependent controls needsRevaluation.
  // For RMS: ONLY the 4 TRADE controls are marked needsRevaluation = true. GOV-SOD-001 is NOT affected.
  syncConnector: (connectorId) => {
    const now = new Date().toISOString();

    set((s) => ({
      integrations: s.integrations.map((conn) =>
        conn.id === connectorId || conn.code.toLowerCase().includes(connectorId.toLowerCase())
          ? { ...conn, status: 'HEALTHY' as const, lastSyncTimestamp: now, errorRatePercent: 0 }
          : conn
      ),
      controls: s.controls.map((ctrl) => {
        const isRmsConnector = connectorId.toLowerCase() === 'rms' || connectorId === 'CON-RMS-01';
        if (isRmsConnector && ['TRADE-REC-001', 'TRADE-REC-002', 'TRADE-ACCESS-003', 'TRADE-RISK-004'].includes(ctrl.id)) {
          return { ...ctrl, needsRevaluation: true };
        }
        return ctrl;
      }),
    }));

    get().logMutation(get().currentUser.name, 'CONNECTOR_SYNCED', 'INTEGRATION', connectorId, `Connector ${connectorId} resynced.`);
  },

  // Evaluation helper for controls (Rule 1 & Rule 4 evaluation)
  evaluateControl: (controlId) => {
    const state = get();
    const now = new Date().toISOString();

    if (controlId === 'GOV-SOD-001') {
      const case31 = state.cases.find((c) => c.id === 'CASE-2026-031');
      const isCaseClosed = case31 && case31.status === 'CLOSED';

      if (isCaseClosed) {
        set((s) => ({
          controls: s.controls.map((c) =>
            c.id === controlId ? { ...c, status: 'PASS' as const, needsRevaluation: false, lastEvaluated: now } : c
          ),
        }));
        get().logMutation(state.currentUser.name, 'CONTROL_EVALUATED', 'CONTROL', controlId, 'GOV-SOD-001 evaluated: PASS');
        return 'PASS';
      } else {
        set((s) => ({
          controls: s.controls.map((c) =>
            c.id === controlId ? { ...c, status: 'FAIL' as const, needsRevaluation: false, lastEvaluated: now } : c
          ),
        }));
        get().logMutation(state.currentUser.name, 'CONTROL_EVALUATED', 'CONTROL', controlId, 'GOV-SOD-001 evaluated: FAIL');
        return 'FAIL';
      }
    }

    if (['TRADE-REC-001', 'TRADE-REC-002', 'TRADE-ACCESS-003', 'TRADE-RISK-004'].includes(controlId)) {
      const rms = state.integrations.find((i) => i.id === 'rms' || i.code === 'CON-RMS-01');
      const isRmsHealthy = rms && rms.status === 'HEALTHY';

      const nextStatus = isRmsHealthy ? 'PASS' : 'UNKNOWN';
      set((s) => ({
        controls: s.controls.map((c) =>
          c.id === controlId ? { ...c, status: nextStatus, needsRevaluation: false, lastEvaluated: now } : c
        ),
      }));
      get().logMutation(state.currentUser.name, 'CONTROL_EVALUATED', 'CONTROL', controlId, `${controlId} evaluated: ${nextStatus}`);
      return nextStatus;
    }

    return 'PASS';
  },

  // Propagation rule #5: Evidence uploaded increments evidence, recalculates coverage, updates linked items
  uploadEvidence: (evidenceData) => {
    const id = `EVD-${(get().evidence.length + 1).toString().padStart(3, '0')}`;
    const newEvidence: EvidenceItem = {
      id,
      title: evidenceData.title || 'Compliance Verification Evidence Dossier',
      category: evidenceData.category || 'Inspection Dossiers',
      fileName: evidenceData.fileName || 'VERIFIED-EVIDENCE.pdf',
      fileSize: evidenceData.fileSize || '1.4 MB',
      hash: evidenceData.hash || 'b1c2d3e4f5a67890123456789abcdef0123456789abcdef0123456789abcdef0',
      hashStatus: 'VERIFIED',
      uploadedAt: new Date().toISOString(),
      uploadedBy: get().currentUser.name,
      retentionBasis: 'IFSCA CMI Reg. 16 (8-Year Rule)',
      retentionYears: 8,
      linkedControlId: evidenceData.linkedControlId,
      linkedObligationId: evidenceData.linkedObligationId,
      linkedCaseId: evidenceData.linkedCaseId,
    };

    set((s) => ({
      evidence: [newEvidence, ...s.evidence],
      controls: s.controls.map((ctrl) =>
        ctrl.id === evidenceData.linkedControlId
          ? { ...ctrl, evidenceCount: ctrl.evidenceCount + 1 }
          : ctrl
      ),
    }));

    get().logMutation(get().currentUser.name, 'EVIDENCE_UPLOADED', 'EVIDENCE', id, `Evidence ${id} uploaded and sealed.`);
  },

  // Propagation rule #6: AI suggestion Accepted updates status and audit log
  acceptAISuggestion: (suggestionId) => {
    set((s) => ({
      aiInvestigations: s.aiInvestigations.map((inv) =>
        inv.id === suggestionId ? { ...inv, status: 'ACCEPTED' as const } : inv
      ),
    }));
    get().logMutation(get().currentUser.name, 'AI_SUGGESTION_ACCEPTED', 'AI', suggestionId, `AI Proposal ${suggestionId} accepted.`);
  },

  // Propagation rule #7: AI suggestion Rejected updates status with mandatory reason
  rejectAISuggestion: (suggestionId, reason) => {
    set((s) => ({
      aiInvestigations: s.aiInvestigations.map((inv) =>
        inv.id === suggestionId ? { ...inv, status: 'REJECTED' as const, rejectionReason: reason } : inv
      ),
    }));
    get().logMutation(get().currentUser.name, 'AI_SUGGESTION_REJECTED', 'AI', suggestionId, `AI Proposal ${suggestionId} rejected: ${reason}`);
  },

  // Propagation rule #8: "Create task from suggestion" pushes new task
  createTaskFromSuggestion: (taskData) => {
    const id = `TSK-${(get().tasks.length + 1).toString().padStart(3, '0')}`;
    const newTask: TaskItem = {
      id,
      title: taskData.title || 'Review synthesized compliance exception finding',
      priority: taskData.priority || 'HIGH',
      status: 'OPEN',
      owner: taskData.owner || 'Aarav Mehta',
      ownerId: taskData.ownerId || 'USR-001',
      dueDate: taskData.dueDate || new Date(Date.now() + 48 * 3600_000).toISOString(),
      category: 'EXCEPTION_REMEDIATION',
      description: taskData.description || 'Task created from AI investigation synthesis.',
    };

    set((s) => ({
      tasks: [newTask, ...s.tasks],
    }));

    get().pushNotification({
      title: `New Task Assigned: ${id}`,
      description: newTask.title,
      severity: 'MEDIUM',
      targetType: 'AI',
      targetId: id,
    });

    get().logMutation(get().currentUser.name, 'TASK_CREATED', 'TASK', id, `Task ${id} created from AI suggestion.`);
  },

  // Propagation rule #9: Officer change started creates 15-day task, clock, report instance
  startOfficerChange: (changeData) => {
    const now = new Date();
    const deadline = new Date(now.getTime() + 15 * 86_400_000).toISOString();

    const newReport: ReportInstanceItem = {
      id: `RPT-KMP-${Date.now().toString().slice(-4)}`,
      templateId: 'TMPL-007',
      title: `Statutory 15-Day Appointment Notice: ${changeData.role} (${changeData.officer})`,
      category: 'OFFICER_CHANGE_FILING',
      period: 'Appointment Disclosure',
      dueDate: deadline,
      status: 'DRAFT',
      preparedBy: 'Aarav Mehta',
      approver: 'Rohan Desai',
      hash: 'pending-kmp-notice-seal',
    };

    const newTask: TaskItem = {
      id: `TSK-${(get().tasks.length + 1).toString().padStart(3, '0')}`,
      title: `Submit 15-day regulatory notice for ${changeData.officer} appointment as ${changeData.role}`,
      priority: 'CRITICAL',
      status: 'OPEN',
      owner: 'Aarav Mehta',
      ownerId: 'USR-001',
      dueDate: deadline,
      category: 'REGULATORY_FILING',
      description: 'Prepare Board resolution and fit & proper declaration package.',
    };

    set((s) => ({
      governance: {
        ...s.governance,
        changeNotice: {
          status: 'OPEN',
          startedAt: now.toISOString(),
          effectiveDate: changeData.effectiveDate,
          officer: changeData.officer,
          role: changeData.role,
        },
      },
      reports: [newReport, ...s.reports],
      tasks: [newTask, ...s.tasks],
    }));

    get().pushNotification({
      title: '15-Day KMP Change Clock Started',
      description: `Notification for ${changeData.officer} due within 15 days.`,
      severity: 'CRITICAL',
      targetType: 'OBLIGATIONS',
      targetId: 'OBL-002',
    });

    get().logMutation(get().currentUser.name, 'OFFICER_CHANGE_STARTED', 'GOVERNANCE', changeData.officer, `Started officer change for ${changeData.officer}.`);
  },

  // Propagation rule #10: Complaint classification confirmed as Retail starts retail clocks
  confirmComplaintClassification: (complaintId, type) => {
    const isRetail = type === 'RETAIL';
    set((s) => ({
      complaints: s.complaints.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              type,
              isRetail,
              classificationConfirmed: true,
              classificationConfirmedAt: new Date().toISOString(),
              retailClocks: isRetail
                ? {
                    acknowledgementDaysRemaining: 3,
                    nonAcceptanceDaysRemaining: 5,
                    disposalTargetDaysRemaining: 15,
                    ordinaryMaxDaysRemaining: 30,
                  }
                : undefined,
            }
          : c
      ),
    }));

    get().pushNotification({
      title: `Complaint Classified: ${complaintId}`,
      description: `Classified as ${type}. ${isRetail ? 'Retail statutory resolution clocks active.' : ''}`,
      severity: isRetail ? 'HIGH' : 'MEDIUM',
      targetType: 'COMPLAINTS',
      targetId: complaintId,
    });

    get().logMutation(get().currentUser.name, 'COMPLAINT_CLASSIFIED', 'COMPLAINT', complaintId, `Complaint ${complaintId} classified as ${type}.`);
  },

  // Propagation rule #11: Regulation change approved (CO_APPROVED -> ACTIVE)
  approveRegulationChange: (proposalId) => {
    set((s) => ({
      changeProposals: s.changeProposals.map((p) =>
        p.id === proposalId ? { ...p, stage: 'ACTIVE' as const } : p
      ),
    }));

    get().pushNotification({
      title: `Regulatory Amendment Active: ${proposalId}`,
      description: 'Review policy mappings and adjust compliance deadlines accordingly.',
      severity: 'MEDIUM',
      targetType: 'AI',
      targetId: proposalId,
    });

    get().logMutation(get().currentUser.name, 'REGULATION_PROPOSAL_ACTIVATED', 'REGULATION', proposalId, `Proposal ${proposalId} set to ACTIVE.`);
  },

  // Propagation rule #12: Legal hold applied
  applyLegalHold: (evidenceId, caseRef, reason) => {
    const id = `LH-2026-${(get().legalHolds.length + 1).toString().padStart(3, '0')}`;
    const newHold: LegalHoldItem = {
      id,
      evidenceId,
      caseReference: caseRef,
      appliedAt: new Date().toISOString(),
      appliedBy: get().currentUser.name,
      reason,
      status: 'ACTIVE',
    };

    set((s) => ({
      legalHolds: [newHold, ...s.legalHolds],
    }));

    get().logMutation(get().currentUser.name, 'LEGAL_HOLD_APPLIED', 'EVIDENCE', evidenceId, `Legal hold ${id} applied to ${evidenceId}.`);
  },

  // Propagation rule #13: Policy approved
  approvePolicy: (policyId) => {
    set((s) => ({
      adminState: {
        ...s.adminState,
        policies: s.adminState.policies.map((pol) =>
          pol.id === policyId ? { ...pol, status: 'ACTIVE' as const } : pol
        ),
      },
    }));

    get().logMutation(get().currentUser.name, 'POLICY_APPROVED', 'ADMIN', policyId, `Policy ${policyId} approved.`);
  },

  // Propagation rule #14: Task completed
  completeTask: (taskId) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status: 'COMPLETED' as const } : t)),
    }));

    get().logMutation(get().currentUser.name, 'TASK_COMPLETED', 'TASK', taskId, `Task ${taskId} completed.`);
  },

  // Propagation rule #15: Vendor reassessment started
  startVendorReassessment: (vendorId) => {
    const vendor = get().vendors.find((v) => v.id === vendorId);
    const vendorName = vendor ? vendor.name : vendorId;
    const newTask: TaskItem = {
      id: `TSK-${(get().tasks.length + 1).toString().padStart(3, '0')}`,
      title: `Complete annual SOC-2 and vendor reassessment for ${vendorName}`,
      priority: 'HIGH',
      status: 'OPEN',
      owner: 'Vikram Shah',
      ownerId: 'USR-004',
      dueDate: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      category: 'VENDOR_ASSESSMENT',
      description: 'Review third-party subservice controls, security posture, and contract SLA terms.',
    };

    set((s) => ({
      tasks: [newTask, ...s.tasks],
      vendors: s.vendors.map((v) =>
        v.id === vendorId ? { ...v, status: 'UNDER_REVIEW' as const } : v
      ),
    }));

    get().logMutation(get().currentUser.name, 'VENDOR_REASSESSMENT_STARTED', 'VENDOR', vendorId, `Reassessment for ${vendorName} initiated.`);
  },

  // Propagation rule #16: Integrity mismatch detected
  flagIntegrityMismatch: (evidenceId) => {
    set((s) => ({
      evidence: s.evidence.map((ev) =>
        ev.id === evidenceId ? { ...ev, hashStatus: 'MISMATCH' as const } : ev
      ),
    }));

    get().pushNotification({
      title: `Critical Integrity Alert: ${evidenceId}`,
      description: 'Cryptographic hash mismatch detected on sealed WORM storage document.',
      severity: 'CRITICAL',
      targetType: 'CONTROLS',
      targetId: evidenceId,
    });

    get().logMutation('SYSTEM', 'INTEGRITY_MISMATCH_DETECTED', 'EVIDENCE', evidenceId, `Hash verification mismatch on ${evidenceId}.`);
  },

  // Propagation rule #18: Notifications generated and mark all as read
  pushNotification: (notificationData) => {
    const id = `NOTIF-${(get().notifications.length + 1).toString().padStart(3, '0')}`;
    const newNotif: NotificationItem = {
      id,
      title: notificationData.title || 'System Notification',
      description: notificationData.description || '',
      severity: notificationData.severity || 'LOW',
      read: false,
      timestamp: 'Just now',
      targetType: notificationData.targetType || 'CONTROLS',
      targetId: notificationData.targetId,
      targetParams: notificationData.targetParams,
    };

    set((s) => ({
      notifications: [newNotif, ...s.notifications],
    }));
  },

  markAllNotificationsRead: () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  // Approval workflow actions
  recordApprovalSignoff: (recordId, approver, code) => {
    set((s) => ({
      approvals: s.approvals.map((rec) => {
        if (rec.id !== recordId) return rec;
        const newSignoff = { approver, signedAt: new Date().toISOString(), verificationCode: code };
        const allSignoffs = [...rec.approvedSignoffs, newSignoff];
        const isFullyApproved = allSignoffs.length >= rec.requiredSignoffs;

        return {
          ...rec,
          approvedSignoffs: allSignoffs,
          state: isFullyApproved ? 'APPROVED' : 'PENDING_APPROVAL',
        };
      }),
    }));

    get().logMutation(approver, 'APPROVAL_SIGNOFF_RECORDED', 'APPROVAL', recordId, `Sign-off recorded for approval ${recordId}.`);
  },

  rejectApproval: (recordId, reason) => {
    set((s) => ({
      approvals: s.approvals.map((rec) =>
        rec.id === recordId ? { ...rec, state: 'REJECTED' as const, rejectedReason: reason } : rec
      ),
    }));

    get().logMutation(get().currentUser.name, 'APPROVAL_REJECTED', 'APPROVAL', recordId, `Approval ${recordId} rejected: ${reason}`);
  },

  routeApproval: (recordId, approverName) => {
    set((s) => ({
      approvals: s.approvals.map((rec) =>
        rec.id === recordId
          ? {
              ...rec,
              state: 'PENDING_APPROVAL' as const,
              assignedApprover: approverName,
            }
          : rec
      ),
    }));

    get().logMutation(get().currentUser.name, 'APPROVAL_ROUTED', 'APPROVAL', recordId, `Approval ${recordId} routed to ${approverName}.`);
  },

  submitApproval: (recordId) => {
    set((s) => ({
      approvals: s.approvals.map((rec) =>
        rec.id === recordId ? { ...rec, state: 'PENDING_APPROVAL' as const } : rec
      ),
    }));

    get().logMutation(get().currentUser.name, 'APPROVAL_SUBMITTED', 'APPROVAL', recordId, `Approval ${recordId} submitted for review.`);
  },

  // Assistant actions
  sendAssistantMessage: (text) => {
    const userMsg: AssistantChatMessage = {
      id: `msg-${Date.now().toString()}`,
      sender: 'USER',
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
    };

    set((s) => ({
      assistant: {
        ...s.assistant,
        messages: [...s.assistant.messages, userMsg],
      },
    }));

    // Find scripted response
    const queryLower = text.toLowerCase();
    const isInvestmentAdvice = [
      'invest', 'investment', 'stock', 'stocks', 'equity', 'equities', 'buy', 'sell',
      'portfolio', 'advice', 'advisory', 'recommend', 'recommendation', 'target price', 'crypto'
    ].some((term) => queryLower.includes(term));

    const matchedResponse = get().aiResponses.find((r) =>
      r.triggerKeywords.some((kw) => queryLower.includes(kw.toLowerCase()))
    );

    setTimeout(() => {
      let replyMsg: AssistantChatMessage;

      if (isInvestmentAdvice) {
        replyMsg = {
          id: `reply-${Date.now().toString()}`,
          sender: 'ASSISTANT',
          text: `### Statutory Boundary: Commercial Investment Advice Prohibited\n\n**IFSC TrustOps is strictly an institution-side regulatory compliance, governance, and operational controls assurance platform.**\n\nUnder **IFSCA (Capital Market Intermediaries) Regulations, 2021** and institutional compliance operating protocols, this system does not provide market timing, commercial stock recommendations, trading signals, or investment advisory services.\n\nFor questions regarding control exceptions, reporting deadlines, evidence hashes, or governance rosters, please ask TrustOps Assistant.`,
          timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
        };
      } else if (matchedResponse) {
        replyMsg = {
          id: `reply-${Date.now().toString()}`,
          sender: 'ASSISTANT',
          text: matchedResponse.responseMarkdown,
          timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
          citations: matchedResponse.citations,
          suggestedActions: matchedResponse.suggestedActions,
        };
      } else {
        replyMsg = {
          id: `reply-${Date.now().toString()}`,
          sender: 'ASSISTANT',
          text: `No verified statutory procedure or control finding was matched for this query in the institutional knowledge vault. You can create a compliance review task for manual inspection.`,
          timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
          suggestedActions: [
            {
              label: 'Create review task',
              targetType: 'CREATE_TASK',
              targetId: text,
            },
          ],
        };
      }

      set((s) => ({
        assistant: {
          ...s.assistant,
          messages: [...s.assistant.messages, replyMsg],
        },
      }));
    }, 400);
  },

  setAssistantOpen: (open) =>
    set((s) => ({
      assistant: { ...s.assistant, isOpen: open, isMinimised: false },
    })),

  setAssistantMinimised: (minimised) =>
    set((s) => ({
      assistant: { ...s.assistant, isMinimised: minimised },
    })),

  toggleChecklistItem: (listType, itemId) => {
    set((s) => {
      const gov = s.governance;
      if (listType === 'office') {
        return {
          governance: {
            ...gov,
            officeReadiness: gov.officeReadiness.map((i) =>
              i.id === itemId ? { ...i, status: i.status === 'CONFIRMED' ? 'UNVERIFIED' : 'CONFIRMED' } : i
            ),
          },
        };
      }
      if (listType === 'onboarding') {
        return {
          governance: {
            ...gov,
            onboardingChecklist: gov.onboardingChecklist.map((i) =>
              i.id === itemId ? { ...i, status: i.status === 'CONFIRMED' ? 'UNVERIFIED' : 'CONFIRMED' } : i
            ),
          },
        };
      }
      return {
        governance: {
          ...gov,
          offboardingChecklist: gov.offboardingChecklist.map((i) =>
            i.id === itemId ? { ...i, status: i.status === 'CONFIRMED' ? 'UNVERIFIED' : 'CONFIRMED' } : i
          ),
        },
      };
    });
  },

  createTask: (newTask) => {
    set((s) => ({
      tasks: [newTask, ...s.tasks],
    }));
    get().logMutation(get().currentUser.name, 'TASK_CREATED', 'TASK', newTask.id, `Task ${newTask.id} created.`);
  },

  updateTask: (taskId, updates) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    }));
    get().logMutation(get().currentUser.name, 'TASK_UPDATED', 'TASK', taskId, `Task ${taskId} updated.`);
  },

  addTaskComment: (taskId, author, text) => {
    const comment = {
      id: `comm-${Date.now().toString().slice(-6)}`,
      author,
      text,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...(t.comments || []), comment] }
          : t
      ),
    }));
    get().logMutation(author, 'TASK_COMMENT_ADDED', 'TASK', taskId, `Comment added to ${taskId}.`);
  },

  toggleTaskChecklistItem: (taskId, checkId) => {
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const checklist = (t.checklist || []).map((c) =>
          c.id === checkId ? { ...c, done: !c.done } : c
        );
        return { ...t, checklist };
      }),
    }));
  },

  updateObligation: (id, updates) => {
    set((s) => ({
      obligations: s.obligations.map((obl) => (obl.id === id ? { ...obl, ...updates } : obl)),
    }));
    get().logMutation(get().currentUser.name, 'OBLIGATION_UPDATED', 'OBLIGATION', id, `Obligation ${id} updated.`);
  },

  addObligation: (newObligation) => {
    set((s) => ({
      obligations: [newObligation, ...s.obligations],
    }));
    get().logMutation(get().currentUser.name, 'OBLIGATION_CREATED', 'OBLIGATION', newObligation.id, `Proposed obligation ${newObligation.id} added.`);
  },

  addAuditRequest: (requestData) => {
    const id = `REQ-${Date.now().toString().slice(-6)}`;
    const newReq: AuditRequestItem = {
      id,
      title: requestData.title || 'Evidence Request for Regulatory Assurance',
      auditor: requestData.auditor || 'Independent External Auditor',
      period: requestData.period || 'Annual Assurance Period',
      requestedDate: new Date().toISOString(),
      dueDate: requestData.dueDate || new Date(Date.now() + 7 * 86_400_000).toISOString(),
      status: 'OPEN',
      owner: requestData.owner || 'Aarav Mehta',
      evidenceItemsCount: 0,
    };
    set((s) => ({
      auditRequests: [newReq, ...s.auditRequests],
    }));
    get().logMutation(get().currentUser.name, 'AUDIT_REQUEST_CREATED', 'AUDIT_REQUEST', id, `Evidence request ${id} raised.`);
  },

  addCOIEntry: (entry) => {
    set((s) => ({
      governance: {
        ...s.governance,
        coiRegister: [entry, ...s.governance.coiRegister],
      },
    }));
    get().logMutation(entry.staffName, 'COI_ENTRY_RECORDED', 'GOVERNANCE', entry.id, `Conflict of Interest declaration filed by ${entry.staffName}.`);
  },

  setBackupOfficer: (officer) => {
    set((s) => ({
      governance: {
        ...s.governance,
        backupOfficer: officer,
      },
    }));
    get().logMutation(get().currentUser.name, 'BACKUP_OFFICER_ASSIGNED', 'GOVERNANCE', officer, `Designated ${officer} as backup officer.`);
  },

  updateLegalEntitySettings: (settings) => {
    set((s) => ({
      adminState: {
        ...s.adminState,
        legalEntitySettings: {
          ...s.adminState.legalEntitySettings,
          ...settings,
        },
      },
    }));
    get().logMutation(get().currentUser.name, 'LEGAL_ENTITY_SETTINGS_UPDATED', 'ADMIN', 'ENTITY_CONFIG', 'Updated legal entity registration and activity profile.');
  },

  updateOfficerCard: (role, updates) => {
    set((s) => ({
      governance: {
        ...s.governance,
        officers: {
          ...s.governance.officers,
          [role]: {
            ...s.governance.officers[role],
            ...updates,
          },
        },
      },
    }));
    get().logMutation(get().currentUser.name, 'OFFICER_DETAILS_UPDATED', 'GOVERNANCE', role, `Updated officer records for ${role.toUpperCase()}.`);
  },

  createControl: (newControl) => {
    set((s) => ({
      controls: [newControl, ...s.controls],
    }));
    get().logMutation(get().currentUser.name, 'CONTROL_CREATED', 'CONTROL', newControl.id, `Control ${newControl.code} registered.`);
  },

  updateControl: (id, updates) => {
    set((s) => ({
      controls: s.controls.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    get().logMutation(get().currentUser.name, 'CONTROL_UPDATED', 'CONTROL', id, `Control ${id} updated.`);
  },

  updateIncident: (id, updates) => {
    set((s) => ({
      incidents: s.incidents.map((inc) => (inc.id === id ? { ...inc, ...updates } : inc)),
    }));
    get().logMutation(get().currentUser.name, 'INCIDENT_UPDATED', 'INCIDENT', id, `Incident ${id} updated.`);
  },

  addClient: (client) => {
    set((s) => ({ clients: [client, ...s.clients] }));
    get().logMutation(get().currentUser.name, 'CLIENT_ADDED', 'CLIENT', client.id, `Client ${client.id} (${client.legalName}) registered.`);
  },

  updateClientKyc: (clientId, status) => {
    set((s) => ({
      clients: s.clients.map((c) =>
        c.id === clientId
          ? { ...c, kycStatus: status, lastKycDate: new Date().toISOString() }
          : c
      ),
    }));
    get().logMutation(get().currentUser.name, 'CLIENT_KYC_UPDATED', 'CLIENT', clientId, `Client ${clientId} KYC status updated to ${status}.`);
  },

  incrementClientDocuments: (clientId) => {
    set((s) => ({
      clients: s.clients.map((c) =>
        c.id === clientId ? { ...c, documentsSealedCount: c.documentsSealedCount + 1 } : c
      ),
    }));
    get().logMutation(get().currentUser.name, 'CLIENT_DOCUMENT_UPLOADED', 'CLIENT', clientId, `New sealed document uploaded for client ${clientId}.`);
  },

  disambiguateClientAlert: (clientId) => {
    set((s) => ({
      clients: s.clients.map((c) =>
        c.id === clientId ? { ...c, activeScreeningAlerts: Math.max(0, c.activeScreeningAlerts - 1) } : c
      ),
    }));
    get().logMutation(get().currentUser.name, 'CLIENT_ALERT_DISAMBIGUATED', 'CLIENT', clientId, `Screening alert disambiguated for client ${clientId}.`);
  },

  addCase: (caseItem) => {
    set((s) => ({ cases: [caseItem, ...s.cases] }));
    get().logMutation(get().currentUser.name, 'CASE_CREATED', 'CASE', caseItem.id, `Case ${caseItem.id} initialized: ${caseItem.title}`);
  },

  updateCaseStatus: (caseId, status) => {
    set((s) => ({
      cases: s.cases.map((c) => (c.id === caseId ? { ...c, status } : c)),
    }));
    get().logMutation(get().currentUser.name, 'CASE_STATUS_UPDATED', 'CASE', caseId, `Case ${caseId} transitioned to ${status}.`);
  },

  assignCaseReviewer: (caseId, reviewer) => {
    set((s) => ({
      cases: s.cases.map((c) => (c.id === caseId ? { ...c, reviewer } : c)),
    }));
    get().logMutation(get().currentUser.name, 'CASE_REVIEWER_ASSIGNED', 'CASE', caseId, `Reviewer ${reviewer} assigned to case ${caseId}.`);
  },

  proposeCaseResolution: (caseId, resolution) => {
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              remediationPlan: resolution,
              status: 'REMEDIATION_PROPOSED' as const,
              timeline: [
                ...c.timeline,
                {
                  id: `t-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  actor: get().currentUser.name,
                  action: 'Remediation Proposed',
                  detail: resolution,
                },
              ],
            }
          : c
      ),
    }));
    get().logMutation(get().currentUser.name, 'CASE_RESOLUTION_PROPOSED', 'CASE', caseId, `Resolution proposed for case ${caseId}.`);
  },

  linkCaseEvidence: (caseId, evidenceId) => {
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              remediationEvidenceId: evidenceId,
              timeline: [
                ...c.timeline,
                {
                  id: `t-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  actor: get().currentUser.name,
                  action: 'Evidence Linked',
                  detail: `Linked remediation evidence dossier ${evidenceId}.`,
                },
              ],
            }
          : c
      ),
    }));
    get().logMutation(get().currentUser.name, 'CASE_EVIDENCE_LINKED', 'CASE', caseId, `Evidence ${evidenceId} linked to case ${caseId}.`);
  },

  approveCaseResolution: (caseId, approver) => {
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              approver,
              status: 'RESOLVED' as const,
              timeline: [
                ...c.timeline,
                {
                  id: `t-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  actor: approver,
                  action: 'Resolution Approved',
                  detail: `Approved by independent officer ${approver}.`,
                },
              ],
            }
          : c
      ),
    }));
    get().logMutation(approver, 'CASE_RESOLUTION_APPROVED', 'CASE', caseId, `Resolution for case ${caseId} approved by ${approver}.`);
  },

  sendProposalToLegalReview: (proposalId) => {
    set((s) => ({
      changeProposals: s.changeProposals.map((p) =>
        p.id === proposalId ? { ...p, stage: 'LEGAL_REVIEW' as const } : p
      ),
    }));
    get().logMutation(get().currentUser.name, 'PROPOSAL_LEGAL_REVIEW', 'REGULATION', proposalId, `Proposal ${proposalId} routed to legal review.`);
  },

  addComplaint: (complaint) => {
    set((s) => ({ complaints: [complaint, ...s.complaints] }));
    get().logMutation(get().currentUser.name, 'COMPLAINT_CREATED', 'COMPLAINT', complaint.id, `Complaint ${complaint.id} logged.`);
  },

  updateComplaintStatus: (complaintId, status) => {
    set((s) => ({
      complaints: s.complaints.map((c) => (c.id === complaintId ? { ...c, status } : c)),
    }));
    get().logMutation(get().currentUser.name, 'COMPLAINT_STATUS_UPDATED', 'COMPLAINT', complaintId, `Complaint ${complaintId} status updated to ${status}.`);
  },

  assignComplaintCRO: (complaintId, croName) => {
    set((s) => ({
      complaints: s.complaints.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              owner: croName,
              croConflict: false,
              croConflictReason: undefined,
            }
          : c
      ),
    }));
    get().logMutation(get().currentUser.name, 'COMPLAINT_CRO_ASSIGNED', 'COMPLAINT', complaintId, `CRO ${croName} assigned to complaint ${complaintId}.`);
  },

  resolveComplaint: (complaintId, resolution) => {
    set((s) => ({
      complaints: s.complaints.map((c) =>
        c.id === complaintId ? { ...c, status: 'DISPOSED' as const, resolutionSummary: resolution } : c
      ),
    }));
    get().logMutation(get().currentUser.name, 'COMPLAINT_DISPOSED', 'COMPLAINT', complaintId, `Complaint ${complaintId} marked as DISPOSED.`);
  },

  rejectComplaint: (complaintId, reason) => {
    set((s) => ({
      complaints: s.complaints.map((c) =>
        c.id === complaintId ? { ...c, status: 'DISPOSED' as const, resolutionSummary: `Non-Acceptance: ${reason}` } : c
      ),
    }));
    get().logMutation(get().currentUser.name, 'COMPLAINT_REJECTED', 'COMPLAINT', complaintId, `Complaint ${complaintId} rejected: ${reason}`);
  },

  recordComplaintAcknowledgement: (complaintId) => {
    set((s) => ({
      complaints: s.complaints.map((c) => {
        if (c.id !== complaintId) return c;
        const clocks = c.retailClocks ? { ...c.retailClocks, acknowledgementDaysRemaining: 0 } : undefined;
        return { ...c, status: 'INVESTIGATING' as const, retailClocks: clocks };
      }),
    }));
    get().logMutation(get().currentUser.name, 'COMPLAINT_ACKNOWLEDGED', 'COMPLAINT', complaintId, `Acknowledgement dispatched for complaint ${complaintId}.`);
  },

  addReport: (report) => {
    set((s) => ({ reports: [report, ...s.reports] }));
    get().logMutation(get().currentUser.name, 'REPORT_CREATED', 'REPORT', report.id, `Report instance ${report.id} created.`);
  },

  updateReportStatus: (reportId, status) => {
    set((s) => ({
      reports: s.reports.map((r) => (r.id === reportId ? { ...r, status } : r)),
    }));
    get().logMutation(get().currentUser.name, 'REPORT_STATUS_UPDATED', 'REPORT', reportId, `Report ${reportId} status updated to ${status}.`);
  },

  markReportSubmitted: (reportId) => {
    const now = new Date().toISOString();
    set((s) => ({
      reports: s.reports.map((r) =>
        r.id === reportId ? { ...r, status: 'SUBMITTED' as const, submissionDate: now } : r
      ),
    }));
    get().logMutation(get().currentUser.name, 'REPORT_SUBMITTED', 'REPORT', reportId, `Report ${reportId} marked as submitted via official channel.`);
  },

  updateFinding: (findingId, updates) => {
    set((s) => ({
      auditFindings: s.auditFindings.map((f) => (f.id === findingId ? { ...f, ...updates } : f)),
    }));
    get().logMutation(get().currentUser.name, 'FINDING_UPDATED', 'AUDIT', findingId, `Finding ${findingId} updated.`);
  },

  addFindingCAPA: (findingId, capaText) => {
    set((s) => ({
      auditFindings: s.auditFindings.map((f) =>
        f.id === findingId
          ? {
              ...f,
              remediationSummary: f.remediationSummary ? `${f.remediationSummary}\nCAPA: ${capaText}` : `CAPA: ${capaText}`,
              status: 'REMEDIATED' as const,
            }
          : f
      ),
    }));
    get().logMutation(get().currentUser.name, 'FINDING_CAPA_ADDED', 'AUDIT', findingId, `CAPA added for finding ${findingId}.`);
  },

  releaseLegalHold: (holdId, approver) => {
    const now = new Date().toISOString();
    set((s) => ({
      legalHolds: s.legalHolds.map((h) =>
        h.id === holdId ? { ...h, status: 'RELEASED' as const, releasedAt: now, releasedBy: approver } : h
      ),
    }));
    get().logMutation(approver, 'LEGAL_HOLD_RELEASED', 'EVIDENCE', holdId, `Legal hold ${holdId} released by ${approver}.`);
  },

  fulfilAuditRequest: (requestId) => {
    set((s) => ({
      auditRequests: s.auditRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'FULFILLED' as const } : r
      ),
    }));
    get().logMutation(get().currentUser.name, 'AUDIT_REQUEST_FULFILLED', 'AUDIT', requestId, `Audit request ${requestId} marked as fulfilled.`);
  },

  resolveDataQualityAlert: (alertId) => {
    set((s) => ({
      dataQualityAlerts: s.dataQualityAlerts.map((a) =>
        a.id === alertId ? { ...a, status: 'RESOLVED' as const } : a
      ),
    }));
    get().logMutation(get().currentUser.name, 'DATA_QUALITY_ALERT_RESOLVED', 'INTEGRATION', alertId, `Data quality alert ${alertId} resolved.`);
  },

  addOutsourcingRegisterEntry: (entry) => {
    set((s) => ({
      cyber: {
        ...s.cyber,
        outsourcingRegister: [entry, ...s.cyber.outsourcingRegister],
      },
    }));
    get().logMutation(get().currentUser.name, 'OUTSOURCING_ENTRY_ADDED', 'CYBER', entry.id, `Outsourcing register entry ${entry.serviceName} added.`);
  },

  toggleCyberChecklistItem: (itemId) => {
    set((s) => ({
      cyber: {
        ...s.cyber,
        cyberChecklist: s.cyber.cyberChecklist.map((c) =>
          c.id === itemId
            ? { ...c, status: c.status === 'COMPLIANT' ? ('PARTIAL' as const) : ('COMPLIANT' as const) }
            : c
        ),
      },
    }));
    get().logMutation(get().currentUser.name, 'CYBER_CHECKLIST_TOGGLED', 'CYBER', itemId, `Cyber checklist item ${itemId} updated.`);
  },

  updateNotificationSettings: (settings) => {
    set((s) => ({
      adminState: {
        ...s.adminState,
        notificationSettings: {
          ...s.adminState.notificationSettings,
          ...settings,
        },
      },
    }));
    get().logMutation(get().currentUser.name, 'NOTIFICATION_SETTINGS_UPDATED', 'ADMIN', 'CONFIG', 'Notification preferences updated.');
  },

  updateSecuritySettings: (settings) => {
    set((s) => ({
      adminState: {
        ...s.adminState,
        securitySettings: {
          ...s.adminState.securitySettings,
          ...settings,
        },
      },
    }));
    get().logMutation(get().currentUser.name, 'SECURITY_SETTINGS_UPDATED', 'ADMIN', 'CONFIG', 'System security settings updated.');
  },
}));

// Selector Hooks per slice
export const useCurrentUser = () => useAppStore((s) => s.currentUser);
export const useControls = () => useAppStore((s) => s.controls);
export const useIncidents = () => useAppStore((s) => s.incidents);
export const useCases = () => useAppStore((s) => s.cases);
export const useObligations = () => useAppStore((s) => s.obligations);
export const useTasks = () => useAppStore((s) => s.tasks);
export const useComplaints = () => useAppStore((s) => s.complaints);
export const useEvidence = () => useAppStore((s) => s.evidence);
export const useGovernance = () => useAppStore((s) => s.governance);
export const useVendors = () => useAppStore((s) => s.vendors);
export const useCyber = () => useAppStore((s) => s.cyber);
export const useClients = () => useAppStore((s) => s.clients);
export const useReports = () => useAppStore((s) => s.reports);
export const useIntegrations = () => useAppStore((s) => s.integrations);
export const useConnectorCatalogue = () => useAppStore((s) => s.connectorCatalogue);
export const useImportHistory = () => useAppStore((s) => s.importHistory);
export const useDataQualityAlerts = () => useAppStore((s) => s.dataQualityAlerts);
export const useNotifications = () => useAppStore((s) => s.notifications);
export const useAIInvestigations = () => useAppStore((s) => s.aiInvestigations);
export const useRegulations = () => useAppStore((s) => s.regulations);
export const useApprovals = () => useAppStore((s) => s.approvals);
export const useAssistant = () => useAppStore((s) => s.assistant);
export const useMetrics = () => useAppStore((s) => s.metrics);
export const useAdminState = () => useAppStore((s) => s.adminState);
export const useActivityLog = () => useAppStore((s) => s.activityLog);
export const useSidebarCollapsed = () => useAppStore((s) => s.sidebarCollapsed);

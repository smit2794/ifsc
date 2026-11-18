// src/data/admin.data.ts
import {
  AdminUserItem,
  PolicyDocumentItem,
  AuditLogRow,
  RetentionRuleItem,
  SecuritySettingConfig,
  NotificationSettingConfig,
  AccessHistoryRow,
  ChangeApprovalHistoryRow,
} from '../types/admin';
import { daysAgo, hoursAgo, minutesAgo } from '../utils/dateHelpers';
import { computeNextHash } from '../utils/auditChain';

// Exactly 5 admin users
export const SEED_ADMIN_USERS: AdminUserItem[] = [
  {
    id: 'USR-001',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@meridian-ifsc.in',
    role: 'Compliance Officer',
    department: 'Compliance',
    status: 'ACTIVE',
    mfaEnabled: true,
    lastLoginIST: 'Today, 10:45 IST',
    permissionsCount: 28,
  },
  {
    id: 'USR-002',
    name: 'Rohan Desai',
    email: 'rohan.desai@meridian-ifsc.in',
    role: 'Principal Officer',
    department: 'Executive Governance',
    status: 'ACTIVE',
    mfaEnabled: true,
    lastLoginIST: 'Today, 09:30 IST',
    permissionsCount: 36,
  },
  {
    id: 'USR-003',
    name: 'Priya Nair',
    email: 'priya.nair@meridian-ifsc.in',
    role: 'Risk Officer',
    department: 'Risk Management',
    status: 'ACTIVE',
    mfaEnabled: true,
    lastLoginIST: 'Today, 10:15 IST',
    permissionsCount: 24,
  },
  {
    id: 'USR-004',
    name: 'Vikram Shah',
    email: 'vikram.shah@meridian-ifsc.in',
    role: 'Chief Information Security Officer',
    department: 'Information Security',
    status: 'ACTIVE',
    mfaEnabled: true,
    lastLoginIST: 'Today, 08:50 IST',
    permissionsCount: 32,
  },
  {
    id: 'USR-005',
    name: 'Deepa Patel',
    email: 'deepa.patel@meridian-ifsc.in',
    role: 'Trading Desk Officer',
    department: 'Trading Operations',
    status: 'ACTIVE',
    mfaEnabled: true,
    lastLoginIST: 'Today, 09:10 IST',
    permissionsCount: 16,
  },
];

// 12 Policies
export const SEED_POLICIES: PolicyDocumentItem[] = [
  { id: 'POL-001', code: 'POL-GOV-001', title: 'Principal and Compliance Officer Segregation of Duties Policy', category: 'Governance', version: 'v3.0', effectiveDate: '2023-04-01', reviewCadence: 'ANNUAL', status: 'ACTIVE', owner: 'Aarav Mehta', approver: 'Rohan Desai' },
  { id: 'POL-002', code: 'POL-SEC-001', title: 'Information Security and Cryptographic Key Management Architecture', category: 'Cyber Security', version: 'v2.4', effectiveDate: '2023-02-15', reviewCadence: 'ANNUAL', status: 'ACTIVE', owner: 'Vikram Shah', approver: 'Rohan Desai' },
  { id: 'POL-003', code: 'POL-AML-001', title: 'Anti-Money Laundering, CFT and Beneficial Ownership Due Diligence Policy', category: 'Compliance', version: 'v4.1', effectiveDate: '2023-01-20', reviewCadence: 'ANNUAL', status: 'ACTIVE', owner: 'Aarav Mehta', approver: 'Rohan Desai' },
  { id: 'POL-004', code: 'POL-TRD-001', title: 'Algorithmic Trading Risk Management and DMA Collar Guidelines', category: 'Trading Desk', version: 'v2.1', effectiveDate: '2023-06-10', reviewCadence: 'ANNUAL', status: 'ACTIVE', owner: 'Deepa Patel', approver: 'Vikram Shah' },
  { id: 'POL-005', code: 'POL-RSK-001', title: 'Base Minimum Capital and Client Fund Segregation Policy', category: 'Risk Management', version: 'v3.2', effectiveDate: '2022-12-05', reviewCadence: 'ANNUAL', status: 'ACTIVE', owner: 'Priya Nair', approver: 'Rohan Desai' },
  { id: 'POL-006', code: 'POL-OUT-001', title: 'Material and Non-Core IT Cloud Outsourcing Policy', category: 'Risk Management', version: 'v2.0', effectiveDate: '2023-03-22', reviewCadence: 'ANNUAL', status: 'ACTIVE', owner: 'Priya Nair', approver: 'Rohan Desai' },
  { id: 'POL-007', code: 'POL-GLT-001', title: 'Technical Glitch Escalation, Incident Response and Statutory Reporting Policy', category: 'Cyber Security', version: 'v1.4', effectiveDate: '2024-03-01', reviewCadence: 'ANNUAL', status: 'ACTIVE', owner: 'Vikram Shah', approver: 'Aarav Mehta' },
  { id: 'POL-008', code: 'POL-BCP-001', title: 'Business Continuity Management and Disaster Recovery Drill Policy', category: 'Cyber Security', version: 'v2.2', effectiveDate: '2023-07-15', reviewCadence: 'ANNUAL', status: 'ACTIVE', owner: 'Vikram Shah', approver: 'Rohan Desai' },
  { id: 'POL-009', code: 'POL-RET-001', title: '8-Year WORM Storage and Electronic Record Disposition Policy', category: 'Compliance', version: 'v1.8', effectiveDate: '2022-04-18', reviewCadence: 'ANNUAL', status: 'ACTIVE', owner: 'Vikram Shah', approver: 'Aarav Mehta' },
  { id: 'POL-010', code: 'POL-CMP-001', title: 'Investor Protection, Complaint Handling and 30-Day SLA Redressal Policy', category: 'Compliance', version: 'v2.5', effectiveDate: '2022-10-15', reviewCadence: 'ANNUAL', status: 'ACTIVE', owner: 'Aarav Mehta', approver: 'Rohan Desai' },
  { id: 'POL-011', code: 'POL-ETH-001', title: 'Employee Personal Securities Dealing and Conflict of Interest Policy', category: 'Governance', version: 'v3.1', effectiveDate: '2023-05-01', reviewCadence: 'ANNUAL', status: 'ACTIVE', owner: 'Aarav Mehta', approver: 'Rohan Desai' },
  { id: 'POL-012', code: 'POL-AUD-001', title: 'External Statutory Compliance Audit Facilitation Policy', category: 'Governance', version: 'v1.6', effectiveDate: '2022-11-01', reviewCadence: 'BIENNIAL', status: 'ACTIVE', owner: 'Aarav Mehta', approver: 'Rohan Desai' },
];

// 60 Audit-Log Rows (Cryptographic Hash Chain)
export const SEED_AUDIT_LOG_ROWS: AuditLogRow[] = (() => {
  const rows: AuditLogRow[] = [];
  const actors: Array<AdminUserItem['name'] | 'SYSTEM'> = ['Aarav Mehta', 'Rohan Desai', 'Priya Nair', 'Vikram Shah', 'Deepa Patel', 'SYSTEM'];
  const actions = [
    'EVALUATE_CONTROL',
    'UPDATE_SETTING',
    'SIGN_OFF_OBLIGATION',
    'SEAL_EVIDENCE_DOCUMENT',
    'TRIAGE_CASE',
    'RECORD_GLITCH_TELEMETRY',
    'VERIFY_HASH_CHAIN',
    'REVIEW_VENDOR_DOCKET',
  ];

  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < 60; i++) {
    const actor = actors[i % actors.length];
    const action = actions[i % actions.length];
    const entityId = `ENT-${(2000 + i).toString()}`;
    const timestamp = hoursAgo(60 - i).toISOString();
    const payload = `${actor}|${action}|${entityId}|${timestamp}`;
    const currentHash = computeNextHash(prevHash, payload);

    rows.push({
      id: `LOG-${(1000 + i).toString()}`,
      timestamp,
      actor,
      action,
      targetEntity: action.split('_')[1] || 'GENERAL',
      entityId,
      details: `Cryptographic audit ledger receipt verified for action ${action} by ${actor}.`,
      ipAddress: `10.14.40.${100 + (i % 25)}`,
      currentHash,
      previousHash: prevHash,
    });

    prevHash = currentHash;
  }

  return rows.reverse(); // Newest first
})();

// 8 Data Retention Rules
export const SEED_RETENTION_RULES: RetentionRuleItem[] = [
  { id: 'RET-001', category: 'Trade Orders & Execution Logs', recordType: 'FIX Messages & Drop-Copy Feeds', retentionYears: 8, statutoryBasis: 'IFSCA CMI Reg. 16 (8-Year Rule)', storageTier: 'Immutable WORM Vault', enforcementMode: 'AUTOMATED_LEGAL_HOLD_CHECK' },
  { id: 'RET-002', category: 'Telephone Voice Recordings', recordType: 'Trading Room Dealer Audio Files', retentionYears: 8, statutoryBasis: 'IFSCA CMI Reg. 16', storageTier: 'Immutable WORM Vault', enforcementMode: 'AUTOMATED_LEGAL_HOLD_CHECK' },
  { id: 'RET-003', category: 'Client KYC & Account Opening', recordType: 'Certified Identity & Beneficial Ownership Dossiers', retentionYears: 10, statutoryBasis: 'PMLA 2002 & IFSCA AML Norms', storageTier: 'Immutable WORM Vault', enforcementMode: 'MANUAL_DISPOSITION_APPROVAL' },
  { id: 'RET-004', category: 'Annual Compliance Audits', recordType: 'Deloitte Assurance Reports & Working Papers', retentionYears: 10, statutoryBasis: 'IFSCA CMI Reg. 22', storageTier: 'Cold Archive', enforcementMode: 'MANUAL_DISPOSITION_APPROVAL' },
  { id: 'RET-005', category: 'Technical Glitch Filings', recordType: '1-Hour, T+1, and 14-Day RCA Filing Receipts', retentionYears: 8, statutoryBasis: 'IFSCA Technical Glitch Circular', storageTier: 'Immutable WORM Vault', enforcementMode: 'AUTOMATED_LEGAL_HOLD_CHECK' },
  { id: 'RET-006', category: 'Board Governance Minutes', recordType: 'KMP Appointment Resolutions & Fit & Proper Declarations', retentionYears: 20, statutoryBasis: 'Companies Act & IFSCA General Clauses', storageTier: 'Cold Archive', enforcementMode: 'MANUAL_DISPOSITION_APPROVAL' },
  { id: 'RET-007', category: 'Quarterly Exchange Assurance', recordType: 'Form CMI-Q Regulatory Returns', retentionYears: 8, statutoryBasis: 'Exchange Byelaws Schedule', storageTier: 'Active Operational Store', enforcementMode: 'AUTOMATED_LEGAL_HOLD_CHECK' },
  { id: 'RET-008', category: 'Dispute & Investor Complaints', recordType: 'Grievance Dossiers and Ombudsman Settlement Orders', retentionYears: 8, statutoryBasis: 'Investor Protection Guidelines', storageTier: 'Active Operational Store', enforcementMode: 'MANUAL_DISPOSITION_APPROVAL' },
];

// Security Settings
export const SEED_SECURITY_SETTINGS: SecuritySettingConfig = {
  mandatoryMfa: true,
  sessionTimeoutMinutes: 15,
  ipAllowlistEnabled: true,
  maxFailedAttempts: 3,
  hardwareKeyAllowed: true,
};

// Notification Settings
export const SEED_NOTIFICATION_SETTINGS: NotificationSettingConfig = {
  emailAlerts: true,
  smsUrgentGlitchAlerts: true,
  inAppNotificationSound: false,
  criticalIncidentImmediateDispatch: true,
  dailyDigestTimeIST: '18:30',
};

// 20 Access History Rows (all referencing only the 5 staff members)
export const SEED_ACCESS_HISTORY: AccessHistoryRow[] = [
  { id: 'ACC-001', timestamp: minutesAgo(10).toISOString(), staffName: 'Aarav Mehta', application: 'TrustOps Governance Console', authMethod: 'FIDO2 Hardware Key', status: 'SUCCESS', ipAddress: '10.14.40.110' },
  { id: 'ACC-002', timestamp: minutesAgo(25).toISOString(), staffName: 'Vikram Shah', application: 'Perimeter Firewall Admin', authMethod: 'FIDO2 Hardware Key', status: 'SUCCESS', ipAddress: '10.14.40.105' },
  { id: 'ACC-003', timestamp: minutesAgo(40).toISOString(), staffName: 'Deepa Patel', application: 'India INX Trading Terminal 01', authMethod: 'WebAuthn Token', status: 'SUCCESS', ipAddress: '10.14.40.101' },
  { id: 'ACC-004', timestamp: hoursAgo(1).toISOString(), staffName: 'Priya Nair', application: 'Client Escrow Banking Portal', authMethod: 'FIDO2 Hardware Key', status: 'SUCCESS', ipAddress: '10.14.40.115' },
  { id: 'ACC-005', timestamp: hoursAgo(2).toISOString(), staffName: 'Rohan Desai', application: 'TrustOps Governance Console', authMethod: 'FIDO2 Hardware Key', status: 'SUCCESS', ipAddress: '10.14.40.120' },
  { id: 'ACC-006', timestamp: hoursAgo(3).toISOString(), staffName: 'Aarav Mehta', application: 'WORM Evidence Vault', authMethod: 'FIDO2 Hardware Key', status: 'SUCCESS', ipAddress: '10.14.40.110' },
  { id: 'ACC-007', timestamp: hoursAgo(4).toISOString(), staffName: 'Deepa Patel', application: 'Okta Identity Portal', authMethod: 'TOTP Authenticator', status: 'SUCCESS', ipAddress: '10.14.40.101' },
  { id: 'ACC-008', timestamp: hoursAgo(5).toISOString(), staffName: 'Vikram Shah', application: 'Core Switch SSH Console', authMethod: 'Hardware Certificate', status: 'SUCCESS', ipAddress: '10.14.40.105' },
  { id: 'ACC-009', timestamp: hoursAgo(6).toISOString(), staffName: 'Priya Nair', application: 'Risk Analytics Modeling Server', authMethod: 'FIDO2 Hardware Key', status: 'SUCCESS', ipAddress: '10.14.40.115' },
  { id: 'ACC-010', timestamp: hoursAgo(7).toISOString(), staffName: 'Rohan Desai', application: 'Board Regulatory Repository', authMethod: 'FIDO2 Hardware Key', status: 'SUCCESS', ipAddress: '10.14.40.120' },
  { id: 'ACC-011', timestamp: hoursAgo(8).toISOString(), staffName: 'Deepa Patel', application: 'NSE IX FIX Terminal', authMethod: 'WebAuthn Token', status: 'SUCCESS', ipAddress: '10.14.40.101' },
  { id: 'ACC-012', timestamp: hoursAgo(9).toISOString(), staffName: 'Aarav Mehta', application: 'FATF Sanction Screening Engine', authMethod: 'FIDO2 Hardware Key', status: 'SUCCESS', ipAddress: '10.14.40.110' },
  { id: 'ACC-013', timestamp: hoursAgo(10).toISOString(), staffName: 'Vikram Shah', application: 'Telemetry Engine Host', authMethod: 'SSH Key + MFA', status: 'SUCCESS', ipAddress: '10.14.40.105' },
  { id: 'ACC-014', timestamp: hoursAgo(12).toISOString(), staffName: 'Priya Nair', application: 'Margin Reconciliations DB', authMethod: 'FIDO2 Hardware Key', status: 'SUCCESS', ipAddress: '10.14.40.115' },
  { id: 'ACC-015', timestamp: hoursAgo(14).toISOString(), staffName: 'Rohan Desai', application: 'TrustOps Governance Console', authMethod: 'FIDO2 Hardware Key', status: 'SUCCESS', ipAddress: '10.14.40.120' },
  { id: 'ACC-016', timestamp: hoursAgo(16).toISOString(), staffName: 'Deepa Patel', application: 'Trading Terminal 02 (Standby)', authMethod: 'WebAuthn Token', status: 'SUCCESS', ipAddress: '10.14.40.102' },
  { id: 'ACC-017', timestamp: hoursAgo(18).toISOString(), staffName: 'Vikram Shah', application: 'Disaster Recovery Gateway Console', authMethod: 'Hardware Token', status: 'SUCCESS', ipAddress: '10.14.40.105' },
  { id: 'ACC-018', timestamp: hoursAgo(20).toISOString(), staffName: 'Aarav Mehta', application: 'TrustOps Governance Console', authMethod: 'FIDO2 Hardware Key', status: 'SUCCESS', ipAddress: '10.14.40.110' },
  { id: 'ACC-019', timestamp: daysAgo(1).toISOString(), staffName: 'Priya Nair', application: 'TrustOps Governance Console', authMethod: 'FIDO2 Hardware Key', status: 'SUCCESS', ipAddress: '10.14.40.115' },
  { id: 'ACC-020', timestamp: daysAgo(1).toISOString(), staffName: 'Rohan Desai', application: 'TrustOps Governance Console', authMethod: 'FIDO2 Hardware Key', status: 'SUCCESS', ipAddress: '10.14.40.120' },
];

// 15 Change Approval History Rows (all referencing only the 5 staff members)
export const SEED_CHANGE_APPROVALS: ChangeApprovalHistoryRow[] = [
  { id: 'CHG-001', requestedAt: hoursAgo(18).toISOString(), changeType: 'IAM Role Revocation', targetEntity: 'Okta Group IAM-GRP-COMPLIANCE-REVIEW', requestedBy: 'Deepa Patel', approvedBy: 'Rohan Desai', status: 'APPROVED', signoffVerificationCode: '849201' },
  { id: 'CHG-002', requestedAt: daysAgo(1).toISOString(), changeType: 'Incident Filing Clearance', targetEntity: 'INC-2026-014 14-Day RCA Report', requestedBy: 'Vikram Shah', approvedBy: 'Rohan Desai', status: 'APPROVED', signoffVerificationCode: '310492' },
  { id: 'CHG-003', requestedAt: daysAgo(4).toISOString(), changeType: 'Glitch Preliminary Report Attestation', targetEntity: 'INC-2026-014 T+1 Filing', requestedBy: 'Vikram Shah', approvedBy: 'Aarav Mehta', status: 'APPROVED', signoffVerificationCode: '918273' },
  { id: 'CHG-004', requestedAt: daysAgo(5).toISOString(), changeType: 'Glitch 1-Hour Notice Attestation', targetEntity: 'INC-2026-014 Notice N1', requestedBy: 'Aarav Mehta', approvedBy: 'Rohan Desai', status: 'APPROVED', signoffVerificationCode: '582019' },
  { id: 'CHG-005', requestedAt: daysAgo(6).toISOString(), changeType: 'Regulation Change Proposal Approval', targetEntity: 'PROP-CMI-9(2)', requestedBy: 'Aarav Mehta', approvedBy: 'Rohan Desai', status: 'APPROVED', signoffVerificationCode: '492810' },
  { id: 'CHG-006', requestedAt: daysAgo(10).toISOString(), changeType: 'Firewall Rule Policy Update', targetEntity: 'Perimeter Rule PRM-FW-044', requestedBy: 'Vikram Shah', approvedBy: 'Aarav Mehta', status: 'APPROVED', signoffVerificationCode: '204918' },
  { id: 'CHG-007', requestedAt: daysAgo(15).toISOString(), changeType: 'Client Net-Worth Limit Adjustment', targetEntity: 'CLT-***-901 Margin Cap', requestedBy: 'Priya Nair', approvedBy: 'Rohan Desai', status: 'APPROVED', signoffVerificationCode: '719283' },
  { id: 'CHG-008', requestedAt: daysAgo(20).toISOString(), changeType: 'Q2 Compliance Assurance Attestation', targetEntity: 'RPT-2026-QTR-02', requestedBy: 'Aarav Mehta', approvedBy: 'Rohan Desai', status: 'APPROVED', signoffVerificationCode: '394820' },
  { id: 'CHG-009', requestedAt: daysAgo(25).toISOString(), changeType: 'DMA Algorithm Configuration Update', targetEntity: 'ALG-USDINR-04 Collar', requestedBy: 'Deepa Patel', approvedBy: 'Vikram Shah', status: 'APPROVED', signoffVerificationCode: '610294' },
  { id: 'CHG-010', requestedAt: daysAgo(30).toISOString(), changeType: 'Vendor Contract SLA Amendment', targetEntity: 'CloudScale SLA Renewal', requestedBy: 'Priya Nair', approvedBy: 'Rohan Desai', status: 'APPROVED', signoffVerificationCode: '859302' },
  { id: 'CHG-011', requestedAt: daysAgo(40).toISOString(), changeType: 'KMP Fit and Proper Person Attestation', targetEntity: 'Annual Board Docket 2026', requestedBy: 'Aarav Mehta', approvedBy: 'Rohan Desai', status: 'APPROVED', signoffVerificationCode: '104928' },
  { id: 'CHG-012', requestedAt: daysAgo(45).toISOString(), changeType: 'Disaster Recovery Drill Scope', targetEntity: 'H2 BCP Live Trading Test', requestedBy: 'Vikram Shah', approvedBy: 'Rohan Desai', status: 'APPROVED', signoffVerificationCode: '492019' },
  { id: 'CHG-013', requestedAt: daysAgo(50).toISOString(), changeType: 'Deloitte Compliance Audit Report Clearance', targetEntity: 'FY25 Final Assurance Filing', requestedBy: 'Aarav Mehta', approvedBy: 'Rohan Desai', status: 'APPROVED', signoffVerificationCode: '729104' },
  { id: 'CHG-014', requestedAt: daysAgo(60).toISOString(), changeType: 'Surveillance Red-Flag Rule Exemption', targetEntity: 'Hedging Exemption CLT-***-906', requestedBy: 'Deepa Patel', approvedBy: 'Aarav Mehta', status: 'APPROVED', signoffVerificationCode: '930192' },
  { id: 'CHG-015', requestedAt: daysAgo(90).toISOString(), changeType: 'Legal Hold Preservation Order Clearance', targetEntity: 'LH-2026-001 Creation', requestedBy: 'Aarav Mehta', approvedBy: 'Rohan Desai', status: 'APPROVED', signoffVerificationCode: '583920' },
];

// src/types/admin.ts
import { StaffName, StaffId, StaffRole } from './user';

export interface AdminUserItem {
  id: StaffId;
  name: StaffName;
  email: string;
  role: StaffRole;
  department: string;
  status: 'ACTIVE' | 'SUSPENDED';
  mfaEnabled: boolean;
  lastLoginIST: string;
  permissionsCount: number;
}

export interface PolicyDocumentItem {
  id: string;
  code: string;
  title: string;
  category: 'Governance' | 'Risk Management' | 'Cyber Security' | 'Trading Desk' | 'Compliance';
  version: string;
  effectiveDate: string;
  reviewCadence: 'ANNUAL' | 'BIENNIAL';
  status: 'ACTIVE' | 'UNDER_REVISION';
  owner: StaffName;
  approver: StaffName;
}

export interface AuditLogRow {
  id: string;
  timestamp: string;
  actor: StaffName | 'SYSTEM';
  action: string;
  targetEntity: string;
  entityId: string;
  details: string;
  ipAddress: string;
  currentHash: string;
  previousHash: string; // Cryptographic hash chain
}

export interface RetentionRuleItem {
  id: string;
  category: string;
  recordType: string;
  retentionYears: number;
  statutoryBasis: string;
  storageTier: 'Immutable WORM Vault' | 'Cold Archive' | 'Active Operational Store';
  enforcementMode: 'AUTOMATED_LEGAL_HOLD_CHECK' | 'MANUAL_DISPOSITION_APPROVAL';
}

export interface SecuritySettingConfig {
  mandatoryMfa: boolean;
  sessionTimeoutMinutes: number;
  ipAllowlistEnabled: boolean;
  maxFailedAttempts: number;
  hardwareKeyAllowed: boolean;
}

export interface NotificationSettingConfig {
  emailAlerts: boolean;
  smsUrgentGlitchAlerts: boolean;
  inAppNotificationSound: boolean;
  criticalIncidentImmediateDispatch: boolean;
  dailyDigestTimeIST: string;
}

export interface AccessHistoryRow {
  id: string;
  timestamp: string;
  staffName: StaffName;
  application: string;
  authMethod: string;
  status: 'SUCCESS' | 'MFA_REQUIRED' | 'DENIED';
  ipAddress: string;
}

export interface ChangeApprovalHistoryRow {
  id: string;
  requestedAt: string;
  changeType: string;
  targetEntity: string;
  requestedBy: StaffName;
  approvedBy: StaffName;
  status: 'APPROVED' | 'REJECTED';
  signoffVerificationCode: string;
}

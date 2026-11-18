// src/types/evidence.ts
import { StaffName } from './user';
import { HashStatus } from '../design/tokens';
import { SeverityLevel } from '../design/tokens';

export type EvidenceCategory =
  | 'Governance & Appointments'
  | 'Trade Operations & Logs'
  | 'Cyber & IT Infrastructure'
  | 'Financial Reconciliations'
  | 'Statutory Submissions'
  | 'Inspection Dossiers';

export interface EvidenceItem {
  id: string;
  title: string;
  category: EvidenceCategory;
  fileName: string;
  fileSize: string;
  hash: string;
  hashStatus: HashStatus;
  uploadedAt: string;
  uploadedBy: StaffName;
  retentionBasis: string;
  retentionYears: number;
  linkedControlId?: string;
  linkedObligationId?: string;
  linkedCaseId?: string;
  legalHoldId?: string;
  legalHold?: boolean;
  watermarkText?: string;
}

export interface LegalHoldItem {
  id: string;
  title?: string;
  evidenceId?: string;
  caseReference?: string;
  matterReference?: string;
  status: 'ACTIVE' | 'RELEASED';
  appliedAt?: string;
  appliedBy?: StaffName;
  issuedAt?: string;
  issuedBy?: StaffName;
  releasedAt?: string;
  releasedBy?: StaffName;
  reason: string;
  evidenceCount?: number;
}

export interface AuditRequestItem {
  id: string;
  title: string;
  auditor: string;
  period: string;
  requestedDate: string;
  dueDate: string;
  status: 'OPEN' | 'PARTIALLY_FULFILLED' | 'FULFILLED';
  owner: StaffName;
  evidenceItemsCount: number;
}

export interface AuditFindingItem {
  id: string;
  code: string;
  title: string;
  severity: SeverityLevel;
  status: 'OPEN' | 'REMEDIATED' | 'ACCEPTED_RISK';
  controlId?: string;
  linkedControlId?: string;
  owner?: StaffName;
  remediationSummary?: string;
  recommendation?: string;
  targetRemediationDate?: string;
  detectedDate?: string;
  sourceAudit?: string;
}

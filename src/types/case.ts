// src/types/case.ts
import { StaffName, StaffId } from './user';
import { CaseState, Severity } from './common';

export type CaseStatus = CaseState;
export type { CaseState };

export interface CaseTimelineEntry {
  id: string;
  timestamp: string;
  actor: StaffName | 'SYSTEM';
  action: string;
  detail?: string;
}

export interface CaseItem {
  id: string;
  title: string;
  severity: Severity;
  status: CaseState;
  linkedControlId?: string;
  linkedIncidentId?: string;
  owner: StaffName;
  ownerId: StaffId;
  maker: StaffName;
  reviewer?: StaffName;
  approver?: StaffName;
  createdAt: string;
  closedAt?: string;
  description: string;
  remediationPlan?: string;
  remediationEvidenceId?: string;
  timeline: CaseTimelineEntry[];
}

// src/types/obligation.ts
import { StaffName, StaffId } from './user';

export type ObligationCategory =
  | 'Governance & Officers'
  | 'Financial & Capital'
  | 'Reporting & Filings'
  | 'Cyber & Operations'
  | 'Client & Conduct';

export type ObligationStatus =
  | 'COMPLIANT'
  | 'UPCOMING'
  | 'DUE_TODAY'
  | 'OVERDUE'
  | 'UNDER_REVIEW';

export type ObligationFrequency =
  | 'ANNUAL'
  | 'QUARTERLY'
  | 'MONTHLY'
  | 'DAILY'
  | 'EVENT_DRIVEN'
  | 'CONTINUOUS';

export interface ObligationItem {
  id: string;
  code: string;
  title: string;
  category: ObligationCategory;
  status: ObligationStatus;
  criticalObligation: boolean; // if true, requires 2 maker-checker sign-offs
  dueDate: string;
  frequency: ObligationFrequency;
  owner: StaffName;
  ownerId: StaffId;
  maker: StaffName;
  approver?: StaffName;
  checkerApprover?: StaffName;
  statutoryReference: string;
  linkedRegulationId: string;
  description: string;
  lastFiledDate?: string;
  evidenceCount: number;
}

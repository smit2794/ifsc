// src/types/report.ts
import { StaffName } from './user';
import { FilingStatus } from './common';

export type ReportCategory =
  | 'QUARTERLY_ASSURANCE'
  | 'ANNUAL_COMPLIANCE_AUDIT'
  | 'ANNUAL_SYSTEM_AUDIT'
  | 'TECHNICAL_GLITCH_REPORT'
  | 'REGULATORY_NOTIFICATION'
  | 'OFFICER_CHANGE_FILING';

export type ReportFilingState = FilingStatus;
export type { FilingStatus };

export interface ReportTemplateItem {
  id: string;
  code: string;
  name: string;
  category: ReportCategory;
  frequency: string;
  governingRegulation: string;
  statutoryForm: string;
  deadlineRule: string;
  defaultApprover: StaffName;
}

export interface ReportInstanceItem {
  id: string;
  templateId: string;
  title: string;
  category: ReportCategory;
  period: string;
  dueDate: string;
  status: FilingStatus;
  preparedBy: StaffName;
  approver?: StaffName;
  secondApprover?: StaffName;
  submissionDate?: string;
  acknowledgmentRef?: string;
  hash: string;
  linkedIncidentId?: string;
}

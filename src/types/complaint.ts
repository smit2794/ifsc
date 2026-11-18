// src/types/complaint.ts
import { StaffName, StaffId } from './user';
import { ComplaintState } from './common';

export type { ComplaintState };
export type ComplaintStatus = ComplaintState;

export type ComplaintCategory =
  | 'Order Execution'
  | 'Settlement & Funds'
  | 'Billing & Fee Charges'
  | 'KYC & Onboarding'
  | 'Unauthorized Trades';

export interface RetailComplaintClocks {
  acknowledgementDaysRemaining?: number; // 3 working days
  nonAcceptanceDaysRemaining?: number;   // 5 working days
  disposalTargetDaysRemaining?: number;  // 15 days
  ordinaryMaxDaysRemaining?: number;     // 30 days
}

export interface ComplaintItem {
  id: string;
  clientName: string;
  clientId: string;
  category: ComplaintCategory;
  status: ComplaintState;
  type: 'RETAIL' | 'INSTITUTIONAL';
  isRetail: boolean;
  classificationConfirmed: boolean;
  classificationConfirmedAt?: string;
  filedDate: string;
  ageDays: number;
  retailClocks?: RetailComplaintClocks;
  owner: StaffName;
  ownerId: StaffId;
  summary: string;
  resolutionSummary?: string;
  remedialAction?: string;
  croConflict?: boolean;
  croConflictReason?: string;
}

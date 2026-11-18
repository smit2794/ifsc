// src/types/vendor.ts
import { StaffName } from './user';
import { SeverityLevel } from '../design/tokens';

export type DueDiligenceState = 'CURRENT' | 'UNDER_REVIEW' | 'EXPIRING_SOON' | 'NON_COMPLIANT';

export interface VendorItem {
  id: string;
  name: string;
  category: 'Cloud Infrastructure' | 'Trading System' | 'Market Data' | 'Legal & Audit' | 'Security Operations';
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  riskRating: SeverityLevel;
  dueDiligenceStatus: DueDiligenceState;
  contractEndDate: string;
  nextReassessmentDate: string;
  slaAdherencePercent: number;
  dataLocation: 'GIFT IFSC On-Premise' | 'India Domestic' | 'Cross-Border Cloud';
  primaryContact: string;
  owner: StaffName;
  annualSpendUsd: number;
}

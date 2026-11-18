// src/types/client.ts
import { StaffName } from './user';
import { SeverityLevel } from '../design/tokens';

export type KYCStatus = 'VERIFIED' | 'RE_KYC_DUE' | 'PENDING_DOCUMENTS' | 'RESTRICTED';

export type ClientCategory = 'Institutional Broker Dealer' | 'Corporate Treasury' | 'Eligible Foreign Investor' | 'HNW Individual';

export interface ClientItem {
  id: string;
  maskedId: string;
  legalName: string;
  category: ClientCategory;
  countryOfIncorporation: string;
  riskRating: SeverityLevel;
  kycStatus: KYCStatus;
  lastKycDate: string;
  nextReviewDate: string;
  activeScreeningAlerts: number;
  relationshipOfficer: StaffName;
  annualTurnoverUsd: number;
  documentsSealedCount: number;
}

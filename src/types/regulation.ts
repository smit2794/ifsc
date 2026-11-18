// src/types/regulation.ts
import { StaffName } from './user';

export interface RegulationSourceItem {
  id: string; // S1 through S12
  code: string;
  title: string;
  issuer: 'IFSCA' | 'SEBI' | 'GIFT City Authority' | 'India International Exchange';
  promulgationDate: string;
  version: string;
  documentHash: string;
  totalClauses: number;
  summary: string;
}

export type ProposalReviewStage = 'PROPOSED' | 'LEGAL_REVIEW' | 'CO_APPROVED' | 'ACTIVE';

export interface RegulationChangeProposalItem {
  id: string;
  proposalRef: string;
  sourceId: string;
  clauseTitle: string;
  stage: ProposalReviewStage;
  submittedBy: StaffName;
  legalReviewer?: StaffName;
  approver?: StaffName;
  effectiveDate: string;
  originalText: string;
  amendedText: string;
  businessImpactSummary: string;
}

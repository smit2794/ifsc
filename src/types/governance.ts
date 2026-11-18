// src/types/governance.ts
import { StaffName, StaffId, StaffRole } from './user';
import { ChecklistStatus } from '../components/ui/ChecklistItem';

export interface OfficerCardData {
  id: StaffId;
  name: StaffName;
  role: StaffRole;
  appointedSince: string;
  residencyStatus: 'Resident Indian in GIFT IFSC' | 'GIFT City Special Economic Zone';
  qualificationSummary: string;
  regulatoryNISM: string;
  annualCertificationDate: string;
  status: 'ACTIVE' | 'CHANGE_IN_PROGRESS';
  conflictsDisclosed: number;
}

export interface KMPProfile {
  id: StaffId;
  name: StaffName;
  designation: string;
  appointedDate: string;
  dinOrRegistration: string;
  fitAndProperAttested: boolean;
  cessationDate?: string;
}

export interface OrgNode {
  id: StaffId;
  name: StaffName;
  role: string;
  department: string;
  isOfficer?: boolean;
  officerRole?: string;
  children?: OrgNode[];
}

export interface TrainingRecord {
  id: string;
  staffId: StaffId;
  staffName: StaffName;
  moduleTitle: string;
  category: 'AML/CFT' | 'Market Abuse' | 'Cyber Security' | 'SoD & Ethics';
  completedDate: string;
  scorePercent: number;
  validUntil: string;
  status: 'COMPLETED' | 'DUE' | 'EXPIRED';
}

export type { RosterStaffShift } from '../components/ui/RosterGrid';

export interface ConflictOfInterestEntry {
  id: string;
  staffId: StaffId;
  staffName: StaffName;
  entityName: string;
  natureOfHolding: string;
  disclosedDate: string;
  status: 'MITIGATED' | 'UNDER_REVIEW' | 'FLAGGED';
  mitigationProtocol: string;
  reviewedBy: StaffName;
}

export interface GovernanceChecklistItem {
  id: string;
  code: string;
  label: string;
  description: string;
  category: string;
  status: ChecklistStatus;
  attestedBy?: StaffName;
  lastCheckedDate: string;
}

// src/types/approval.ts
import { StaffName } from './user';
import { ApprovalState } from '../components/ui/ApprovalPanel';

export interface ApprovalRecord {
  id: string;
  itemType: 'OBLIGATION' | 'POLICY' | 'CASE_RESOLUTION' | 'INCIDENT_FILING' | 'REGULATION_PROPOSAL' | 'REPORT';
  itemId: string;
  itemTitle: string;
  maker: StaffName;
  assignedApprover?: StaffName;
  secondApprover?: StaffName;
  state: ApprovalState;
  requiredSignoffs: 1 | 2;
  approvedSignoffs: Array<{
    approver: StaffName;
    signedAt: string;
    verificationCode: string;
  }>;
  rejectedReason?: string;
  createdAt: string;
}

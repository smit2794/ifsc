// src/types/common.ts
export type ControlStatus = 'PASS' | 'FAIL' | 'WARNING' | 'UNKNOWN' | 'NOT_APPLICABLE';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type FilingStatus = 'PENDING' | 'DRAFT' | 'SUBMITTED' | 'ACKNOWLEDGED' | 'REJECTED' | 'OVERDUE' | 'IN_PROGRESS';

export type ApprovalState = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type CaseState = 'TRIAGED' | 'OPEN' | 'INVESTIGATING' | 'IN_PROGRESS' | 'REMEDIATION_PROPOSED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';

export type IncidentState = 'OPEN' | 'CONTAINED' | 'RESTORED' | 'RESOLVED' | 'CLOSED';

export type ComplaintState = 'UNCLASSIFIED' | 'OPEN' | 'INVESTIGATING' | 'DISPOSED' | 'CLOSED';

export type IntegrationHealth = 'HEALTHY' | 'WARNING' | 'STALE' | 'ERROR' | 'DISCONNECTED';

export interface ActivityEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
}

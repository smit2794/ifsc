// src/types/cyber.ts
import { StaffName } from './user';
import { SeverityLevel } from '../design/tokens';

export interface ITAssetItem {
  id: string;
  assetTag: string;
  name: string;
  category: 'Server' | 'Network Gateway' | 'Workstation' | 'Security Appliance';
  ipAddress: string;
  location: string;
  owner: StaffName;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  patchStatus: 'CURRENT' | 'PENDING_REBOOT' | 'PATCH_REQUIRED';
}

export interface SystemInventoryItem {
  id: string;
  systemName: string;
  version: string;
  hostingType: 'On-Premise IFSC' | 'Private Cloud' | 'Exchange Gateway';
  drTier: 'Tier 1 (RTO < 15m)' | 'Tier 2 (RTO < 2h)' | 'Tier 3 (RTO < 24h)';
  lastTestedDate: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
}

export interface SecurityRiskItem {
  id: string;
  riskCode: string;
  title: string;
  category: 'Access Control' | 'Data Leakage' | 'Network Disruption' | 'Third-Party Vulnerability';
  inherentRisk: SeverityLevel;
  residualRisk: SeverityLevel;
  mitigationControl: string;
  owner: StaffName;
  status: 'MITIGATED' | 'ACCEPTED' | 'IN_TREATMENT';
}

export interface VulnerabilityItem {
  id: string;
  cveId: string;
  title: string;
  severity: SeverityLevel;
  affectedSystem: string;
  discoveredDate: string;
  remediationDeadline: string;
  status: 'OPEN' | 'REMEDIATED' | 'EXCEPTION_APPROVED';
}

export interface AccessReviewRecord {
  id: string;
  cycleName: string;
  department: string;
  reviewedDate: string;
  reviewedBy: StaffName;
  totalAccountsReviewed: number;
  anomaliesDetected: number;
  revocationsEnforced: number;
  status: 'COMPLETED' | 'IN_PROGRESS';
}

export interface OutsourcingRegisterEntry {
  id: string;
  serviceName: string;
  vendorName: string;
  materiality: 'MATERIAL' | 'NON_MATERIAL';
  regulatoryApprovalObtained: boolean;
  approvalDate?: string;
  governingPolicy: string;
  owner: StaffName;
}

export interface BCPRecord {
  id: string;
  testTitle: string;
  drillType: 'Exchange Outage Drill' | 'Primary Datacenter Failover' | 'Trading Desk Relocation';
  conductedDate: string;
  durationMinutes: number;
  rtoTargetMinutes: number;
  rtoAchievedMinutes: number;
  rpoTargetMinutes: number;
  rpoAchievedMinutes: number;
  result: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  supervisedBy: StaffName;
}

export interface SecurityIncidentHistoryItem {
  id: string;
  incidentRef: string;
  title: string;
  severity: SeverityLevel;
  occurredDate: string;
  containmentTimeMinutes: number;
  reportFiledToCertIn: boolean;
  closureAttestedBy: StaffName;
}

export interface CyberChecklistItem {
  id: string;
  clauseRef: string;
  title: string;
  description: string;
  status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
  verifiedBy: StaffName;
}

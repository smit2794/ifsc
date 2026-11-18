// src/types/incident.ts
import { StaffName, StaffId } from './user';
import { IncidentState, Severity, FilingStatus } from './common';

export type IncidentStatus = IncidentState;
export type { IncidentState, FilingStatus };

export type GlitchClockState = 'RUNNING' | 'MET' | 'LATE' | 'PAUSED';

export interface ClockDetail {
  label: string;
  deadline: string;
  status: GlitchClockState;
  submittedAt?: string;
  lateReason?: string;
}

export type FilingStageType = 'INITIAL_NOTICE' | 'PRELIMINARY_REPORT' | 'RCA_REPORT';

export interface IncidentFilingRecord {
  id: string;
  type: FilingStageType;
  filingNumber: string;
  status: FilingStatus;
  submittedAt?: string;
  acknowledgedAt?: string;
  recipient: string;
  hash: string;
  signatory: StaffName;
}

export interface TechnicalGlitchClocks {
  initialNotice: ClockDetail; // 1 hour
  preliminaryReport: ClockDetail; // T+1 (24 hours)
  rcaReport: ClockDetail; // 14 days
}

export interface IncidentItem {
  id: string;
  title: string;
  severity: Severity;
  status: IncidentState;
  isGlitch: boolean;
  classification?: 'QUALIFYING' | 'NOT_QUALIFYING';
  notQualifyingReason?: string;
  occurredAt: string;
  detectedAt: string;
  restoredAt?: string;
  durationMinutes: number;
  owner: StaffName;
  ownerId: StaffId;
  clocks?: TechnicalGlitchClocks;
  filings: IncidentFilingRecord[];
  description: string;
  impactedSystems: string[];
  rootCause?: string;
  remediation?: string;
  capa?: Array<{ id: string; action: string; owner: StaffName; dueDate: string; status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' }>;
  timeline?: Array<{ id: string; timestamp: string; title: string; actor: StaffName | 'SYSTEM'; details: string }>;
}

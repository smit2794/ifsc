// src/types/control.ts
import { StaffName, StaffId } from './user';
import { ControlStatus } from './common';

export type { ControlStatus };

export type ControlDomain =
  | 'Governance & Staffing'
  | 'Market Operations'
  | 'Cyber & Vendor Risk'
  | 'Financial & Capital'
  | 'Client & AML';

export type ControlFrequency =
  | 'CONTINUOUS'
  | 'HOURLY'
  | 'DAILY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'ANNUAL'
  | 'EVENT';

export interface ControlItem {
  id: string;
  code: string;
  title: string;
  domain: ControlDomain;
  status: ControlStatus;
  frequency: ControlFrequency;
  owner: StaffName;
  ownerId: StaffId;
  connectorDependencies: string[];
  connectorDependency?: string[];
  lastEvaluated: string;
  evidenceCount: number;
  description: string;
  evaluationLogic: string;
  sourceRegulationId: string;
  needsRevaluation?: boolean;
  exceptionDetail?: string;
  remediationPlan?: Array<{ id: string; action: string; owner: StaffName; dueDate: string }>;
  retestDate?: string;
}

export interface ControlEvaluationHistory {
  id: string;
  controlId: string;
  evaluatedAt: string;
  evaluator: 'TELEMETRY_ENGINE' | StaffName;
  status: ControlStatus;
  findingSummary: string;
  telemetrySource: string;
}


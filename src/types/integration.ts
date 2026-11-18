// src/types/integration.ts
import { StaffName } from './user';
import { SeverityLevel } from '../design/tokens';
import { IntegrationHealth } from './common';

export type ConnectorHealthStatus = IntegrationHealth;
export type { IntegrationHealth };

export interface ConnectedSystemItem {
  id: string;
  code: string;
  name: string;
  protocol: 'mTLS REST API' | 'FIX 4.4 Stream' | 'SFTP Encrypted Feed' | 'SCIM 2.0 Directory';
  status: IntegrationHealth;
  lastSyncTimestamp: string;
  recordsSyncedLast24h: number;
  errorRatePercent: number;
  leadEngineer: StaffName;
  staleReason?: string;
  affectedControlsCount: number;
}

export interface ConnectorCatalogueEntry {
  id: string;
  name: string;
  vendor: string;
  category: 'Identity & Access' | 'Core Trading & RMS' | 'Market Feeds' | 'Banking & Custody' | 'Surveillance';
  description: string;
  authMethod: string;
  supportedFormats: string[];
  installed: boolean;
}

export interface ImportHistoryItem {
  id: string;
  connectorId: string;
  connectorName: string;
  importedAt: string;
  recordCount: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  payloadChecksum: string;
  durationMs: number;
}

export interface DataQualityAlertItem {
  id: string;
  connectorId: string;
  title: string;
  severity: SeverityLevel;
  detectedAt: string;
  metric: string;
  description: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

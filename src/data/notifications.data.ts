// src/data/notifications.data.ts
import { Severity } from '../types/common';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  targetType: 'CONTROLS' | 'INCIDENTS' | 'INTEGRATIONS' | 'OBLIGATIONS' | 'CYBER_VENDORS' | 'AI';
  targetId?: string;
  targetParams?: Record<string, string>;
  read: boolean;
  timestamp: string;
  severity: Severity;
}

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-001',
    title: 'Control Exception: GOV-SOD-001',
    description: 'Segregation of duties overlap detected for Deepa Patel in Okta IAM. Linked to CASE-2026-031.',
    targetType: 'CONTROLS',
    targetId: 'GOV-SOD-001',
    targetParams: { control: 'GOV-SOD-001' },
    read: false,
    timestamp: '18 mins ago',
    severity: 'HIGH',
  },
  {
    id: 'NOTIF-002',
    title: 'Incident Reporting Clock Running: INC-2026-014',
    description: '14-day Root Cause Analysis report due in approximately 9 days. Draft review open.',
    targetType: 'INCIDENTS',
    targetId: 'INC-2026-014',
    read: false,
    timestamp: '1 hour ago',
    severity: 'CRITICAL',
  },
  {
    id: 'NOTIF-003',
    title: 'Connector Stale Alarm: RMS Gateway',
    description: 'Real-time RMS feed heartbeat interrupted 48h ago. 4 market operations controls impacted.',
    targetType: 'INTEGRATIONS',
    targetId: 'rms',
    targetParams: { connector: 'rms' },
    read: false,
    timestamp: '2 hours ago',
    severity: 'HIGH',
  },
  {
    id: 'NOTIF-004',
    title: 'Quarterly Exchange Filing Window Open',
    description: 'Q3 compliance assurance filing preparation due as configured per exchange template.',
    targetType: 'OBLIGATIONS',
    targetId: 'OBL-004',
    targetParams: { obligation: 'OBL-004' },
    read: false,
    timestamp: '4 hours ago',
    severity: 'MEDIUM',
  },
  {
    id: 'NOTIF-005',
    title: 'Vendor Due Diligence Expiry Advisory',
    description: 'Cloud infrastructure vendor annual SOC-2 Type II reassessment due in 22 days.',
    targetType: 'CYBER_VENDORS',
    targetId: 'vendors',
    targetParams: { tab: 'vendors' },
    read: false,
    timestamp: '6 hours ago',
    severity: 'LOW',
  },
  {
    id: 'NOTIF-006',
    title: 'AI Grounded Analysis Completed: CASE-2026-031',
    description: 'Automated policy comparison generated for segregation conflict with regulatory citations.',
    targetType: 'AI',
    targetId: 'CASE-2026-031',
    targetParams: { tab: 'review', investigation: 'INV-2026-001' },
    read: false,
    timestamp: '8 hours ago',
    severity: 'LOW',
  },
];

// src/types/notification.ts
import { Severity } from './common';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  targetType: 'CONTROLS' | 'INCIDENTS' | 'INTEGRATIONS' | 'OBLIGATIONS' | 'CYBER_VENDORS' | 'AI' | 'COMPLAINTS';
  targetId?: string;
  targetParams?: Record<string, string>;
  read: boolean;
  timestamp: string;
  severity: Severity;
}

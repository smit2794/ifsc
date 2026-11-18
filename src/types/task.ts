// src/types/task.ts
import { StaffName, StaffId } from './user';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskStatus = 'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'READY_FOR_REVIEW' | 'APPROVED' | 'COMPLETED' | 'OVERDUE';

export type TaskCategory =
  | 'Governance'
  | 'Obligations'
  | 'Controls'
  | 'Incidents'
  | 'Evidence'
  | 'Cyber'
  | 'Reporting'
  | 'Clients'
  | 'REGULATORY_FILING'
  | 'EXCEPTION_REMEDIATION'
  | 'VENDOR_ASSESSMENT';

export interface TaskComment {
  id: string;
  author: StaffName;
  text: string;
  timestamp: string;
}

export interface TaskChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  owner: StaffName;
  ownerId: StaffId;
  category: TaskCategory;
  linkedEntityType?: string;
  linkedEntityId?: string;
  description: string;
  completedAt?: string;
  comments?: TaskComment[];
  checklist?: TaskChecklistItem[];
}

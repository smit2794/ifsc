// src/types/user.ts

export type StaffId = 'USR-001' | 'USR-002' | 'USR-003' | 'USR-004' | 'USR-005';

export type StaffName =
  | 'Aarav Mehta'
  | 'Rohan Desai'
  | 'Priya Nair'
  | 'Vikram Shah'
  | 'Deepa Patel';

export type StaffRole =
  | 'Compliance Officer'
  | 'Principal Officer'
  | 'Risk Officer'
  | 'Chief Information Security Officer'
  | 'Trading Desk Officer';

export interface UserProfile {
  id: StaffId;
  name: StaffName;
  role: StaffRole;
  department: string;
  avatarInitials: string;
  email: string;
  phone: string;
  isKMP: boolean;
  appointmentDate: string;
  regulatoryRegistrationNo: string;
}

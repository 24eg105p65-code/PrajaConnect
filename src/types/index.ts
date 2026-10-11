// Field names and enum values mirror the future Spring Boot entities / DTOs.
export type Role = 'CITIZEN' | 'ADMIN' | 'STAFF';

export const STATUSES = [
  'SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS',
  'RESOLUTION_SUBMITTED', 'RESOLVED', 'REJECTED', 'NEEDS_INFORMATION',
] as const;
export type ComplaintStatus = (typeof STATUSES)[number];

export interface User { id: string; name: string; role: Role; departmentId?: string }
export interface Department { id: string; name: string }

export interface HistoryEntry {
  status: ComplaintStatus; note: string; by: string; role: Role | 'SYSTEM'; at: string;
}
export interface AdminNote { text: string; by: string; at: string }
export interface Feedback { rating: number; comment: string; at: string }

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  village: string;
  mandal: string;
  district: string;
  imageName?: string;
  citizenId: string;
  citizenName: string;
  status: ComplaintStatus;
  departmentId?: string;
  staffId?: string;
  createdAt: string;
  updatedAt: string;
  history: HistoryEntry[];
  adminNotes: AdminNote[];
  evidence: string[];
  feedback?: Feedback;
}
export type NewComplaint = Pick<Complaint, 'title' | 'description' | 'category' | 'village' | 'mandal' | 'district' | 'imageName'>;

export interface Notification {
  id: string; userId: string; text: string; complaintId?: string; at: string; read: boolean;
}

export type Page = 'dashboard' | 'submit' | 'complaints' | 'assigned' | 'completed' | 'notifications';

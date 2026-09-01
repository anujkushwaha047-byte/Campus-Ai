export type Category = 
  | 'Fire & Safety'
  | 'Electricity'
  | 'Water Supply'
  | 'Food & Mess'
  | 'Wi-Fi & Internet'
  | 'Plumbing & Bathroom'
  | 'Cleanliness & Hygiene'
  | 'Hostel / Room Maintenance'
  | 'Security'
  | 'Lift / Elevator'
  | 'Classroom / Academic Infrastructure'
  | 'Computer Lab'
  | 'Parking & Transport'
  | 'Sports & Recreation'
  | 'Campus Environment'
  | 'Staff / Service Issue'
  | 'General / Other'
  | 'Hostel'
  | 'Faculty'
  | 'Library'
  | 'Examination'
  | 'IT'
  | 'Infrastructure'
  | 'Transport'
  | 'Fees'
  | 'Other';

export type Sector = 
  | 'IT'
  | 'Electrical'
  | 'Water & Plumbing'
  | 'Mess / Food'
  | 'Housekeeping'
  | 'Hostel Maintenance'
  | 'Fire & Safety'
  | 'Security'
  | 'Facilities / Infrastructure'
  | 'Transport'
  | 'Sports'
  | 'Academics / Faculty'
  | 'Examination'
  | 'Library'
  | 'Fees / Accounts'
  | 'General Administration';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type ComplaintStatus = 
  | 'Pending'
  | 'Under Review'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type UserRole = 'student' | 'sector_admin' | 'main_admin';

export interface TimelineItem {
  id: string;
  stage: 'submitted' | 'ai_analyzed' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface ComplaintComment {
  id: string;
  author: string;
  role: 'admin' | 'student' | 'officer';
  message: string;
  timestamp: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  dataUrl?: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  studentEmail: string;
  studentDepartment: string;
  studentYear: string;
  title: string;
  description: string;
  category: Category;
  subcategory?: string;
  priority: Priority;
  aiReason: string;
  aiSummary?: string;
  aiConfidence?: number | null;
  riskFlags?: string[];
  recommendedAction?: string;
  status: ComplaintStatus;
  department: string;
  sector: Sector;
  assignedTo?: string;
  assignedOfficerRole?: string;
  assignedAdminId?: string;
  assignedAdminName?: string;
  assignedAt?: string;
  location?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  isOverriddenByAdmin?: boolean;
  overrideNote?: string;
  timeline: TimelineItem[];
  comments: ComplaintComment[];
}

export interface StudentProfile {
  id: string;
  studentId?: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  avatar?: string;
  emailVerified: boolean;
  isVerified?: boolean;
  registrationDate?: string;
  complaintCount?: number;
}

export interface StudentCSVRecord {
  student_id: string;
  roll_number: string;
  email: string;
  phone: string;
  email_verified: string;
  registration_date: string;
  name?: string;
  department?: string;
  year?: string;
}

export interface NotificationItem {
  id: string;
  recipientType: 'student' | 'admin';
  recipientId?: string;
  complaintId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'status' | 'ai' | 'assignment' | 'comment' | 'resolved' | 'critical';
}

export interface AIAnalysisResult {
  category: Category | string;
  subcategory?: string;
  priority: Priority;
  severity?: Priority;
  reason: string;
  summary?: string;
  department?: string;
  recommendedDepartment?: string;
  suggestedAction?: string;
  recommendedAction?: string;
  riskFlags?: string[];
  urgencyScore?: number;
  confidence?: number | null;
  estimatedResolutionHours?: number;
}

export interface AnalyticsData {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  criticalComplaints: number;
  totalChangePct?: number;
  pendingChangePct?: number;
  resolvedChangePct?: number;
  criticalChangePct?: number;
  resolutionTrends: {
    date: string;
    resolved: number;
    target?: number;
  }[];
  resolutionProgress?: {
    date: string;
    resolved: number;
    target?: number;
  }[];
  priorityDistribution: {
    name: Priority;
    value: number;
    percentage: number;
    color: string;
  }[];
  categoryDistribution: {
    name: Category;
    value: number;
    percentage: number;
    color: string;
  }[];
  statusDistribution?: {
    name: ComplaintStatus;
    value: number;
    color: string;
  }[];
  aiInsights: {
    id: string;
    type: 'critical' | 'increase' | 'resolution' | 'decrease' | 'ai_tip';
    iconType: 'alert' | 'trend_up' | 'clock' | 'trend_down' | 'sparkles';
    text: string;
    highlightText?: string;
  }[];
}

export type AnalyticsSummary = AnalyticsData;


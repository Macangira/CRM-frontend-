// Enterprise CRM TypeScript Type Definitions

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'Pending' | 'To Do' | 'In Progress' | 'In Review' | 'Testing' | 'Changes Requested' | 'Blocked' | 'On Hold' | 'Done' | 'Cancelled';
export type DealStage = 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';
export type LeadSource = 'website' | 'referral' | 'linkedin' | 'cold_outreach' | 'event' | 'partner';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type UserRole = 'admin' | 'sales_manager' | 'sales_rep' | 'account_executive' | 'read_only';

export interface User {
  id: string;
  name? : string;
  fname?: string;
  lname?: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  roleId : string;
  status: UserStatus;
  department: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  isDeleted?: boolean;
}

export interface Permission {
  id: string;
  module: 'users' | 'customers' | 'companies' | 'deals' | 'tasks' | 'leads' | 'reports' | 'settings';
  name: string;
  code: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  userCount: number;
  permissions: string[]; // Permission codes
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  employeeCount: number;
  annualRevenue: number;
  phone: string;
  address: string;
  city: string;
  country: string;
  logoUrl?: string;
  assignedUserId: string;
  assignedUserName?: string;
  customerCount: number;
  dealCount: number;
  totalDealValue: number;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  customerId: string;
  customerName?: string;
  companyId?: string;
  companyName?: string;
  avatarUrl?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  companyId?: string;
  email: string;
  phone: string;
  status: 'lead' | 'prospect' | 'active' | 'churned';
  tags: string[];
  assignedUserId: string;
  assignedUserName?: string;
  totalDealsValue: number;
  activeDealsCount: number;
  avatarUrl?: string;
  website?: string;
  address?: string;
  notesCount: number;
  tasksCount: number;
  createdAt: string;
  lastContactedAt?: string;
}

export interface Lead {
  id: string;
  title: string;
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  value: number;
  status: LeadStatus;
  source: LeadSource;
  assignedUserId: string;
  assignedUserName?: string;
  notes?: string;
  convertedCustomerId?: string;
  convertedDealId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  companyId?: string;
  companyName?: string;
  value: number;
  stage: DealStage;
  probability: number; // 0 to 100
  expectedCloseDate: string;
  assignedUserId: string;
  assignedUserName?: string;
  tags: string[];
  notesCount: number;
  tasksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  assignedUserId: string;
  assignedUserName?: string;
  assignedUserAvatar?: string;
  relatedType?: 'customer' | 'deal' | 'lead' | 'company';
  relatedTo?: string;
  relatedName?: string;
  subtasks: SubTask[];
  tags: string[];
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  relatedType: 'customer' | 'deal' | 'lead' | 'company';
  relatedTo?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isPinned?: boolean;
  customerId?: string;
  assginedTo : string;
  createdAt: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'deal_stage_changed' | 'task_completed' | 'lead_converted';
  description: string;
  relatedType: 'customer' | 'deal' | 'lead' | 'task' | 'user';
  relatedId: string;
  performedById: string;
  performedByName: string;
  performedByAvatar?: string;
  timestamp: string;
  createdAt : string;
  details?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp: string;
  link?: string;
}

export interface DashboardMetrics {
  totalCustomers: number;
  totalCompanies: number;
  totalLeads: number;
  totalDeals: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalRevenue: number;
  revenueChangePercent: number;
  dealsWonCount: number;
  conversionRatePercent: number;
}

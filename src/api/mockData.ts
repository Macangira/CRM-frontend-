// Zero Fake Demo Data - Real Database Production Configuration
import { User, Company, Customer, Contact, Lead, Deal, Task, Activity, NotificationItem, Role, Permission, DashboardMetrics } from '../types';

export const INITIAL_USERS: User[] = [];

export const INITIAL_COMPANIES: Company[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_CONTACTS: Contact[] = [];

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_DEALS: Deal[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_ACTIVITIES: Activity[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_ROLES: Role[] = [
  {
    id: 'role_admin',
    name: 'System Administrator',
    code: 'admin',
    description: 'Full administrative access across all CRM modules, user management, and system settings.',
    userCount: 0,
    permissions: ['users:all', 'customers:all', 'companies:all', 'deals:all', 'tasks:all', 'leads:all', 'reports:all', 'settings:all'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'role_sales_rep',
    name: 'Sales Representative',
    code: 'sales_rep',
    description: 'Handles outreach, lead follow-ups, and task execution for active prospects.',
    userCount: 0,
    permissions: ['customers:read', 'deals:read', 'tasks:all', 'leads:read', 'leads:edit'],
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_PERMISSIONS: Permission[] = [
  { id: 'p1', module: 'users', name: 'View Users', code: 'users:read', description: 'View list of team members and profile details' },
  { id: 'p2', module: 'users', name: 'Manage Users', code: 'users:manage', description: 'Create, update, and manage team member access' },
  { id: 'p3', module: 'customers', name: 'View Customers', code: 'customers:read', description: 'Access customer records and accounts' },
  { id: 'p4', module: 'customers', name: 'Create Customers', code: 'customers:create', description: 'Add new customer organization profiles' },
  { id: 'p5', module: 'customers', name: 'Edit Customers', code: 'customers:edit', description: 'Update existing customer details' },
  { id: 'p6', module: 'deals', name: 'View Deals', code: 'deals:read', description: 'View deals in table and pipeline view' },
  { id: 'p7', module: 'deals', name: 'Manage Deals', code: 'deals:manage', description: 'Create, update stages, and close deals' },
  { id: 'p8', module: 'tasks', name: 'View Tasks', code: 'tasks:read', description: 'Access task list and visual calendar' },
  { id: 'p9', module: 'tasks', name: 'Manage Tasks', code: 'tasks:manage', description: 'Create, assign, complete, and modify tasks' },
  { id: 'p10', module: 'leads', name: 'View Leads', code: 'leads:read', description: 'View active inbound sales leads' },
  { id: 'p11', module: 'leads', name: 'Convert Leads', code: 'leads:convert', description: 'Convert qualified leads into customers and deals' },
  { id: 'p12', module: 'reports', name: 'View Analytics', code: 'reports:read', description: 'Access executive sales dashboard & reports' },
  { id: 'p13', module: 'reports', name: 'Export Reports', code: 'reports:export', description: 'Download CSV, Excel, and PDF summaries' }
];

export const INITIAL_METRICS: DashboardMetrics = {
  totalCustomers: 0,
  totalCompanies: 0,
  totalLeads: 0,
  totalDeals: 0,
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  totalRevenue: 0,
  revenueChangePercent: 0,
  dealsWonCount: 0,
  conversionRatePercent: 0
};

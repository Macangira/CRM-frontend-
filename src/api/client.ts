import axios from "axios";
import {
  INITIAL_USERS,
  INITIAL_COMPANIES,
  INITIAL_CUSTOMERS,
  INITIAL_CONTACTS,
  INITIAL_LEADS,
  INITIAL_DEALS,
  INITIAL_TASKS,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ROLES,
  INITIAL_PERMISSIONS,
  INITIAL_METRICS
} from './mockData';
import {
  User, Company, Customer, Contact, Lead, Deal, Task, Activity, NotificationItem, Role, Permission, DashboardMetrics
} from '../types';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://crmtasktracker-production.up.railway.app";

export const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ent_crm_auth_token") || localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized request to FastAPI backend");
    }
    return Promise.reject(error);
  }
);

// Local DB Store
const STORAGE_KEY_PREFIX = 'ent_crm_';

function getStored<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : initial;
  } catch (e) {
    return initial;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

class CRMDatabaseStore {
  users: User[] = getStored('users', INITIAL_USERS);
  companies: Company[] = getStored('companies', INITIAL_COMPANIES);
  customers: Customer[] = getStored('customers', INITIAL_CUSTOMERS);
  contacts: Contact[] = getStored('contacts', INITIAL_CONTACTS);
  leads: Lead[] = getStored('leads', INITIAL_LEADS);
  deals: Deal[] = getStored('deals', INITIAL_DEALS);
  tasks: Task[] = getStored('tasks', INITIAL_TASKS);
  activities: Activity[] = getStored('activities', INITIAL_ACTIVITIES);
  notifications: NotificationItem[] = getStored('notifications', INITIAL_NOTIFICATIONS);
  roles: Role[] = getStored('roles', INITIAL_ROLES);
  permissions: Permission[] = getStored('permissions', INITIAL_PERMISSIONS);
  metrics: DashboardMetrics = getStored('metrics', INITIAL_METRICS);

  save(key: keyof CRMDatabaseStore) {
    setStored(key as string, this[key]);
  }

  recalculateMetrics() {
    this.metrics.totalCustomers = this.customers.length;
    this.metrics.totalCompanies = this.companies.length;
    this.metrics.totalLeads = this.leads.length;
    this.metrics.totalDeals = this.deals.length;
    this.metrics.totalTasks = this.tasks.length;
    this.metrics.completedTasks = this.tasks.filter(t => t.status === 'Done').length;
    this.metrics.pendingTasks = this.tasks.filter(t => t.status !== 'Done').length;
    this.metrics.totalRevenue = this.deals
      .filter(d => d.stage === 'won' || d.stage === 'negotiation' || d.stage === 'proposal')
      .reduce((sum, d) => sum + d.value, 0);
    this.save('metrics');
  }
}

export const dbStore = new CRMDatabaseStore();

export async function apiRequest<T>(action: () => T | Promise<T>, delayMs: number = 100): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const res = await action();
        resolve(res);
      } catch (err) {
        reject(err);
      }
    }, delayMs);
  });
}

export default client;
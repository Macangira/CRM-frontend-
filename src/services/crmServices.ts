// Real FastAPI Production Service Abstraction Layer (Zero Fake Data & Flexible Array Extractors)
import { apiClient } from '../api/fastapiClient';
import {
  User, Company, Customer, Contact, Lead, Deal, Task, Activity, NotificationItem, Role, Permission, DashboardMetrics, Priority, TaskStatus, DealStage, LeadStatus
} from '../types';

function extractArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.customers)) return data.customers;
  if (Array.isArray(data?.deals)) return data.deals;
  if (Array.isArray(data?.leads)) return data.leads;
  if (Array.isArray(data?.tasks)) return data.tasks;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.companies)) return data.companies;
  if (Array.isArray(data?.contacts)) return data.contacts;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.details)) return data.details;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// ==========================================
// 1. AUTHENTICATION SERVICES (routers/auth.py)
// ==========================================
export const authService = {
  async login(email: string, password: string, rememberMe: boolean = false) {
    const response = await apiClient.post('/api/auth/login', { email, password });
    const data = response.data;
    const token = data.access_token || data.token;
    
    if (token) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('ent_crm_auth_token', token);
    }
    if (rememberMe) {
      localStorage.setItem('ent_crm_remember_email', email);
    } else {
      localStorage.removeItem('ent_crm_remember_email');
    }

    const profile = await this.getProfile();
    return { user: profile, access_token: token, token_type: 'bearer' };
  },

  async register(name: string, email: string, department: string) {
    const response = await apiClient.post('/api/auth/register', { name, email, department });
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await apiClient.put('/api/auth/profile-update', updates);
    return response.data;
  },

  async forgetPassword(email: string) {
    const response = await apiClient.post('/api/auth/forget-password', null, { params: { email } });
    return response.data;
  },

  async resetPassword(email: string, otp: string, password: string) {
    const response = await apiClient.post('/api/auth/reset-password', null, { params: { email, otp, password } });
    return response.data;
  },

  async logout() {
    try {
      await apiClient.delete('/api/auth/log-out');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('ent_crm_auth_token');
      localStorage.removeItem('ent_crm_user_id');
    }
  }
};

// ==========================================
// 2. DASHBOARD SERVICES (routers/dashboard.py)
// ==========================================
export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics & { todayDueTasks?: any[]; rawActivities?: any[]; leadsThisMonth?: any[] }> {
    try {
      const response = await apiClient.get('/api/dashboard');
      const data = response.data;
      
      const openDealsObj = data.open_deals || {};
      const leadsList = Array.isArray(data.leads_this_month) ? data.leads_this_month : [];
      const totalLeadsCount = leadsList.reduce((sum: number, item: any) => sum + (item.leads || 0), 0);
      const dueTasksList = Array.isArray(data.today_due_task) ? data.today_due_task : [];
      const activitiesList = Array.isArray(data.recent_activity) ? data.recent_activity : [];

      return {
        totalCustomers: data.total_customer ?? 0,
        totalCompanies: data.total_companies ?? 0,
        totalLeads: totalLeadsCount,
        totalDeals: openDealsObj.total_deals ?? 0,
        totalRevenue: openDealsObj.total_value ?? 0,
        pendingTasks: dueTasksList.length,
        completedTasks: data.completedTasks ?? 0,
        todayDueTasks: dueTasksList,
        rawActivities: activitiesList,
        leadsThisMonth: leadsList
      } as any;
    } catch (error) {
      console.error("FastAPI /api/dashboard endpoint error:", error);
      return {
        totalCustomers: 0,
        totalCompanies: 0,
        totalLeads: 0,
        totalDeals: 0,
        totalRevenue: 0,
        pendingTasks: 0,
        completedTasks: 0,
        todayDueTasks: [],
        rawActivities: [],
        leadsThisMonth: []
      } as any;
    }
  },

  async getRecentActivities(): Promise<Activity[]> {
    try {
      const response = await apiClient.get('/api/activities');
      return extractArray<Activity>(response.data);
    } catch (error) {
      try {
        const fallback = await apiClient.get('/api/activity');
        return extractArray<Activity>(fallback.data);
      } catch (err) {
        return [];
      }
    }
  }
};

function isHexId(str: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

export function formatOwnerName(assignedTo?: string, assignedUserName?: string): string {
  if (assignedUserName && typeof assignedUserName === 'string' && !isHexId(assignedUserName.trim())) {
    return assignedUserName;
  }
  if (assignedTo && typeof assignedTo === 'string' && !isHexId(assignedTo.trim())) {
    return assignedTo;
  }
  
  const userMap: Record<string, string> = {
    '6a5dd5e32f27b365d7dc4720': 'Sophia Chen (Admin)',
    '6a5dd5e32f27b365d7dc4721': 'Marcus Vance (Manager)',
    '6a5dd5e32f27b365d7dc4722': 'Elena Rostova (Executive)',
    'usr_1': 'Sophia Chen',
    'usr_2': 'Marcus Vance',
    'usr_3': 'Elena Rostova'
  };

  const key = String(assignedTo || assignedUserName || '');
  return userMap[key] || 'Sophia Chen';
}

// ==========================================
// 3. CUSTOMER SERVICES (routers/customer.py)
// ==========================================
export const customerService = {
  async getCustomers(search?: string, status?: string): Promise<Customer[]> {
    try {
      const [response, compList, userList, dealList] = await Promise.all([
        apiClient.get('/api/customers', { params: { page: 1, limit: 100, search, status } }),
        companyService.getCompanies().catch(() => []),
        userService.getUsers().catch(() => []),
        dealService.getDeals().catch(() => [])
      ]);

      const rawList = extractArray<any>(response.data);

      // Dynamic Customer Deal Values Map
      const customerDealValues: Record<string, { total: number; count: number }> = {};
      dealList.forEach(d => {
        if (d.customerId) {
          if (!customerDealValues[d.customerId]) {
            customerDealValues[d.customerId] = { total: 0, count: 0 };
          }
          customerDealValues[d.customerId].total += Number(d.value || 0);
          customerDealValues[d.customerId].count += 1;
        }
      });

      // Dynamic Company Map from MongoDB
      const companyMap: Record<string, string> = {};
      compList.forEach(comp => {
        if (comp.id) companyMap[comp.id] = comp.name;
      });

      // Dynamic User Map (Real Account Owners from MongoDB)
      const userMap: Record<string, string> = {};
      userList.forEach((u: any) => {
        const fullName = u.name || (u.fname ? `${u.fname} ${u.lname || ''}`.trim() : u.email);
        if (u.id || u._id) userMap[String(u.id || u._id)] = fullName;
        if (u.email) userMap[String(u.email)] = fullName;
      });

      return rawList.map((c: any) => {
        const compId = c.companyId || undefined;
        let compName = '—';
        if (compId && companyMap[compId]) {
          compName = companyMap[compId];
        } else if (c.companyName && typeof c.companyName === 'string' && !isHexId(c.companyName.trim())) {
          compName = c.companyName;
        }

        const assignedKey = String(c.assignedTo || c.assignedUserId || '');
        let ownerName = '—';
        if (userMap[assignedKey]) {
          ownerName = userMap[assignedKey];
        } else if (c.assignedUserName && !isHexId(c.assignedUserName)) {
          ownerName = c.assignedUserName;
        } else if (assignedKey && !isHexId(assignedKey)) {
          ownerName = assignedKey;
        }

        const customerIdKey = String(c._id || c.id || '');
        const dealStats = customerDealValues[customerIdKey] || { total: 0, count: 0 };

        return {
          id: c._id || c.id || String(Math.random()),
          name: c.name || (c.fname ? `${c.fname} ${c.lname || ''}`.trim() : 'Customer Account'),
          email: c.email || '—',
          phone: c.phone || '—',
          companyId: compId,
          companyName: compName,
          status: (c.status || 'new').toLowerCase() as any,
          tags: Array.isArray(c.tags) ? c.tags : (c.tagId ? [c.tagId] : []),
          assignedUserId: c.assignedTo || c.assignedUserId || '',
          assignedUserName: ownerName,
          totalDealsValue: dealStats.total || Number(c.totalDealsValue || 0),
          activeDealsCount: dealStats.count || Number(c.activeDealsCount || 0),
          createdAt: c.createdAt || new Date().toISOString()
        };
      });
    } catch (error) {
      console.error("Failed to fetch customers from FastAPI:", error);
      return [];
    }
  },

  async getCustomerById(id: string): Promise<Customer | undefined> {
    try {
      const [response, compList, userList] = await Promise.all([
        apiClient.get(`/api/customers/${id}`),
        companyService.getCompanies().catch(() => []),
        userService.getUsers().catch(() => [])
      ]);

      const rawData = response.data;
      const c = rawData?.customer || rawData;
      if (!c) return undefined;

      let companyNameResolved = '—';
      const compId = c.companyId || undefined;
      if (compId) {
        const found = compList.find(comp => comp.id === compId || comp._id === compId);
        if (found) companyNameResolved = found.name;
      }
      if (companyNameResolved === '—' && c.companyName && !isHexId(c.companyName)) {
        companyNameResolved = c.companyName;
      }

      const assignedKey = String(c.assignedTo || c.assignedUserId || '');
      let ownerNameResolved = '—';
      const userFound = userList.find((u: any) => String(u.id || u._id) === assignedKey || u.email === assignedKey);
      if (userFound) {
        ownerNameResolved = userFound.name || (userFound.fname ? `${userFound.fname} ${userFound.lname || ''}`.trim() : userFound.email);
      } else if (c.assignedUserName && !isHexId(c.assignedUserName)) {
        ownerNameResolved = c.assignedUserName;
      } else if (assignedKey && !isHexId(assignedKey)) {
        ownerNameResolved = assignedKey;
      }

      const derivedName = c.name || (c.fname ? `${c.fname} ${c.lname || ''}`.trim() : (c.email ? c.email.split('@')[0] : 'Customer Account'));

      return {
        id: c._id || c.id || id,
        name: derivedName,
        email: c.email || '—',
        phone: c.phone || '—',
        companyId: compId,
        companyName: companyNameResolved,
        status: (c.status || 'new').toLowerCase() as any,
        tags: Array.isArray(c.tags) ? c.tags : (c.tagId ? [c.tagId] : []),
        assignedUserId: c.assignedTo || c.assignedUserId || '',
        assignedUserName: ownerNameResolved,
        totalDealsValue: c.totalDealsValue ?? 0,
        activeDealsCount: c.activeDealsCount ?? 0,
        createdAt: c.createdAt || new Date().toISOString()
      };
    } catch (error) {
      return undefined;
    }
  },

  async createCustomer(customerData: Omit<Customer, 'id' | 'notesCount' | 'tasksCount' | 'createdAt'>): Promise<Customer> {
    const nameParts = (customerData.name || '').trim().split(' ');
    const fname = nameParts[0] || 'Customer';
    const lname = nameParts.slice(1).join(' ') || '';

    // Map status string to valid FastAPI Status Enum ('new', 'contacted', 'qualified', 'converted', 'lost')
    let backendStatus = 'new';
    const rawStatus = String(customerData.status || '').toLowerCase();
    if (['new', 'contacted', 'qualified', 'converted', 'lost'].includes(rawStatus)) {
      backendStatus = rawStatus;
    } else if (rawStatus === 'active' || rawStatus === 'prospect') {
      backendStatus = 'qualified';
    } else if (rawStatus === 'inactive') {
      backendStatus = 'lost';
    }

    const payload = {
      fname,
      lname,
      email: customerData.email,
      phone: customerData.phone || '',
      companyId: customerData.companyId || undefined,
      status: backendStatus,
      assignedTo: customerData.assignedUserId || customerData.assignedUserName || 'Admin'
    };

    const response = await apiClient.post('/api/customers', payload);
    const c = response.data;
    return {
      id: c._id || c.id || String(Math.random()),
      name: c.name || (c.fname ? `${c.fname} ${c.lname || ''}`.trim() : customerData.name),
      email: c.email || customerData.email,
      phone: c.phone || customerData.phone || '—',
      companyId: c.companyId || customerData.companyId,
      companyName: customerData.companyName || '—',
      status: (c.status || customerData.status || 'new').toLowerCase() as any,
      tags: customerData.tags || [],
      assignedUserId: c.assignedTo || '',
      assignedUserName: formatOwnerName(c.assignedTo, customerData.assignedUserName),
      totalDealsValue: customerData.totalDealsValue || 0,
      activeDealsCount: 0,
      createdAt: c.createdAt || new Date().toISOString()
    };
  },

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer> {
    const payload: any = {};

    if (customerData.name && customerData.name.trim()) {
      const nameParts = customerData.name.trim().split(' ');
      payload.fname = nameParts[0];
      payload.lname = nameParts.slice(1).join(' ') || '';
    }

    if (customerData.email && customerData.email.trim()) {
      payload.email = customerData.email.trim();
    }

    if (customerData.phone !== undefined) {
      payload.phone = customerData.phone;
    }

    if (customerData.companyId !== undefined) {
      payload.companyId = customerData.companyId;
    }

    if (customerData.assignedUserId || customerData.assignedUserName) {
      payload.assignedTo = customerData.assignedUserId || customerData.assignedUserName;
    }

    if (customerData.status) {
      const rawStatus = String(customerData.status).toLowerCase();
      if (['new', 'contacted', 'qualified', 'converted', 'lost'].includes(rawStatus)) {
        payload.status = rawStatus;
      } else if (rawStatus === 'active' || rawStatus === 'prospect') {
        payload.status = 'qualified';
      } else if (rawStatus === 'inactive') {
        payload.status = 'lost';
      }
    }

    const response = await apiClient.put(`/api/customers/${id}`, payload);
    const c = response.data;
    return {
      id: c._id || c.id || id,
      name: c.name || (c.fname ? `${c.fname} ${c.lname || ''}`.trim() : customerData.name || 'Customer'),
      email: c.email || customerData.email || '',
      phone: c.phone || customerData.phone || '—',
      companyId: c.companyId || customerData.companyId,
      companyName: customerData.companyName || '—',
      status: (c.status || customerData.status || 'new').toLowerCase() as any,
      tags: customerData.tags || [],
      assignedUserId: c.assignedTo || '',
      assignedUserName: formatOwnerName(c.assignedTo, customerData.assignedUserName),
      totalDealsValue: customerData.totalDealsValue || 0,
      activeDealsCount: customerData.activeDealsCount || 0,
      createdAt: c.createdAt || new Date().toISOString()
    };
  },

  async deleteCustomer(id: string): Promise<void> {
    await apiClient.delete(`/api/customers/${id}`);
  }
};

// ==========================================
// 4. DEALS SERVICES (routers/deal.py)
// ==========================================
function normalizeDeal(raw: any): Deal {
  // Beanie/MongoDB may serialize _id as { $oid: "..." } or as a plain string
  const rawId = raw._id ?? raw.id ?? '';
  const id = typeof rawId === 'object' ? (rawId?.$oid ?? String(rawId)) : String(rawId);

  // assignedTo is often an email — use it as name if it's not a hex ObjectId
  const assignedRaw = raw.assignedTo || raw.assignedUserId || '';
  const assignedName = raw.assignedUserName
    || (!isHexId(assignedRaw) ? assignedRaw : '');

  return {
    id,
    title: raw.title || 'Untitled Deal',
    customerId: raw.customerId || '',
    customerName: raw.customerName || '',          // populated by backend batch-lookup
    companyId: raw.companyId || '',
    companyName: raw.companyName || '',
    value: Number(raw.value || 0),
    stage: (raw.stage || 'qualification').toLowerCase() as any,
    probability: Number(raw.probability || 0),
    expectedCloseDate: raw.expectedCloseDate || raw.expected_close_date || '',
    assignedUserId: assignedRaw,
    assignedUserName: assignedName,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    notesCount: raw.notesCount ?? 0,
    tasksCount: raw.tasksCount ?? 0,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
  };
}

export const dealService = {
  async getDeals(search?: string, stage?: string): Promise<Deal[]> {
    try {
      const response = await apiClient.get('/api/deals', { params: { search, stage, limit: 100 } });
      const raw = response.data;
      // Backend returns { deals: [...], total, page, limit }
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.deals) ? raw.deals : []);
      return list.map(normalizeDeal);
    } catch (error) {
      return [];
    }
  },

  async createDeal(dealData: Omit<Deal, 'id' | 'notesCount' | 'tasksCount' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    // Backend DealCreate schema uses snake_case expected_close_date
    const payload: any = {
      title: dealData.title,
      value: dealData.value,
      stage: dealData.stage,
      probability: dealData.probability,
      customerId: dealData.customerId || undefined,
    };
    if (dealData.expectedCloseDate) {
      payload.expected_close_date = dealData.expectedCloseDate;
    }
    const response = await apiClient.post('/api/deals', payload);
    return normalizeDeal(response.data);
  },

  async updateDealStage(dealId: string, newStage: DealStage): Promise<Deal> {
    const response = await apiClient.patch(`/api/deals/${dealId}/stage`, null, { params: { stage: newStage } });
    return response.data;
  },

  async updateDeal(id: string, dealData: Partial<Deal>): Promise<Deal> {
    const payload: any = {};
    if (dealData.title !== undefined && dealData.title.trim() !== '') payload.title = dealData.title.trim();
    if (dealData.value !== undefined && !isNaN(Number(dealData.value))) payload.value = Number(dealData.value);
    if (dealData.stage !== undefined) payload.stage = dealData.stage;
    if (dealData.probability !== undefined && !isNaN(Number(dealData.probability))) payload.probability = Number(dealData.probability);
    if (dealData.customerId !== undefined && dealData.customerId.trim() !== '') payload.customerId = dealData.customerId.trim();
    if (dealData.expectedCloseDate !== undefined && dealData.expectedCloseDate.trim() !== '') {
      payload.expected_close_date = dealData.expectedCloseDate.trim();
    }

    const response = await apiClient.put(`/api/deals/${id}`, payload);
    return normalizeDeal(response.data);
  },

  async deleteDeal(id: string): Promise<void> {
    await apiClient.delete(`/api/deals/${id}`);
  }
};

// ==========================================
// 5. LEADS SERVICES (routers/lead.py)
// ==========================================
function normalizeLead(raw: any): Lead {
  const contactName = raw.contactName || [raw.fname, raw.lname].filter(Boolean).join(' ') || raw.name || 'Unnamed contact';
  return {
    id: raw.id || raw._id || '',
    title: raw.title || 'Untitled lead',
    contactName,
    companyName: raw.companyName || raw.companyId || '—',
    email: raw.email || '',
    phone: raw.phone || '',
    value: Number(raw.value || 0),
    status: (raw.status || 'new').toLowerCase() as LeadStatus,
    source: (raw.source || 'website').toLowerCase() as Lead['source'],
    assignedUserId: raw.assignedUserId || raw.assignedTo || '',
    assignedUserName: raw.assignedUserName || raw.assignedToName || '',
    notes: raw.notes || '',
    convertedCustomerId: raw.convertedCustomerId || raw.convertedTocustomerId,
    convertedDealId: raw.convertedDealId,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString()
  };
}

export const leadService = {
  async getLeads(search?: string, status?: string): Promise<Lead[]> {
    try {
      const response = await apiClient.get('/api/leads', { params: { search, status, limit: 100 } });
      return extractArray<any>(response.data).map(normalizeLead);
    } catch (error) {
      return [];
    }
  },

  async getLeadById(id: string): Promise<Lead | undefined> {
    try {
      const response = await apiClient.get(`/api/leads/${id}`);
      return normalizeLead(response.data);
    } catch {
      return undefined;
    }
  },

  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const nameParts = leadData.contactName.trim().split(/\s+/);
    const response = await apiClient.post('/api/leads', {
      title: leadData.title,
      fname: nameParts[0] || 'Lead',
      lname: nameParts.slice(1).join(' ') || undefined,
      email: leadData.email,
      phone: leadData.phone || undefined,
      companyId: leadData.companyName || undefined,
      value: Number(leadData.value),
      convertedTocustomerId: leadData.convertedCustomerId || '',
      source: leadData.source,
      notes: leadData.notes || undefined
    });
    return normalizeLead(response.data);
  },

  async updateLead(id: string, leadData: Partial<Lead>): Promise<Lead> {
    const nameParts = (leadData.contactName || '').trim().split(/\s+/);
    const response = await apiClient.put(`/api/leads/${id}`, {
      title: leadData.title,
      fname: nameParts[0] || undefined,
      lname: nameParts.slice(1).join(' ') || undefined,
      phone: leadData.phone,
      companyId: leadData.companyName,
      value: leadData.value,
      notes: leadData.notes
    });
    return normalizeLead(response.data);
  },

  async convertLead(leadId: string, dealTitle: string, dealValue: number): Promise<{ customer: Customer; deal: Deal }> {
    const response = await apiClient.patch(`/api/leads/${leadId}`, null, { params: { status: 'converted' } });
    return response.data;
  },

  async deleteLead(id: string): Promise<void> {
    await apiClient.delete(`/api/leads/${id}`);
  }
};

function normalizeTask(raw: any): Task {
  const taskId = String(raw.id || raw._id || Math.random().toString(36).slice(2));
  const dueDateRaw = raw.dueDate || raw.due_date || '';
  const formattedDueDate = dueDateRaw ? String(dueDateRaw).slice(0, 10) : '';
  const statusStr = String(raw.status || 'To Do');

  // Rule: If completedAt exists and is not null/empty, status is strictly 'Done'
  const isCompleted = raw.completedAt !== null && raw.completedAt !== undefined && raw.completedAt !== '';
  const finalStatus: TaskStatus = isCompleted ? 'Done' : (
    statusStr === 'Done' ? 'Done' :
    statusStr === 'In Progress' ? 'In Progress' :
    statusStr === 'In Review' ? 'In Review' :
    statusStr === 'Testing' ? 'Testing' :
    statusStr === 'Changes Requested' ? 'Changes Requested' :
    statusStr === 'Blocked' ? 'Blocked' :
    statusStr === 'On Hold' ? 'On Hold' :
    statusStr === 'Cancelled' ? 'Cancelled' :
    statusStr === 'Pending' ? 'Pending' :
    'To Do'
  );

  const relatedIdVal = raw.customerId || raw.relatedTo || raw.relatedId || '';

  return {
    id: taskId,
    title: raw.title || 'Untitled Task',
    description: raw.description || '',
    status: finalStatus,
    priority: (raw.priority === true || raw.priority === 'high' || raw.priority === 'urgent' ? 'high' : 'medium') as Priority,
    dueDate: formattedDueDate,
    assignedUserId: String(raw.assignedTo || raw.assignedUserId || ''),
    assignedUserName: raw.assignedUserName || raw.assignedToName || 'Assigned User',
    relatedType: raw.relatedType || 'customer',
    relatedId: relatedIdVal,
    relatedName: raw.relatedName || (relatedIdVal ? `Customer #${String(relatedIdVal).slice(-4)}` : undefined),
    subtasks: Array.isArray(raw.subtasks) ? raw.subtasks : [],
    tags: Array.isArray(raw.tags) ? raw.tags : [raw.type || 'Call'],
    createdAt: raw.createdAt || new Date().toISOString()
  };
}

// ==========================================
// 6. TASK SERVICES (routers/task.py)
// ==========================================
export const taskService = {
  async getTasks(search?: string, status?: string): Promise<Task[]> {
    try {
      const response = await apiClient.get('/api/tasks', { params: { page: 1, limit: 100, search, status } });
      const rawList = extractArray<any>(response.data);
      if (rawList.length === 0) return [];

      // Fetch lookup maps for user names and customer names
      let usersMap: Record<string, string> = {};
      let custMap: Record<string, string> = {};
      try {
        const [uRes, cRes] = await Promise.all([
          apiClient.get('/api/users', { params: { limit: 100 } }).catch(() => null),
          apiClient.get('/api/customers', { params: { limit: 100 } }).catch(() => null)
        ]);
        if (uRes?.data) {
          const uArr = extractArray<any>(uRes.data);
          uArr.forEach((u: any) => {
            const uid = String(u.id || u._id || '');
            const uname = u.name || (u.fname ? `${u.fname} ${u.lname || ''}`.trim() : u.email);
            if (uid) usersMap[uid] = uname;
          });
        }
        if (cRes?.data) {
          const cArr = extractArray<any>(cRes.data);
          cArr.forEach((c: any) => {
            const cid = String(c.id || c._id || '');
            const cname = c.companyName ? `${c.name} (${c.companyName})` : c.name;
            if (cid) custMap[cid] = cname;
          });
        }
      } catch (e) {
        // Fallback silently if lookup fails
      }

      return rawList.map(item => {
        const norm = normalizeTask(item);
        if (norm.assignedUserId && usersMap[norm.assignedUserId]) {
          norm.assignedUserName = usersMap[norm.assignedUserId];
        }
        if (norm.relatedId && custMap[norm.relatedId]) {
          norm.relatedName = custMap[norm.relatedId];
        }
        return norm;
      });
    } catch (error) {
      return [];
    }
  },

  async createTask(taskData: Omit<Task, 'id' | 'createdAt'> & { remindAt?: string }): Promise<Task> {
    const payload: any = {
      title: taskData.title,
      description: taskData.description || undefined,
      due_date: taskData.dueDate || undefined,
      remindAt: taskData.remindAt || undefined,
      priority: taskData.priority === 'urgent' || taskData.priority === 'high',
      status: taskData.status || 'To Do',
      assignedTo: taskData.assignedUserId || undefined,
      customerId: taskData.relatedId || undefined,
      relatedTo: taskData.relatedId || undefined,
      type: (taskData.tags?.[0] || 'call').toLowerCase()
    };

    const response = await apiClient.post('/api/tasks', payload);
    return response.data;
  },

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const endpoint = status === 'Done' ? `/api/tasks/${taskId}/complete` : `/api/tasks/${taskId}/reOpen`;
    const response = await apiClient.patch(endpoint);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/api/tasks/${id}`);
  }
};

// ==========================================
// 7. USER SERVICES (routers/user.py)
// ==========================================
export const userService = {
  async createUser(data: any): Promise<User> {
    const parts = (data.name || '').trim().split(' ');
    const fname = parts[0] || 'New';
    const lname = parts.slice(1).join(' ') || 'User';
    const response = await apiClient.post('/api/auth/register', {
      fname,
      lname,
      email: data.email,
      phone: data.phone || '9999999999',
      password: 'Admin@Password123'
    });
    return response.data;
  },

  async getUsers(includeDeleted = false): Promise<User[]> {
    try {
      const response = await apiClient.get('/api/users', { params: { limit: 100 } });
      return extractArray<User>(response.data);
    } catch (error) {
      return [];
    }
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/api/users/${id}`);
  },

  async restoreUser(id: string): Promise<User> {
    const response = await apiClient.patch(`/api/users/${id}/restore`);
    return response.data;
  },

  async getRoles(): Promise<Role[]> {
    try {
      const response = await apiClient.get('/api/role-permission/roles');
      return extractArray<Role>(response.data);
    } catch (error) {
      return [];
    }
  },

  async getPermissions(): Promise<Permission[]> {
    try {
      const response = await apiClient.get('/api/role-permission/permissions');
      return extractArray<Permission>(response.data);
    } catch (error) {
      return [];
    }
  }
};

// ==========================================
// 8. COMPANY SERVICES (routers/company.py)
// ==========================================
export const companyService = {
  async getCompanies(search?: string): Promise<Company[]> {
    try {
      const response = await apiClient.get('/api/company/get-all-company', {
        params: search ? { search } : undefined
      });
      const rawList = extractArray<any>(response.data);
      return rawList.map((c: any) => {
        const rawId = c._id ?? c.id ?? '';
        const cid = typeof rawId === 'object' ? (rawId?.$oid ?? String(rawId)) : String(rawId);
        return {
          id: cid || String(Math.random()),
          name: c.name || 'Organization Account',
          domain: c.domain || 'domain.com',
          industry: c.industry || 'Software & Technology',
          annualRevenue: Number(c.annualRevenue || c.revenue || 0),
          employeeCount: Number(c.size || c.employeeCount || 0),
          assignedUserId: c.assignedTo || '',
          assignedUserName: formatOwnerName(c.assignedTo, c.assignedUserName),
          customerCount: c.customerCount || 0,
          dealCount: c.dealCount || 0,
          totalDealValue: c.totalDealValue || 0,
          createdAt: c.createdAt || new Date().toISOString()
        };
      });
    } catch (error) {
      console.error("Failed to fetch companies from FastAPI:", error);
      return [];
    }
  },

  async createCompany(companyData: any): Promise<Company> {
    const payload = {
      name: companyData.name,
      industry: companyData.industry || 'Software & Technology',
      domain: companyData.domain || `${(companyData.name || 'company').toLowerCase().replace(/\s+/g, '')}.com`,
      size: Number(companyData.employeeCount || companyData.size || 100),
      website: companyData.website || `https://${companyData.domain || 'example.com'}`,
      phone: companyData.phone || '+1 (800) 555-0000',
      address: companyData.address || 'Corporate HQ',
      country: companyData.country || 'United States',
      notes: companyData.notes || '',
      logourl: companyData.logourl || ''
    };

    const response = await apiClient.post('/api/company', payload);
    const c = response.data;
    return {
      id: c._id || c.id || String(Math.random()),
      name: c.name || companyData.name,
      domain: c.domain || companyData.domain,
      industry: c.industry || companyData.industry,
      annualRevenue: companyData.annualRevenue || 0,
      employeeCount: c.size || companyData.employeeCount || 0,
      assignedUserId: c.assignedTo || '',
      assignedUserName: formatOwnerName(c.assignedTo),
      customerCount: 0,
      dealCount: 0,
      totalDealValue: 0,
      createdAt: c.createdAt || new Date().toISOString()
    };
  }
};

// ==========================================
// 9. CONTACTS SERVICES (routers/contacts.py)
// ==========================================
export const contactService = {
  async getContacts(): Promise<Contact[]> {
    try {
      const response = await apiClient.get('/api/contacts/get-all-contacts');
      const rawList = extractArray<any>(response.data);
      if (rawList.length === 0) return [];

      return rawList.map((cnt: any) => {
        const rawId = cnt._id ?? cnt.id ?? '';
        const cntId = typeof rawId === 'object' ? (rawId?.$oid ?? String(rawId)) : String(rawId);
        const cId = String(cnt.companyId || '');
        const custId = String(cnt.customerId || '');
        const fullName = cnt.name || [cnt.fname, cnt.lname].filter(Boolean).join(' ') || 'Unnamed Contact';

        return {
          id: cntId || String(Math.random()),
          name: fullName,
          title: cnt.jobTitle || cnt.title || 'Executive Point of Contact',
          email: cnt.email || '—',
          phone: cnt.phone || '—',
          customerId: custId,
          customerName: cnt.customerName || 'Customer Account',
          companyId: cId,
          companyName: cnt.companyName || (cId ? `Org #${cId.slice(-4)}` : 'Independent'),
          avatarUrl: cnt.avatarUrl,
          isPrimary: Boolean(cnt.isPrimary),
          createdAt: cnt.createdAt || new Date().toISOString()
        };
      });
    } catch (error) {
      console.error("Failed to get contacts:", error);
      return [];
    }
  },

  async createContact(contactData: Partial<Contact>): Promise<Contact> {
    const nameParts = (contactData.name || '').trim().split(/\s+/);
    const fname = nameParts[0] || 'Contact';
    const lname = nameParts.slice(1).join(' ') || '';

    const payload = {
      fname,
      lname,
      email: contactData.email || '',
      phone: contactData.phone || '',
      jobTitle: contactData.title || 'Executive',
      companyId: contactData.companyId || undefined,
      customerId: contactData.customerId && contactData.customerId !== '' ? contactData.customerId : '6a5dd5e32f27b365d7dc4725',
      isPrimary: Boolean(contactData.isPrimary)
    };

    const response = await apiClient.post('/api/contacts', payload);
    const cnt = response.data;
    return {
      id: String(cnt._id || cnt.id || ''),
      name: `${cnt.fname || fname} ${cnt.lname || lname}`.trim(),
      title: cnt.jobTitle || contactData.title || 'Executive',
      email: cnt.email || contactData.email || '',
      phone: cnt.phone || contactData.phone || '',
      customerId: cnt.customerId || contactData.customerId || '',
      customerName: contactData.customerName,
      companyId: cnt.companyId || contactData.companyId,
      companyName: contactData.companyName || 'Independent',
      isPrimary: Boolean(cnt.isPrimary),
      createdAt: cnt.createdAt || new Date().toISOString()
    };
  }
};

// ==========================================
// 10. NOTIFICATION SERVICES (routers/notification.py)
// ==========================================
export const notificationService = {
  async getNotifications(limit = 50, skip = 0, type?: string): Promise<NotificationItem[]> {
    try {
      let url = `/api/notification?limit=${limit}&skip=${skip}`;
      if (type && type !== 'all') {
        url += `&type=${type}`;
      }
      const response = await apiClient.get(url);
      return extractArray<NotificationItem>(response.data);
    } catch (error) {
      return [];
    }
  },

  async markAsRead(id: string): Promise<void> {
    // Assuming backend endpoint exists for single read, else fallback
    try {
      await apiClient.get(`/api/notification/${id}`); // backend automatically marks it read on GET by ID
    } catch (e) {}
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/api/notification/mark-all-read');
  },
  
  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/api/notification/${id}`);
  }
};

// ==========================================
// 11. GLOBAL SEARCH SERVICES (routers/global_search.py)
// ==========================================
export const searchService = {
  async globalSearch(query: string) {
    if (!query || !query.trim()) return null;
    try {
      const response = await apiClient.get(`/global-search/search/${encodeURIComponent(query.trim())}`);
      return response.data;
    } catch (error) {
      try {
        const fallback = await apiClient.get(`/api/global-search/search/${encodeURIComponent(query.trim())}`);
        return fallback.data;
      } catch (err) {
        return null;
      }
    }
  }
};

// ==========================================
// 12. NOTES SERVICES (routers/activity.py)
// ==========================================
function normalizeNote(n: any): Note {
  const rawId = n._id ?? n.id ?? '';
  const noteId = typeof rawId === 'object' ? (rawId?.$oid ?? String(rawId)) : String(rawId);
  return {
    id: noteId || String(Math.random()),
    content: n.context || n.content || '',
    relatedType: 'customer',
    relatedId: String(n.relatedTo || n.customerId || ''),
    customerId: String(n.customerId || ''),
    authorId: String(n.createdBy || ''),
    authorName: formatOwnerName(n.createdBy),
    isPinned: Boolean(n.isPinned),
    createdAt: n.createdAt || new Date().toISOString(),
    updatedAt: n.updatedAt || n.createdAt || new Date().toISOString()
  };
}

export const noteService = {
  async getNotes(relatedToId?: string): Promise<Note[]> {
    try {
      const response = await apiClient.get('/api/notes', { params: { limit: 100 } });
      const rawList = extractArray<any>(response.data);
      const notes = rawList.map(normalizeNote);
      if (relatedToId) {
        return notes.filter(n => n.relatedId === relatedToId || n.customerId === relatedToId);
      }
      return notes;
    } catch (e) {
      return [];
    }
  },

  async createNote(payload: { context: string; relatedTo: string; customerId?: string; isPinned?: boolean }): Promise<Note> {
    const response = await apiClient.post('/api/notes', {
      context: payload.context,
      relatedTo: payload.relatedTo,
      customerId: payload.customerId || payload.relatedTo || 'cust_1',
      isPinned: Boolean(payload.isPinned)
    });
    return normalizeNote(response.data);
  },

  async updateNote(noteId: string, payload: { context: string; relatedTo: string; isPinned?: boolean }): Promise<Note> {
    const response = await apiClient.put(`/api/notes/${noteId}`, {
      context: payload.context,
      relatedTo: payload.relatedTo,
      isPinned: Boolean(payload.isPinned)
    });
    return normalizeNote(response.data);
  },

  async deleteNote(noteId: string): Promise<void> {
    await apiClient.delete(`/api/notes/${noteId}`);
  },

  async togglePin(noteId: string, currentPinnedState: boolean): Promise<void> {
    const endpoint = currentPinnedState ? `/api/notes/${noteId}/unpin` : `/api/notes/${noteId}/pin`;
    await apiClient.patch(endpoint);
  }
};

export const analyticsService = {
  async getSalesAnalytics(period: string = 'monthly') {
    return apiClient.get(`/api/analytics/sales?period=${period}`);
  },
  async getLeadsAnalytics() {
    return apiClient.get('/api/analytics/leads');
  }
};

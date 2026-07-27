import React, { useEffect, useState } from 'react';
import { customerService, companyService, userService } from '../../services/crmServices';
import { Customer, Company, User } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { FilterDrawer } from '../../components/ui/FilterDrawer';
import { useUrlFilters } from '../../hooks/useUrlFilters';
import { ActivityStream } from '../../components/common/ActivityStream';
import { NoteManager } from '../../components/notes/NoteManager';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../constants/permissions';
import { UserPlus, Building2, Tag, Filter, RotateCcw, Edit, UserCheck, Download, Mail, Phone, Calendar as CalendarIcon } from 'lucide-react';

import { CustomerDetailPage } from './CustomerDetailPage';

export const CustomerListPage: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // URL Syncing Filter State
  const { filters, applyFilters, resetFilters } = useUrlFilters();

  // Form states
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+1 (555) 000-1122');
  const [status, setStatus] = useState<string>('active');
  const [assignedUserId, setAssignedUserId] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('Enterprise, VIP');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [custData, compData, userData] = await Promise.all([
        customerService.getCustomers(),
        companyService.getCompanies(),
        userService.getUsers()
      ]);
      setCustomers(custData);
      setCompanies(compData);
      setUsersList(userData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-open target customer profile if requested from Task click
  useEffect(() => {
    const targetCustId = localStorage.getItem('ent_crm_open_customer');
    if (targetCustId && customers.length > 0) {
      const match = customers.find(c => c.id === targetCustId);
      if (match) {
        setSelectedCustomer(match);
      }
      localStorage.removeItem('ent_crm_open_customer');
    }
  }, [customers]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedUserObj = usersList.find(u => u.id === assignedUserId);
      await customerService.createCustomer({
        name,
        companyId: companyId || undefined,
        companyName: companyName || 'Enterprise Org',
        email,
        phone,
        status: status as any,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        assignedUserId: assignedUserId || user?.id || 'usr_1',
        assignedUserName: selectedUserObj ? selectedUserObj.name : (user?.fname || 'Sophia Chen'),
        totalDealsValue: 0,
        activeDealsCount: 0
      });
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err) {
      console.error("Create Customer error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (cust: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCustomer(cust);
    setName(cust.name || '');
    setCompanyId(cust.companyId || '');
    setCompanyName(cust.companyName || '');
    setEmail(cust.email || '');
    setPhone(cust.phone || '');
    setStatus(cust.status || 'active');
    setAssignedUserId(cust.assignedUserId || '');
    setTagsInput(Array.isArray(cust.tags) ? cust.tags.join(', ') : '');
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setIsSubmitting(true);
    try {
      const selectedUserObj = usersList.find(u => u.id === assignedUserId);
      await customerService.updateCustomer(editingCustomer.id, {
        name,
        email,
        companyId: companyId || undefined,
        companyName,
        phone,
        status: status as any,
        assignedUserId: assignedUserId || undefined,
        assignedUserName: selectedUserObj ? selectedUserObj.name : undefined,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      });
      setEditingCustomer(null);
      setSelectedCustomer(null);
      resetForm();
      loadData();
    } catch (err) {
      console.error("Update Customer error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCompanyId('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setStatus('active');
    setAssignedUserId('');
    setTagsInput('');
  };

  const handleCompanySelect = (selectedId: string) => {
    setCompanyId(selectedId);
    const found = companies.find(c => c.id === selectedId);
    if (found) {
      setCompanyName(found.name);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Organization', 'Status', 'Account Owner', 'Created At'];
    const rows = filteredCustomers.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.companyName || '').replace(/"/g, '""')}"`,
      `"${c.status.toUpperCase()}"`,
      `"${(c.assignedUserName || '').replace(/"/g, '""')}"`,
      `"${new Date(c.createdAt).toLocaleDateString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customers_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic Client-side Filtering matching active URL Params
  const filteredCustomers = customers.filter(cust => {
    if (filters.status && cust.status.toLowerCase() !== filters.status.toLowerCase()) {
      return false;
    }
    if (filters.assignedUser && cust.assignedUserName !== filters.assignedUser) {
      return false;
    }
    return true;
  });

  const activeFilterCount = Object.values(filters).filter(v => v && v.trim() !== '').length;

  const companyOptions = [
    { label: '-- Select Organization / Company --', value: '' },
    ...companies.map(c => ({ label: c.name, value: c.id }))
  ];

  const userOptions = [
    { label: '-- Assign Account Owner --', value: '' },
    ...usersList.map(u => {
      const roleName = typeof u.role === 'string' ? u.role.replace('_', ' ') : 'Executive';
      const userName = u.name || (u.fname ? `${u.fname} ${u.lname || ''}`.trim() : u.email || 'User');
      return { label: `${userName} (${roleName})`, value: u.id || (u as any)._id || u.email };
    })
  ];

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      accessor: cust => (
        <div className="flex items-center gap-3">
          <Avatar name={cust.name} src={cust.avatarUrl} size="sm" />
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{cust.name}</span>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      accessor: cust => (
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Mail className="w-3.5 h-3.5 text-zinc-500" />
          <span>{cust.email}</span>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      accessor: cust => (
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Phone className="w-3.5 h-3.5 text-zinc-500" />
          <span>{cust.phone || '—'}</span>
        </div>
      )
    },
    {
      key: 'companyName',
      header: 'Company',
      sortable: true,
      accessor: cust => (
        <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
          <Building2 className="w-4 h-4 text-zinc-400" />
          <span>{cust.companyName || '—'}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: cust => (
        <Badge variant={cust.status === 'active' ? 'success' : cust.status === 'prospect' ? 'warning' : 'default'}>
          {(cust.status || 'NEW').toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'assignedUserName',
      header: 'Assigned To',
      sortable: true,
      accessor: cust => (
        <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>{cust.assignedUserName || 'Unassigned'}</span>
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Created At',
      sortable: true,
      accessor: cust => (
        <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
          <CalendarIcon className="w-3.5 h-3.5 text-zinc-500" />
          <span>{cust.createdAt ? new Date(cust.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: cust => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          {hasPermission(user, 'customers:update') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={e => handleOpenEdit(cust, e)}
              className="text-zinc-400 hover:text-blue-400 p-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )
    }
  ];

  if (selectedCustomer) {
    return (
      <CustomerDetailPage
        customerId={selectedCustomer.id}
        initialCustomer={selectedCustomer}
        onBack={() => setSelectedCustomer(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Customer Accounts</h2>
          <p className="text-xs text-zinc-500">Manage client profiles, attached contacts, deals, and activity timelines</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="flex items-center gap-2.5 w-full sm:w-auto order-2 sm:order-1">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              leftIcon={<Download className="w-4 h-4 text-emerald-400" />}
              title="Export Customers CSV"
              className="flex-1 sm:flex-none justify-center"
            >
              Export CSV
            </Button>
            <Button
              variant={activeFilterCount > 0 ? 'secondary' : 'outline'}
              onClick={() => setShowFilterDrawer(true)}
              leftIcon={<Filter className="w-4 h-4 text-blue-400" />}
              className="flex-1 sm:flex-none justify-center"
            >
              Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                title="Reset URL Filters"
                className="text-zinc-400 hover:text-zinc-200 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          {hasPermission(user, 'customers:create') && (
            <Button 
              onClick={() => { resetForm(); setShowCreateModal(true); }} 
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="w-full sm:w-auto justify-center order-1 sm:order-2"
            >
              New Customer Account
            </Button>
          )}
        </div>
      </div>

      {/* Main Data Table with Search Bar */}
      <DataTable
        columns={columns}
        data={filteredCustomers}
        isLoading={isLoading}
        searchPlaceholder="Search customers by name, company, email, phone..."
        onRowClick={cust => setSelectedCustomer(cust)}
        renderMobileCard={(cust: Customer) => (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={cust.name} src={cust.avatarUrl} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{cust.name}</div>
                  <div className="text-xs text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 shrink-0" />
                    {cust.companyName || 'No Company'}
                  </div>
                </div>
              </div>
              <Badge variant={cust.status === 'active' ? 'success' : cust.status === 'inactive' ? 'secondary' : 'warning'}>
                {cust.status}
              </Badge>
            </div>
            <div className="flex flex-col gap-1.5 text-[11px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-white/5">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" /> {cust.email}
              </div>
              <div className="flex items-center gap-2 truncate">
                <Phone className="w-3.5 h-3.5 shrink-0" /> {cust.phone || 'No phone'}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Pipeline Value</span>
              <span className="text-xs font-bold text-emerald-500">${(cust.totalDealsValue || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t border-zinc-100 dark:border-white/5">
              {hasPermission(user, 'customers:update') && (
                <button onClick={e => handleOpenEdit(cust, e)} className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      />

      {/* Advanced URL-Synced Filter Drawer */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        filters={filters}
        onApplyFilters={applyFilters}
        onResetFilters={resetFilters}
        title="Filter Customer Accounts"
        statusOptions={[
          { label: 'All Statuses', value: '' },
          { label: 'Active', value: 'active' },
          { label: 'Prospect', value: 'prospect' },
          { label: 'Inactive', value: 'inactive' }
        ]}
        userOptions={[
          { label: 'All Account Owners', value: '' },
          ...usersList.map(u => {
            const name = u.name || (u.fname ? `${u.fname} ${u.lname || ''}`.trim() : u.email);
            return { label: name, value: name };
          })
        ]}
      />

      {/* Centered Elevated Glassmorphic Modal Card for New Customer */}
      {hasPermission(user, 'customers:create') && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Register Customer Account"
          description="Create a client contact profile in FastAPI backend MongoDB"
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-customer-form" isLoading={isSubmitting} className="px-6">
                Save Customer Profile
              </Button>
            </div>
          }
        >
          <form id="create-customer-form" onSubmit={handleCreateCustomer} className="space-y-4 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Contact Name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="sarah@company.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Associated Organization (Company ID)"
                value={companyId}
                onChange={e => handleCompanySelect(e.target.value)}
                options={companyOptions}
              />
              <Input
                label="Phone Contact"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 000-1122"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Account Status"
                value={status}
                onChange={e => setStatus(e.target.value)}
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Prospect', value: 'prospect' },
                  { label: 'Inactive', value: 'inactive' }
                ]}
              />
              <Select
                label="Account Owner (Assigned Executive)"
                value={assignedUserId}
                onChange={e => setAssignedUserId(e.target.value)}
                options={userOptions}
              />
            </div>

            <Input
              label="Account Tags (comma-separated)"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Enterprise, VIP, Cloud"
            />
          </form>
        </Modal>
      )}

      {/* Centered Glassmorphic Modal Card for EDIT Customer */}
      {editingCustomer && hasPermission(user, 'customers:update') && (
        <Modal
          isOpen={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
          title="Update Customer Account"
          description={`Modify account details for ${editingCustomer.name} in FastAPI MongoDB`}
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button type="button" variant="ghost" onClick={() => setEditingCustomer(null)}>
                Cancel
              </Button>
              <Button type="submit" form="edit-customer-form" isLoading={isSubmitting} className="px-6">
                Update Customer Account
              </Button>
            </div>
          }
        >
          <form id="edit-customer-form" onSubmit={handleUpdateCustomer} className="space-y-4 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Contact Name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="sarah@company.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Associated Organization (Company ID)"
                value={companyId}
                onChange={e => handleCompanySelect(e.target.value)}
                options={companyOptions}
              />
              <Input
                label="Phone Contact"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 000-1122"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Account Status"
                value={status}
                onChange={e => setStatus(e.target.value)}
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Prospect', value: 'prospect' },
                  { label: 'Inactive', value: 'inactive' }
                ]}
              />
              <Select
                label="Account Owner (Assigned Executive)"
                value={assignedUserId}
                onChange={e => setAssignedUserId(e.target.value)}
                options={userOptions}
              />
            </div>

            <Input
              label="Account Tags (comma-separated)"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Enterprise, VIP, Cloud"
            />
          </form>
        </Modal>
      )}

      {/* Customer Profile & Activity Detail Drawer */}
      {selectedCustomer && (
        <Drawer
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title="Customer Profile Card"
          description={selectedCustomer.companyName}
          size="lg"
        >
          <div className="space-y-6">
            {/* Header Profile Summary */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md">
              <div className="flex items-center gap-4">
                <Avatar name={selectedCustomer.name} src={selectedCustomer.avatarUrl} size="xl" />
                <div>
                  <h3 className="text-lg font-bold">{selectedCustomer.name}</h3>
                  <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" /> {selectedCustomer.companyName || '—'}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="success">${(selectedCustomer.totalDealsValue || 0).toLocaleString()} Value</Badge>
                    <Badge variant="primary">{selectedCustomer.assignedUserName}</Badge>
                  </div>
                </div>
              </div>
              {hasPermission(user, 'customers:update') && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={e => handleOpenEdit(selectedCustomer, e)}
                  leftIcon={<Edit className="w-3.5 h-3.5" />}
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Quick Contact Specs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 border border-zinc-800 rounded-xl">
                <span className="text-zinc-400">Email Address</span>
                <div className="font-semibold text-zinc-100 mt-0.5">{selectedCustomer.email}</div>
              </div>
              <div className="p-3 border border-zinc-800 rounded-xl">
                <span className="text-zinc-400">Phone Contact</span>
                <div className="font-semibold text-zinc-100 mt-0.5">{selectedCustomer.phone}</div>
              </div>
            </div>

            {/* Attached Tags */}
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Account Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedCustomer.tags.map((t, idx) => (
                  <Badge key={idx} variant="primary">
                    <Tag className="w-3 h-3" /> {t}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Real FastAPI Activity Audit Stream */}
            <ActivityStream relatedTo={selectedCustomer.id} title="Client Audit Activity Stream" />

            {/* Intuitive Note Manager with Rich Text Editor & Pinned Notes */}
            <NoteManager relatedToId={selectedCustomer.id} relatedType="customer" />
          </div>
        </Drawer>
      )}
    </div>
  );
};

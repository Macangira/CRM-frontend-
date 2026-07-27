import React, { useEffect, useState, useMemo } from 'react';
import { contactService, companyService, customerService } from '../../services/crmServices';
import { Contact, Company, Customer } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Avatar } from '../../components/ui/avatar';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../constants/permissions';
import { Plus, Mail, Phone, Building2, Star, User, ExternalLink, Briefcase } from 'lucide-react';

export interface ContactsPageProps {
  onNavigate?: (path: string) => void;
}

export const ContactsPage: React.FC<ContactsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const cntData = await contactService.getContacts().catch(err => {
        console.error("getContacts error:", err);
        return [];
      });
      setContacts(cntData);

      // Load company and customer dropdown options in background
      companyService.getCompanies().then(setCompanies).catch(() => {});
      customerService.getCustomers().then(setCustomers).catch(() => {});
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);

    try {
      const matchedCompany = companies.find(c => c.id === companyId);
      const matchedCustomer = customers.find(c => c.id === customerId);

      await contactService.createContact({
        name: name.trim(),
        title: jobTitle.trim() || 'Executive Point of Contact',
        email: email.trim(),
        phone: phone.trim(),
        companyId: companyId || undefined,
        companyName: matchedCompany ? matchedCompany.name : undefined,
        customerId: customerId || (matchedCustomer ? matchedCustomer.id : 'cust_1'),
        customerName: matchedCustomer ? matchedCustomer.name : undefined,
        isPrimary
      });

      setShowCreateModal(false);
      setName(''); setJobTitle(''); setEmail(''); setPhone(''); setCompanyId(''); setCustomerId(''); setIsPrimary(false);
      await loadData(true);
    } catch (err) {
      console.error('Create Contact Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const companyOptions = useMemo(() => [
    { label: '-- Select Parent Company (Optional) --', value: '' },
    ...companies.map(c => ({ label: c.name, value: c.id }))
  ], [companies]);

  const customerOptions = useMemo(() => [
    { label: '-- Select Customer Account --', value: '' },
    ...customers.map(c => ({ label: c.companyName ? `${c.name} (${c.companyName})` : c.name, value: c.id }))
  ], [customers]);

  const columns: Column<Contact>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      accessor: cnt => (
        <div className="flex items-center gap-3">
          <Avatar name={cnt.name} src={cnt.avatarUrl} size="sm" />
          <div>
            <div className="font-bold text-zinc-100 flex items-center gap-1.5 text-sm">
              {cnt.name}
              {cnt.isPrimary && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
            </div>
            {cnt.customerName && (
              <div className="text-[11px] text-zinc-500 font-medium">Account: {cnt.customerName}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'jobTitle' as any,
      header: 'Job Title',
      sortable: true,
      accessor: cnt => (
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <Briefcase className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>{cnt.title || 'Executive'}</span>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      accessor: cnt => (
        <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium hover:underline">
          <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <a href={`mailto:${cnt.email}`}>{cnt.email}</a>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      accessor: cnt => (
        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
          <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>{cnt.phone}</span>
        </div>
      )
    },
    {
      key: 'companyName',
      header: 'Company',
      sortable: true,
      accessor: cnt => (
        <div
          onClick={e => {
            e.stopPropagation();
            if (onNavigate) onNavigate('/companies');
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:underline cursor-pointer group"
        >
          <Building2 className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-400 shrink-0" />
          <span>{cnt.companyName || 'Independent'}</span>
          {cnt.companyName && cnt.companyName !== 'Independent' && (
            <ExternalLink className="w-3 h-3 text-blue-500 group-hover:text-blue-400" />
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" /> Contacts Directory
          </h2>
          <p className="text-xs text-zinc-400">Individual decision makers, executives, and technical contacts linked to Parent Companies</p>
        </div>

        {hasPermission(user, 'contact:create') && (
          <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Quick-Add Contact
          </Button>
        )}
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={contacts}
        isLoading={isLoading}
        searchPlaceholder="Search contacts by name, email, job title, company..."
        renderMobileCard={(cnt: Contact) => (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={cnt.name} src={cnt.avatarUrl} size="md" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 truncate">
                  {cnt.name}
                  {cnt.isPrimary && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                </div>
                <div className="text-xs text-zinc-500 truncate mt-0.5 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 shrink-0" />
                  {cnt.title || 'Executive'}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-[11px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-white/5">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" /> {cnt.email}
              </div>
              <div className="flex items-center gap-2 truncate">
                <Phone className="w-3.5 h-3.5 shrink-0" /> {cnt.phone || 'No phone'}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Company</span>
              <div className="text-xs font-semibold text-blue-500 dark:text-blue-400 truncate flex items-center gap-1 max-w-[150px]">
                <Building2 className="w-3 h-3 shrink-0" />
                <span className="truncate">{cnt.companyName || 'Independent'}</span>
              </div>
            </div>
          </div>
        )}
      />

      {/* Centered Glassmorphic Quick-Add Contact Modal */}
      {hasPermission(user, 'contact:create') && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Quick-Add Contact Person"
          description="Register point of contact and link to Parent Organization Company"
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-contact-form" isLoading={isSubmitting} className="px-6">
                Save Contact Person
              </Button>
            </div>
          }
        >
          <form id="create-contact-form" onSubmit={handleCreateContact} className="space-y-4 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Amanda Thorne"
              />
              <Input
                label="Job Title / Role *"
                required
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Lead Security Auditor"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address *"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="athorne@company.com"
              />
              <Input
                label="Phone Number *"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 999-8877"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Parent Organization (Company)"
                value={companyId}
                onChange={e => setCompanyId(e.target.value)}
                options={companyOptions}
              />
              <Select
                label="Customer Account"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                options={customerOptions}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={e => setIsPrimary(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <label htmlFor="isPrimary" className="text-xs font-semibold text-zinc-300">
                Mark as Primary Point of Contact (⭐)
              </label>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

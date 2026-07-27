import React, { useEffect, useState } from 'react';
import { leadService } from '../../services/crmServices';
import { Lead, LeadSource, LeadStatus } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/button';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { LeadStatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../constants/permissions';
import { Edit, Globe, Linkedin, PhoneCall, Plus, Share2, UserPlus } from 'lucide-react';
import { LeadDetailPage } from './LeadDetailPage';

type LeadForm = Pick<Lead, 'title' | 'contactName' | 'companyName' | 'email' | 'phone' | 'value' | 'source' | 'notes'>;

const emptyForm: LeadForm = { title: '', contactName: '', companyName: '', email: '', phone: '', value: 0, source: 'website', notes: '' };
const sourceOptions = [
  { label: 'Website', value: 'website' }, { label: 'Referral', value: 'referral' }, { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Cold outreach', value: 'cold_outreach' }, { label: 'Event', value: 'event' }, { label: 'Partner', value: 'partner' }
];

export const LeadsPage: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | LeadSource>('all');
  const [form, setForm] = useState<LeadForm>(emptyForm);

  const loadLeads = async () => {
    setIsLoading(true);
    try { setLeads(await leadService.getLeads()); } finally { setIsLoading(false); }
  };
  useEffect(() => { loadLeads(); }, []);

  const sourceIcon = (source: LeadSource) => {
    if (source === 'linkedin') return <Linkedin className="h-3.5 w-3.5 text-blue-500" />;
    if (source === 'website') return <Globe className="h-3.5 w-3.5 text-emerald-500" />;
    if (source === 'referral') return <Share2 className="h-3.5 w-3.5 text-violet-500" />;
    return <PhoneCall className="h-3.5 w-3.5 text-zinc-500" />;
  };

  const openCreate = () => { setEditingLead(null); setForm(emptyForm); setIsDrawerOpen(true); };
  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setForm({ title: lead.title, contactName: lead.contactName, companyName: lead.companyName === '—' ? '' : lead.companyName, email: lead.email, phone: lead.phone, value: lead.value, source: lead.source, notes: lead.notes || '' });
    setIsDrawerOpen(true);
  };
  const updateForm = <K extends keyof LeadForm>(key: K, value: LeadForm[K]) => setForm(current => ({ ...current, [key]: value }));

  const saveLead = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingLead) await leadService.updateLead(editingLead.id, form);
      else await leadService.createLead({ ...form, status: 'new', assignedUserId: user?.id || '', assignedUserName: user?.name || '', convertedCustomerId: '' });
      setIsDrawerOpen(false); setEditingLead(null); setForm(emptyForm); await loadLeads();
    } finally { setIsSubmitting(false); }
  };

  const filteredLeads = leads.filter(lead => (statusFilter === 'all' || lead.status === statusFilter) && (sourceFilter === 'all' || lead.source === sourceFilter));
  const columns: Column<Lead>[] = [
    { key: 'title', header: 'Title', sortable: true, accessor: lead => <div><p className="font-bold text-zinc-900 dark:text-zinc-100">{lead.title}</p><p className="text-xs text-zinc-500">{lead.contactName} · {lead.companyName}</p></div> },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'status', header: 'Status', sortable: true, accessor: lead => <LeadStatusBadge status={lead.status} /> },
    { key: 'source', header: 'Source', sortable: true, accessor: lead => <div className="flex items-center gap-1.5 capitalize">{sourceIcon(lead.source)}{lead.source.replace('_', ' ')}</div> },
    { key: 'value', header: 'Value', sortable: true, accessor: lead => <span className="font-bold text-emerald-600 dark:text-emerald-400">${lead.value.toLocaleString()}</span> },
    { key: 'assignedUserName', header: 'Assigned To', sortable: true, accessor: lead => lead.assignedUserName || 'Unassigned' },
    { key: 'actions', header: '', accessor: lead => <div onClick={event => event.stopPropagation()}>{hasPermission(user, 'lead:update') && <Button variant="ghost" size="sm" onClick={() => openEdit(lead)} title="Edit lead"><Edit className="h-4 w-4" /></Button>}</div> }
  ];

  if (selectedLead) return <LeadDetailPage leadId={selectedLead.id} initialLead={selectedLead} onBack={() => setSelectedLead(null)} onEdit={lead => { setSelectedLead(null); openEdit(lead); }} />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Leads</h2><p className="text-xs text-zinc-500">Start each sales day by qualifying your newest opportunities.</p></div>{hasPermission(user, 'lead:create') && <Button onClick={openCreate} leftIcon={<UserPlus className="h-4 w-4" />}>Add lead</Button>}</div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-[#121215]"><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end"><div className="w-full sm:w-48"><Select label="Status" value={statusFilter} onChange={event => setStatusFilter(event.target.value as 'all' | LeadStatus)} options={[{ label: 'All statuses', value: 'all' }, { label: 'New', value: 'new' }, { label: 'Contacted', value: 'contacted' }, { label: 'Qualified', value: 'qualified' }, { label: 'Lost', value: 'lost' }, { label: 'Converted', value: 'converted' }]} /></div><div className="w-full sm:w-48"><Select label="Source" value={sourceFilter} onChange={event => setSourceFilter(event.target.value as 'all' | LeadSource)} options={[{ label: 'All sources', value: 'all' }, ...sourceOptions]} /></div>{(statusFilter !== 'all' || sourceFilter !== 'all') && <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('all'); setSourceFilter('all'); }}>Clear filters</Button>}</div><DataTable columns={columns} data={filteredLeads} isLoading={isLoading} onRowClick={setSelectedLead} searchPlaceholder="Search by title, email, contact, or company..." renderMobileCard={(lead: Lead) => (
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{lead.title}</div>
                <div className="text-xs text-zinc-500 truncate mt-0.5">
                  {lead.contactName} · {lead.companyName}
                </div>
              </div>
              <LeadStatusBadge status={lead.status} />
            </div>
            <div className="flex flex-col gap-1.5 text-[11px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-white/5">
              <div className="flex items-center gap-2 truncate">
                <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">@</div> {lead.email}
              </div>
              <div className="flex items-center gap-2 capitalize truncate">
                {sourceIcon(lead.source)} {lead.source.replace('_', ' ')}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Estimated Value</span>
              <span className="text-xs font-bold text-emerald-500">${(lead.value || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t border-zinc-100 dark:border-white/5">
                {hasPermission(user, 'lead:update') && (
                  <button onClick={e => { e.stopPropagation(); openEdit(lead); }} className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                )}
            </div>
          </div>
        )} /></div>
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editingLead ? 'Update lead' : 'Add lead'} description={editingLead ? `Update ${editingLead.contactName}'s sales profile.` : 'Capture a new sales opportunity.'}><form onSubmit={saveLead} className="space-y-4"><Input label="Lead title" required value={form.title} onChange={event => updateForm('title', event.target.value)} placeholder="Enterprise platform expansion" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Contact name" required value={form.contactName} onChange={event => updateForm('contactName', event.target.value)} placeholder="Avery Patel" /><Input label="Email" type="email" required value={form.email} onChange={event => updateForm('email', event.target.value)} placeholder="avery@company.com" /></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Company" value={form.companyName} onChange={event => updateForm('companyName', event.target.value)} placeholder="Company name" /><Input label="Phone" value={form.phone} onChange={event => updateForm('phone', event.target.value)} placeholder="+1 (555) 010-0200" /></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Estimated value ($)" type="number" min="0" required value={form.value} onChange={event => updateForm('value', Number(event.target.value))} /><Select label="Source" value={form.source} onChange={event => updateForm('source', event.target.value as LeadSource)} options={sourceOptions} /></div><label className="block space-y-1"><span className="text-xs font-semibold text-zinc-300">Notes</span><textarea value={form.notes} onChange={event => updateForm('notes', event.target.value)} className="min-h-24 w-full rounded-xl border border-zinc-800 bg-[#12141d] p-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/80" placeholder="Qualification notes, next step, or context…" /></label><Button type="submit" className="w-full" isLoading={isSubmitting} leftIcon={editingLead ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}>{editingLead ? 'Save changes' : 'Create lead'}</Button></form></Drawer>
    </div>
  );
};

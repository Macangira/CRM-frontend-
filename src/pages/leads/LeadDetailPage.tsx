import React, { useEffect, useState } from 'react';
import { Lead } from '../../types';
import { leadService } from '../../services/crmServices';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar } from '../../components/ui/avatar';
import { LeadStatusBadge } from '../../components/common/StatusBadge';
import { ActivityStream } from '../../components/common/ActivityStream';
import { ArrowLeft, Building2, Calendar, DollarSign, Mail, Phone, UserCheck } from 'lucide-react';

interface LeadDetailPageProps {
  leadId: string;
  initialLead?: Lead | null;
  onBack: () => void;
  onEdit: (lead: Lead) => void;
}

export const LeadDetailPage: React.FC<LeadDetailPageProps> = ({ leadId, initialLead, onBack, onEdit }) => {
  const [lead, setLead] = useState<Lead | null>(initialLead || null);
  const [isLoading, setIsLoading] = useState(!initialLead);

  useEffect(() => {
    let active = true;
    leadService.getLeadById(leadId).then(result => {
      if (active && result) setLead(result);
    }).finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, [leadId]);

  if (isLoading) return <div className="p-10 text-center text-sm text-zinc-500">Loading lead profile…</div>;
  if (!lead) return <div className="space-y-4 p-10 text-center"><p className="text-sm text-zinc-500">Lead not found.</p><Button onClick={onBack}>Back to leads</Button></div>;

  const details = [
    { label: 'Email', value: lead.email || '—', icon: <Mail className="h-4 w-4" /> },
    { label: 'Phone', value: lead.phone || '—', icon: <Phone className="h-4 w-4" /> },
    { label: 'Company', value: lead.companyName || '—', icon: <Building2 className="h-4 w-4" /> },
    { label: 'Assigned to', value: lead.assignedUserName || 'Unassigned', icon: <UserCheck className="h-4 w-4" /> },
    { label: 'Lead value', value: `$${lead.value.toLocaleString()}`, icon: <DollarSign className="h-4 w-4" /> },
    { label: 'Created', value: new Date(lead.createdAt).toLocaleDateString(), icon: <Calendar className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>Back to leads</Button>
        <Button onClick={() => onEdit(lead)}>Edit lead</Button>
      </div>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4"><Avatar name={lead.contactName} size="xl" /><div><div className="flex items-center gap-3"><h1 className="text-2xl font-extrabold">{lead.title}</h1><LeadStatusBadge status={lead.status} /></div><p className="mt-1 text-sm text-zinc-400">{lead.contactName} · {lead.companyName || 'Independent lead'}</p></div></div>
          <div className="text-left sm:text-right"><p className="text-xs uppercase tracking-wide text-zinc-400">Estimated value</p><p className="text-2xl font-extrabold text-emerald-400">${lead.value.toLocaleString()}</p></div>
        </div>
      </section>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2"><h2 className="mb-4 text-sm font-bold text-zinc-100">Lead profile</h2><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{details.map(item => <div key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"><div className="flex items-center gap-2 text-xs text-zinc-400">{item.icon}{item.label}</div><p className="mt-1 font-semibold text-zinc-100">{item.value}</p></div>)}</div>{lead.notes && <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"><p className="text-xs text-zinc-400">Notes</p><p className="mt-1 text-sm text-zinc-200">{lead.notes}</p></div>}</Card>
        <Card><h2 className="mb-4 text-sm font-bold text-zinc-100">Activity timeline</h2><ActivityStream relatedTo={lead.id} /></Card>
      </div>
    </div>
  );
};

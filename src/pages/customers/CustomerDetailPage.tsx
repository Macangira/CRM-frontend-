import React, { useEffect, useState } from 'react';
import { customerService, dealService, taskService, noteService, contactService } from '../../services/crmServices';
import { Customer, Deal, Task, Note, Contact } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/avatar';
import { ActivityStream } from '../../components/common/ActivityStream';
import { PriorityBadge, TaskStatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, Mail, Phone, UserCheck, DollarSign, Briefcase, CheckSquare, FileText, Activity as ActivityIcon, Plus, ArrowLeft, Tag, Calendar as CalendarIcon
} from 'lucide-react';

export interface CustomerDetailPageProps {
  customerId: string;
  initialCustomer?: Customer | null;
  onBack: () => void;
  onNavigate?: (path: string) => void;
}

export type TabType = 'overview' | 'contacts' | 'deals' | 'tasks' | 'notes' | 'activity';

export const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({
  customerId,
  initialCustomer,
  onBack,
  onNavigate
}) => {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(initialCustomer || null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(!initialCustomer);
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    async function loadCustomerDetail() {
      setIsLoading(true);
      try {
        const [c, dList, tList, cList, nList] = await Promise.all([
          customerService.getCustomerById(customerId),
          dealService.getDeals().catch(() => []),
          taskService.getTasks().catch(() => []),
          contactService.getContacts().catch(() => []),
          noteService.getNotes(customerId).catch(() => [])
        ]);

        let targetCust = c;
        if (!targetCust) {
          const allCust = await customerService.getCustomers();
          targetCust = allCust.find(item => item.id === customerId);
        }

        if (targetCust) {
          setCustomer(targetCust);

          // Filter real associated deals & tasks
          const matchingDeals = dList.filter(d => d.customerId === customerId || (targetCust?.companyId && d.companyId === targetCust.companyId));
          setDeals(matchingDeals);

          const matchingTasks = tList.filter(t => t.relatedTo=== customerId || t.assignedUserId === customerId);
          setTasks(matchingTasks);

          // Filter real contacts or derive primary real contact from customer object
          const matchingContacts = cList.filter(cnt => cnt.customerId === customerId || (targetCust?.companyId && cnt.companyId === targetCust.companyId));
          if (matchingContacts.length > 0) {
            setContacts(matchingContacts);
          } else {
            setContacts([
              {
                id: `cnt_primary_${targetCust.id}`,
                name: targetCust.name,
                title: 'Primary Customer Contact',
                email: targetCust.email || '—',
                phone: targetCust.phone || '—',
                customerId: targetCust.id,
                companyId: targetCust.companyId,
                companyName: targetCust.companyName,
                isPrimary: true,
                createdAt: targetCust.createdAt
              }
            ]);
          }

          setNotes(nList);
        }
      } catch (err) {
        console.error("Failed to load customer details:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomerDetail();
  }, [customerId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !customer) return;
    setIsAddingNote(true);
    try {
      const addedNote: Note = {
        id: `nte_${Date.now()}`,
        title: 'CLIENT NOTE',
        content: newNoteText.trim(),
        authorId: user?.id || 'usr_1',
        authorName: user?.fname ? `${user.fname} ${user.lname || ''}`.trim() : 'Account Executive',
        relatedTo: customer.id,
        relatedType: 'customer',
        assginedTo: user?.id || '',
        createdAt: new Date().toISOString()
      };
      setNotes(prev => [addedNote, ...prev]);
      setNewNoteText('');
    } finally {
      setIsAddingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-zinc-800 rounded mx-auto" />
        <div className="h-64 w-full bg-zinc-900 rounded-2xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-12 text-center space-y-4">
        <h3 className="text-lg font-bold text-zinc-200">Customer Account Not Found</h3>
        <Button onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Customer List
        </Button>
      </div>
    );
  }

  // Live total value calculated from real associated deals
  const totalPipelineValue = deals.length > 0
    ? deals.reduce((acc, d) => acc + (d.value || 0), 0)
    : (customer.totalDealsValue || 0);

  const tabs = [
    { id: 'overview', label: 'Overview (360°)', icon: <Building2 className="w-4 h-4" /> },
    { id: 'contacts', label: `Contacts (${contacts.length})`, icon: <Mail className="w-4 h-4" /> },
    { id: 'deals', label: `Deals (${deals.length})`, icon: <Briefcase className="w-4 h-4" /> },
    { id: 'tasks', label: `Tasks (${tasks.length})`, icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'notes', label: `Notes (${notes.length})`, icon: <FileText className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity Timeline', icon: <ActivityIcon className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Button & Action Controls */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Customers List
        </Button>
      </div>

      {/* 360 Header Profile Hero Banner */}
      <div className="relative overflow-hidden p-6 bg-zinc-900/90 border border-zinc-800 text-white rounded-2xl shadow-xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 min-w-0">
            <Avatar name={customer.name} src={customer.avatarUrl} size="xl" className="border-0 ring-0 shadow-none shrink-0" />
            <div className="min-w-0 w-full">
              <div className="flex items-center gap-3 min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-100 truncate">{customer.name}</h1>
                <Badge variant={customer.status === 'active' ? 'success' : 'primary'} className="shrink-0">
                  {(customer.status || 'NEW').toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-zinc-400 flex items-center gap-2 mt-1 truncate">
                <Building2 className="w-4 h-4 text-blue-400 shrink-0" /> <span className="truncate">{customer.companyName || '—'}</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-3">
                <span className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" /> <span className="truncate">{customer.email || '—'}</span></span>
                <span className="flex items-center gap-1.5 shrink-0"><Phone className="w-3.5 h-3.5 text-zinc-500" /> {customer.phone || '—'}</span>
                <span className="flex items-center gap-1.5 shrink-0"><UserCheck className="w-3.5 h-3.5 text-blue-400" /> Owner: {customer.assignedUserName || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:justify-end items-center gap-3 shrink-0">
            <div className="text-left sm:text-right px-4 py-2 bg-zinc-800/80 rounded-xl border border-zinc-700/60 min-w-[140px]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Real Pipeline Value</span>
              <span className="text-xl font-extrabold text-emerald-400 truncate block">${totalPipelineValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 360° Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap min-w-[3rem] ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
            title={tab.label}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT: 1. OVERVIEW (360° KPIs & SPECS) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Real Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 uppercase font-semibold">Total Pipeline Value</span>
                  <div className="text-xl font-bold text-white mt-1">${totalPipelineValue.toLocaleString()}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="p-4 border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 uppercase font-semibold">Active Deals</span>
                  <div className="text-xl font-bold text-white mt-1">{deals.length} Deals</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="p-4 border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 uppercase font-semibold">Attached Contacts</span>
                  <div className="text-xl font-bold text-white mt-1">{contacts.length} Contacts</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="p-4 border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 uppercase font-semibold">Assigned Tasks</span>
                  <div className="text-xl font-bold text-white mt-1">{tasks.length} Tasks</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real Account Specs Details */}
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-400" /> Account Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 block">Customer Full Name</span>
                  <span className="font-bold text-zinc-100 mt-0.5 block">{customer.name}</span>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 block">Email Address</span>
                  <span className="font-bold text-zinc-100 mt-0.5 block">{customer.email || '—'}</span>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 block">Phone Contact</span>
                  <span className="font-bold text-zinc-100 mt-0.5 block">{customer.phone || '—'}</span>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 block">Organization / Company</span>
                  <span className="font-bold text-zinc-100 mt-0.5 block">{customer.companyName || '—'}</span>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 block">Account Owner</span>
                  <span className="font-bold text-zinc-100 mt-0.5 block">{customer.assignedUserName || 'Unassigned'}</span>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 block">Creation Date</span>
                  <span className="font-bold text-zinc-100 mt-0.5 block">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </span>
                </div>
                {Array.isArray(customer.tags) && customer.tags.length > 0 && (
                  <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                    <span className="text-zinc-400 block mb-1.5">Account Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {customer.tags.map((t, idx) => (
                        <Badge key={idx} variant="primary">
                          <Tag className="w-3 h-3" /> {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* FastAPI Real Activity Audit Stream */}
            <Card className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <ActivityIcon className="w-4 h-4 text-emerald-400" /> Account Audit Activity Stream
              </h3>
              <ActivityStream relatedTo={customer.id} />
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. CONTACTS */}
      {activeTab === 'contacts' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-100">Attached Contacts & Stakeholders</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map(cnt => (
              <div key={cnt.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-start gap-4">
                <Avatar name={cnt.name} size="lg" />
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-100">{cnt.name}</span>
                    {cnt.isPrimary && <Badge variant="success">PRIMARY</Badge>}
                  </div>
                  <div className="text-zinc-400">{cnt.title || 'Client Stakeholder'}</div>
                  <div className="text-blue-400 flex items-center gap-1"><Mail className="w-3 h-3" /> {cnt.email || '—'}</div>
                  <div className="text-zinc-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {cnt.phone || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB CONTENT: 3. DEALS */}
      {activeTab === 'deals' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-100">Associated Pipeline Deals</h3>
          </div>
          <div className="space-y-3">
            {deals.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No active pipeline deals associated with this customer account.</p>
            ) : (
              deals.map(dl => (
                <div key={dl.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                  <div className="space-y-1 min-w-0">
                    <div className="font-bold text-sm text-zinc-100 truncate">{dl.title || 'Pipeline Deal'}</div>
                    <div className="text-xs text-zinc-400">Stage: <span className="text-zinc-200 capitalize">{dl.stage}</span></div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center sm:text-right w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                    <div className="font-bold text-emerald-400 text-base">${(dl.value || 0).toLocaleString()}</div>
                    <Badge variant="primary">{(dl.stage || 'prospect').toUpperCase()}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB CONTENT: 4. TASKS */}
      {activeTab === 'tasks' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-100">Action Items & Tasks</h3>
          </div>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No pending tasks assigned to this customer.</p>
            ) : (
              tasks.map(tsk => (
                <div key={tsk.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                  <div className="min-w-0 w-full">
                    <h4 className="font-bold text-sm text-zinc-100 truncate">{tsk.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 truncate">{tsk.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0 shrink-0">
                    {tsk.priority && <PriorityBadge priority={tsk.priority} />}
                    {tsk.status && <TaskStatusBadge status={tsk.status} />}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB CONTENT: 5. NOTES */}
      {activeTab === 'notes' && (
        <Card className="space-y-4">
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              placeholder="Add client interaction note or meeting summary..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" isLoading={isAddingNote} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Post Client Note
              </Button>
            </div>
          </form>

          <div className="space-y-3 pt-2">
            {notes.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No client interaction notes logged yet.</p>
            ) : (
              notes.map(nte => (
                <div key={nte.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-200">{nte.authorName || 'Account Executive'}</span>
                    <span className="text-zinc-500">{new Date(nte.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{nte.content}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB CONTENT: 6. ACTIVITY TIMELINE */}
      {activeTab === 'activity' && (
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
            <ActivityIcon className="w-4 h-4 text-emerald-400" /> Full Audit Activity Timeline
          </h3>
          <ActivityStream relatedTo={customer.id} />
        </Card>
      )}
    </div>
  );
};

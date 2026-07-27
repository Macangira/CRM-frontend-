import React, { useEffect, useState, useMemo } from 'react';
import { dealService, userService, customerService } from '../../services/crmServices';
import { Deal, DealStage, Customer } from '../../types';
import { KanbanBoard } from '../../components/kanban/KanbanBoard';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/Modal';
import { FilterDrawer, FilterValues } from '../../components/ui/FilterDrawer';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { DealStageBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../constants/permissions';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import {
  LayoutGrid, Table as TableIcon, Plus, DollarSign, TrendingUp,
  Filter, Calendar, User, Briefcase, Download, Target, ChevronUp, ChevronDown, Edit, Trash2
} from 'lucide-react';

const STAGE_OPTIONS = [
  { label: 'All Stages', value: '' },
  { label: 'Qualification', value: 'qualification' },
  { label: 'Proposal', value: 'proposal' },
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Won 🏆', value: 'won' },
  { label: 'Lost', value: 'lost' },
];

const STAGE_ORDER: DealStage[] = ['qualification', 'proposal', 'negotiation', 'won', 'lost'];

function formatCurrency(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function isHexId(s: string) {
  return typeof s === 'string' && /^[0-9a-f]{24}$/i.test(s.trim());
}

export const DealsPage: React.FC = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [customersList, setCustomersList] = useState<Customer[]>([]);

  // Table filters
  const [filters, setFilters] = useState<FilterValues>({ status: '', assignedUser: '' });
  const [stageFilter, setStageFilter] = useState('');
  const [valueSort, setValueSort] = useState<'asc' | 'desc' | null>(null);

  // Create form states
  const [title, setTitle] = useState('');
  const [value, setValue] = useState(0);
  const [stage, setStage] = useState<DealStage>('proposal');
  const [probability, setProbability] = useState(60);
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDeals = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [data, users, custs] = await Promise.all([
        dealService.getDeals(),
        userService.getUsers().catch(() => []),
        customerService.getCustomers().catch(() => [])
      ]);
      setDeals(data);
      setUsersList(Array.isArray(users) ? users : []);
      setCustomersList(Array.isArray(custs) ? custs : []);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => { loadDeals(); }, []);

  const handleStageChange = async (dealId: string, newStage: DealStage) => {
    setDeals(prev => prev.map(d => {
      if (d.id !== dealId) return d;
      const prob = newStage === 'won' ? 100 : newStage === 'lost' ? 0 : d.probability;
      return { ...d, stage: newStage, probability: prob };
    }));
    await dealService.updateDealStage(dealId, newStage);
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await dealService.createDeal({
        title: title.trim(),
        customerId: customerId || '',
        customerName: '',
        companyName: '',
        value: Number(value),
        stage,
        probability: Number(probability),
        expectedCloseDate: expectedCloseDate || '',
        assignedUserId: '',
        assignedUserName: '',
        tags: [],
      });
      // Close modal & reset form
      setShowCreateModal(false);
      setTitle(''); setValue(0); setStage('proposal'); setProbability(60);
      setExpectedCloseDate(''); setCustomerId('');
      // Silent refresh — no loading flash, deals stay visible
      await loadDeals(true);
    } catch (err) {
      console.error('Create deal error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Customer Options for dropdown
  const customerOptions = useMemo(() => [
    { label: '-- Select Associated Customer --', value: '' },
    ...customersList.map(c => ({
      label: c.companyName ? `${c.name} (${c.companyName})` : c.name,
      value: c.id
    }))
  ], [customersList]);

  // User options for filter
  const userOptions = useMemo(() => [
    { label: 'All Owners', value: '' },
    ...usersList.map(u => {
      const name = u.name || (u.fname ? `${u.fname} ${u.lname || ''}`.trim() : u.email || 'User');
      return { label: name, value: name };
    })
  ], [usersList]);

  // Filtered & sorted deals
  const filteredDeals = useMemo(() => {
    let result = [...deals];

    // Stage filter
    if (stageFilter) {
      result = result.filter(d => d.stage === stageFilter);
    }

    // Assigned user filter (from FilterDrawer)
    if (filters.assignedUser) {
      result = result.filter(d => {
        const owner = d.assignedUserName || d.assignedUserId || '';
        return owner === filters.assignedUser;
      });
    }

    // Value sort
    if (valueSort === 'asc') result.sort((a, b) => a.value - b.value);
    if (valueSort === 'desc') result.sort((a, b) => b.value - a.value);

    return result;
  }, [deals, stageFilter, filters, valueSort]);

  // KPI Metrics
  const totalPipelineValue = filteredDeals
    .filter(d => d.stage !== 'lost')
    .reduce((sum, d) => sum + (d.value || 0), 0);

  const openDeals = filteredDeals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;
  const wonDeals = filteredDeals.filter(d => d.stage === 'won');
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  // Weighted forecast
  const weightedForecast = filteredDeals
    .filter(d => d.stage !== 'lost')
    .reduce((sum, d) => sum + (d.value || 0) * (d.probability / 100), 0);

  const activeFilterCount = (stageFilter ? 1 : 0) + (filters.assignedUser ? 1 : 0);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Title', 'Customer', 'Value', 'Stage', 'Probability %', 'Expected Close', 'Assigned To', 'Created At'];
    const rows = filteredDeals.map(d => [
      d.title,
      d.customerName || '—',
      d.value,
      d.stage,
      `${d.probability}%`,
      formatDate(d.expectedCloseDate),
      d.assignedUserName || '—',
      formatDate(d.createdAt)
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `deals_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Edit & Delete form states
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);

  const handleOpenEdit = (deal: Deal, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDeal(deal);
    setTitle(deal.title);
    setValue(deal.value);
    setStage(deal.stage);
    setProbability(deal.probability);
    setCustomerId(deal.customerId || '');
    if (deal.expectedCloseDate) {
      const d = new Date(deal.expectedCloseDate);
      const formatted = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : '';
      setExpectedCloseDate(formatted);
    } else {
      setExpectedCloseDate('');
    }
  };

  const handleUpdateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal || !title.trim()) return;
    setIsSubmitting(true);
    try {
      await dealService.updateDeal(editingDeal.id, {
        title: title.trim(),
        customerId: customerId || '',
        value: Number(value),
        stage,
        probability: Number(probability),
        expectedCloseDate: expectedCloseDate || '',
      });
      setEditingDeal(null);
      setTitle(''); setValue(0); setStage('proposal'); setProbability(60);
      setExpectedCloseDate(''); setCustomerId('');
      await loadDeals(true);
    } catch (err) {
      console.error('Update deal error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDeal = async () => {
    if (!deletingDeal) return;
    setIsSubmitting(true);
    try {
      await dealService.deleteDeal(deletingDeal.id);
      setDeletingDeal(null);
      await loadDeals(true);
    } catch (err) {
      console.error('Delete deal error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Deal>[] = [
    {
      key: 'title',
      header: 'Deal Title',
      sortable: true,
      accessor: d => (
        <div>
          <div className="font-semibold text-zinc-100 text-sm">{d.title}</div>
          {d.companyName && !isHexId(d.companyName) && (
            <div className="text-[11px] text-zinc-500 mt-0.5">{d.companyName}</div>
          )}
        </div>
      )
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      accessor: d => (
        <span className="text-zinc-300 text-sm">
          {d.customerName && !isHexId(d.customerName) ? d.customerName : '—'}
        </span>
      )
    },
    {
      key: 'value',
      header: (
        <button
          onClick={() => setValueSort(prev => prev === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-1 text-zinc-300 hover:text-white font-semibold text-xs uppercase tracking-wide"
        >
          Value
          {valueSort === 'desc' ? <ChevronDown className="w-3.5 h-3.5 text-blue-400" /> :
           valueSort === 'asc'  ? <ChevronUp className="w-3.5 h-3.5 text-blue-400" /> :
           <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />}
        </button>
      ) as any,
      sortable: false,
      accessor: d => (
        <span className="font-bold text-emerald-400 tabular-nums">{formatCurrency(d.value)}</span>
      )
    },
    {
      key: 'stage',
      header: 'Stage',
      sortable: true,
      accessor: d => <DealStageBadge stage={d.stage} />
    },
    {
      key: 'probability',
      header: 'Win %',
      sortable: true,
      accessor: d => {
        const pct = d.probability || 0;
        const color = pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400';
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-zinc-700 overflow-hidden">
              <div
                className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${color}`}>{pct}%</span>
          </div>
        );
      }
    },
    {
      key: 'expectedCloseDate',
      header: 'Close Date',
      sortable: true,
      accessor: d => {
        if (!d.expectedCloseDate) return <span className="text-zinc-500">—</span>;
        const date = new Date(d.expectedCloseDate);
        const isOverdue = date < new Date() && d.stage !== 'won' && d.stage !== 'lost';
        return (
          <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400 font-semibold' : 'text-zinc-400'}`}>
            <Calendar className="w-3 h-3" />
            {formatDate(d.expectedCloseDate)}
          </span>
        );
      }
    },
    {
      key: 'assignedUserName',
      header: 'Assigned To',
      sortable: true,
      accessor: d => {
        const name = d.assignedUserName && !isHexId(d.assignedUserName) ? d.assignedUserName : '—';
        return (
          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
            <User className="w-3 h-3 text-zinc-500" />
            {name}
          </span>
        );
      }
    },
    {
      key: 'id',
      header: 'Actions',
      sortable: false,
      accessor: d => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          {hasPermission(user, 'deal:update') && (
            <button
              onClick={e => handleOpenEdit(d, e)}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-blue-400 rounded-lg transition-colors"
              title="Edit Deal"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          {hasPermission(user, 'deal:delete') && (
            <button
              onClick={e => {
                e.stopPropagation();
                setDeletingDeal(d);
              }}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
              title="Soft Delete Deal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─── Header with Pipeline Summary ─── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" />
              Deals & Revenue Pipeline
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Track active opportunities, forecast revenue, and manage pipeline stages</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View switcher */}
            <div className="flex items-center bg-zinc-800 p-1 rounded-xl border border-zinc-700/60">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-zinc-700 text-blue-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" /> Table
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-zinc-700 text-blue-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Kanban
              </button>
            </div>

            <Button variant="outline" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-3.5 h-3.5" />}>
              Export CSV
            </Button>

            {viewMode === 'table' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterDrawer(true)}
                leftIcon={<Filter className="w-3.5 h-3.5" />}
              >
                Filters {activeFilterCount > 0 && (
                  <span className="ml-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>
                )}
              </Button>
            )}

            {hasPermission(user, 'deal:create') && (
              <Button size="sm" onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                New Deal
              </Button>
            )}
          </div>
        </div>

        {/* Pipeline KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Pipeline</div>
              <div className="text-lg font-extrabold text-blue-400 tabular-nums">{formatCurrency(totalPipelineValue)}</div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-600/20 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Weighted Forecast</div>
              <div className="text-lg font-extrabold text-violet-400 tabular-nums">{formatCurrency(weightedForecast)}</div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Won Revenue</div>
              <div className="text-lg font-extrabold text-emerald-400 tabular-nums">{formatCurrency(wonValue)}</div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-600/20 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Open Deals</div>
              <div className="text-lg font-extrabold text-amber-400 tabular-nums">{openDeals}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stage Quick-Filter Tabs (Table view) ─── */}
      {viewMode === 'table' && (
        <div className="flex items-center gap-2 flex-wrap">
          {STAGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStageFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                stageFilter === opt.value
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                  : 'text-zinc-400 border-zinc-700/50 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {opt.label}
              {opt.value && (
                <span className="ml-1.5 text-[10px] tabular-nums text-zinc-500">
                  ({deals.filter(d => d.stage === opt.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ─── Main Content ─── */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          deals={deals}
          onStageChange={handleStageChange}
          onAddDeal={stg => {
            setStage(stg);
            setShowCreateModal(true);
          }}
          onEditDeal={hasPermission(user, 'deal:update') ? handleOpenEdit : undefined}
          onDeleteDeal={hasPermission(user, 'deal:delete') ? (deal, e) => { e.stopPropagation(); setDeletingDeal(deal); } : undefined}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredDeals}
          isLoading={isLoading}
          searchPlaceholder="Search deals by title, customer, owner..."
          renderMobileCard={(d: Deal) => (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{d.title}</div>
                  <div className="text-xs text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3 shrink-0" />
                    {d.customerName && !isHexId(d.customerName) ? d.customerName : 'No Customer'}
                  </div>
                </div>
                <DealStageBadge stage={d.stage} />
              </div>
              <div className="flex flex-col gap-1.5 text-[11px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-white/5">
                <div className="flex items-center gap-2 truncate">
                  <User className="w-3.5 h-3.5 shrink-0" /> Assigned: {d.assignedUserName && !isHexId(d.assignedUserName) ? d.assignedUserName : 'Unassigned'}
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Calendar className="w-3.5 h-3.5 shrink-0" /> Close: {formatDate(d.expectedCloseDate || '')}
                </div>
              </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Pipeline Value</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400">{d.probability}%</span>
                    <span className="text-xs font-bold text-emerald-500">{formatCurrency(d.value)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t border-zinc-100 dark:border-white/5">
                  {hasPermission(user, 'deal:update') && (
                    <button onClick={e => handleOpenEdit(d, e)} className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {hasPermission(user, 'deal:delete') && (
                    <button onClick={e => { e.stopPropagation(); setDeletingDeal(d); }} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
        />
      )}

      {/* ─── Filter Drawer ─── */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        filters={filters}
        onApplyFilters={f => setFilters(f)}
        onResetFilters={() => setFilters({ status: '', assignedUser: '' })}
        title="Filter Deals"
        statusOptions={STAGE_OPTIONS.map(s => ({ label: s.label, value: s.value }))}
        userOptions={userOptions}
      />

      {/* ─── Centered Elevated Glassmorphic Modal Card for New Deal (Matches Customer UI) ─── */}
      {hasPermission(user, 'deal:create') && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Deal Opportunity"
          description="Register revenue opportunity in FastAPI backend MongoDB"
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-deal-form" isLoading={isSubmitting} className="px-6">
                Save Deal Opportunity
              </Button>
            </div>
          }
        >
          <form id="create-deal-form" onSubmit={handleCreateDeal} className="space-y-4 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Deal Title *"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Acme Enterprise License"
              />
              <Select
                label="Associated Customer"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                options={customerOptions}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Deal Value ($)"
                type="number"
                value={value}
                onChange={e => setValue(Number(e.target.value))}
                placeholder="0"
              />
              <Select
                label="Pipeline Stage"
                value={stage}
                onChange={e => setStage(e.target.value as DealStage)}
                options={STAGE_OPTIONS.filter(s => s.value !== '')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Win Probability (%)"
                type="number"
                value={probability}
                onChange={e => setProbability(Number(e.target.value))}
                placeholder="0–100"
              />
              <Input
                label="Expected Close Date"
                type="date"
                value={expectedCloseDate}
                onChange={e => setExpectedCloseDate(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* ─── Centered Elevated Glassmorphic Modal Card for EDIT Deal ─── */}
      {editingDeal && hasPermission(user, 'deal:update') && (
        <Modal
          isOpen={!!editingDeal}
          onClose={() => setEditingDeal(null)}
          title="Update Deal Opportunity"
          description={`Modify opportunity details for ${editingDeal.title} in FastAPI MongoDB`}
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button type="button" variant="ghost" onClick={() => setEditingDeal(null)}>
                Cancel
              </Button>
              <Button type="submit" form="edit-deal-form" isLoading={isSubmitting} className="px-6">
                Update Deal Opportunity
              </Button>
            </div>
          }
        >
          <form id="edit-deal-form" onSubmit={handleUpdateDeal} className="space-y-4 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Deal Title *"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Acme Enterprise License"
              />
              <Select
                label="Associated Customer"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                options={customerOptions}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Deal Value ($)"
                type="number"
                value={value}
                onChange={e => setValue(Number(e.target.value))}
                placeholder="0"
              />
              <Select
                label="Pipeline Stage"
                value={stage}
                onChange={e => setStage(e.target.value as DealStage)}
                options={STAGE_OPTIONS.filter(s => s.value !== '')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Win Probability (%)"
                type="number"
                value={probability}
                onChange={e => setProbability(Number(e.target.value))}
                placeholder="0–100"
              />
              <Input
                label="Expected Close Date"
                type="date"
                value={expectedCloseDate}
                onChange={e => setExpectedCloseDate(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* ─── Soft Delete Confirmation Modal ─── */}
      {deletingDeal && (
        <ConfirmationModal
          isOpen={!!deletingDeal}
          onClose={() => setDeletingDeal(null)}
          onConfirm={handleDeleteDeal}
          title="Soft Delete Deal Opportunity"
          message={`Are you sure you want to soft delete "${deletingDeal?.title ?? 'this deal'}"? This record will be marked deleted with timestamp in MongoDB.`}
          confirmText="Yes, Soft Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

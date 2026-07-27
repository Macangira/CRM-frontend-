import React, { useEffect, useState, useMemo } from 'react';
import { taskService, userService, customerService, dealService, leadService } from '../../services/crmServices';
import { Task, TaskStatus, Priority, Customer, Deal, Lead } from '../../types';
import { CalendarView } from '../../components/calendar/CalendarView';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { TaskStatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { Avatar } from '../../components/ui/avatar';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../constants/permissions';
import {
  CheckSquare, Calendar as CalendarIcon, List, Plus, CheckCircle2, Clock, Check,
  Phone, Mail, Calendar, User, ExternalLink, AlertTriangle, Filter, RotateCcw
} from 'lucide-react';

const TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'Call 📞', value: 'call' },
  { label: 'Meeting 🤝', value: 'meeting' },
  { label: 'Email ✉️', value: 'email' },
  { label: 'Follow Up 🔄', value: 'follow up' }
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'To Do', value: 'To Do' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'In Review', value: 'In Review' },
  { label: 'Completed', value: 'Done' }
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent 🔥', value: 'urgent' }
];

export interface TasksPageProps {
  onNavigate?: (path: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Lists for lookup & drop downs
  const [usersList, setUsersList] = useState<any[]>([]);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [dealsList, setDealsList] = useState<Deal[]>([]);
  const [leadsList, setLeadsList] = useState<Lead[]>([]);

  // Filter states
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  // Create Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('call');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('To Do');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [relatedType, setRelatedType] = useState<'customer' | 'deal' | 'lead'>('customer');
  const [relatedId, setRelatedId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTasks = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [taskData, usersData, custData, dealData, leadData] = await Promise.all([
        taskService.getTasks(),
        userService.getUsers().catch(() => []),
        customerService.getCustomers().catch(() => []),
        dealService.getDeals().catch(() => []),
        leadService.getLeads().catch(() => [])
      ]);

      setTasks(taskData);
      setUsersList(Array.isArray(usersData) ? usersData : []);
      setCustomersList(Array.isArray(custData) ? custData : []);
      setDealsList(Array.isArray(dealData) ? dealData : []);
      setLeadsList(Array.isArray(leadData) ? leadData : []);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStatusToggle = async (taskId: string, currentStatus: TaskStatus) => {
    // Rule: Once a task is completed, it cannot be uncompleted / reopened
    if (currentStatus === 'Done') return;

    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: 'Done' } : t)));
    await taskService.updateTaskStatus(taskId, 'Done');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);

    try {
      // Find related entity name for display
      let relName = '';
      if (relatedType === 'customer') {
        const c = customersList.find(x => x.id === relatedId);
        if (c) relName = c.name;
      } else if (relatedType === 'deal') {
        const d = dealsList.find(x => x.id === relatedId);
        if (d) relName = d.title;
      } else if (relatedType === 'lead') {
        const l = leadsList.find(x => x.id === relatedId);
        if (l) relName = l.title;
      }

      await taskService.createTask({
        title: title.trim(),
        description,
        status: taskStatus,
        priority: taskPriority,
        dueDate: dueDate || new Date().toISOString().slice(0, 10),
        assignedUserId: assignedUserId || user?.id || '',
        assignedUserName: '',
        relatedType,
        relatedId,
        relatedName: relName,
        subtasks: [],
        tags: [taskType]
      });

      setShowCreateModal(false);
      setTitle(''); setDescription(''); setDueDate(''); setRelatedId('');
      await loadTasks(true);
    } catch (err) {
      console.error('Create Task Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // User Dropdown Options
  const userOptions = useMemo(() => [
    { label: '-- Select Assignee --', value: '' },
    ...usersList.map(u => ({
      label: u.name || (u.fname ? `${u.fname} ${u.lname || ''}`.trim() : u.email),
      value: u.id || u._id || u.email
    }))
  ], [usersList]);

  // Related Entity Options depending on relatedType selection
  const relatedOptions = useMemo(() => {
    if (relatedType === 'customer') {
      return [
        { label: '-- Select Customer --', value: '' },
        ...customersList.map(c => ({ label: c.companyName ? `${c.name} (${c.companyName})` : c.name, value: c.id }))
      ];
    }
    if (relatedType === 'deal') {
      return [
        { label: '-- Select Deal --', value: '' },
        ...dealsList.map(d => ({ label: `${d.title} ($${(d.value || 0).toLocaleString()})`, value: d.id }))
      ];
    }
    return [
      { label: '-- Select Lead --', value: '' },
      ...leadsList.map(l => ({ label: `${l.title} (${l.contactName})`, value: l.id }))
    ];
  }, [relatedType, customersList, dealsList, leadsList]);

  // Client-side Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (typeFilter && (t.tags?.[0] || 'call').toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
      if (statusFilter && t.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (assigneeFilter && t.assignedUserName !== assigneeFilter && t.assignedUserId !== assigneeFilter) {
        return false;
      }
      return true;
    });
  }, [tasks, typeFilter, statusFilter, assigneeFilter]);

  // Helper check for Overdue status (dueDate in past & status != completed)
  const checkIsOverdue = (task: Task) => {
    if (task.status === 'Done') return false;
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const columns: Column<Task>[] = [
    {
      key: 'title',
      header: 'Task Title',
      sortable: true,
      accessor: task => (
        <div className="flex items-center gap-3">
          <button
            onClick={e => {
              e.stopPropagation();
              handleStatusToggle(task.id, task.status);
            }}
            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
              task.status === 'Done'
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-zinc-700 hover:border-blue-500 bg-zinc-900'
            }`}
          >
            {task.status === 'Done' && <Check className="w-3.5 h-3.5" />}
          </button>
          <div>
            <div className={`font-bold text-sm ${task.status === 'Done' ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
              {task.title}
            </div>
            {task.description && (
              <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{task.description}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'type' as any,
      header: 'Type',
      sortable: true,
      accessor: task => {
        const typeStr = (task.tags?.[0] || 'Call').toLowerCase();
        const typeBadges: Record<string, { label: string; icon: any; color: string }> = {
          call: { label: 'Call 📞', icon: Phone, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
          meeting: { label: 'Meeting 🤝', icon: Calendar, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
          email: { label: 'Email ✉️', icon: Mail, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
          'follow up': { label: 'Follow Up 🔄', icon: Clock, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
        };
        const conf = typeBadges[typeStr] || { label: task.tags?.[0] || 'Call', color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${conf.color}`}>
            {conf.label}
          </span>
        );
      }
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      accessor: task => {
        const overdue = checkIsOverdue(task);
        return (
          <div className="flex items-center gap-1.5">
            {overdue && <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
            <span className={`text-xs font-bold ${overdue ? 'text-red-400 font-extrabold animate-pulse' : 'text-zinc-300'}`}>
              {task.dueDate || '—'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      accessor: task => <PriorityBadge priority={task.priority} />
    },
    {
      key: 'relatedName' as any,
      header: 'Related To',
      sortable: true,
      accessor: task => {
        if (!task.relatedName && !task.relatedId) return <span className="text-zinc-500 text-xs">—</span>;
        const relType = task.relatedType || 'customer';
        const typeLabel = relType === 'customer' ? 'Customer' : relType === 'deal' ? 'Deal' : 'Lead';

        return (
          <div
            onClick={e => {
              e.stopPropagation();
              if (relType === 'customer' && onNavigate) {
                if (task.relatedId) {
                  localStorage.setItem('ent_crm_open_customer', task.relatedId);
                }
                onNavigate('/customers');
              } else if (relType === 'deal' && onNavigate) {
                onNavigate('/deals');
              } else if (relType === 'lead' && onNavigate) {
                onNavigate('/leads');
              }
            }}
            className="flex items-center gap-1 text-xs text-blue-400 font-medium hover:underline cursor-pointer group"
          >
            <span className="group-hover:text-blue-300">
              {task.relatedName || `${typeLabel} #${task.relatedId?.slice(-4)}`}
            </span>
            <ExternalLink className="w-3 h-3 text-blue-500 group-hover:text-blue-400" />
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: task => <TaskStatusBadge status={task.status} />
    },
    {
      key: 'assignedUserName',
      header: 'Assignee',
      sortable: true,
      accessor: task => (
        <div className="flex items-center gap-2 text-xs text-zinc-300">
          <Avatar name={task.assignedUserName || 'User'} src={task.assignedUserAvatar} size="xs" />
          <span>{task.assignedUserName || 'Unassigned'}</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-400" /> Task & Schedule Manager
          </h2>
          <p className="text-xs text-zinc-400">Track client action items, subtask checklists, and visual month schedules</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <List className="w-4 h-4" /> Task List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarIcon className="w-4 h-4" /> Month Calendar
            </button>
          </div>

          {hasPermission(user, 'task:create') && (
            <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Create Task
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar for Task Type / Status / Assignee */}
      {viewMode === 'list' && (
        <div className="flex items-center justify-between gap-3 p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-blue-400" /> Filters:
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:border-blue-500 focus:outline-none"
            >
              {TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:border-blue-500 focus:outline-none"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Assignees</option>
              {usersList.map(u => {
                const name = u.name || (u.fname ? `${u.fname} ${u.lname || ''}`.trim() : u.email);
                return <option key={u.id || u.email} value={name}>{name}</option>;
              })}
            </select>
          </div>

          {(typeFilter || statusFilter || assigneeFilter) && (
            <button
              onClick={() => { setTypeFilter(''); setStatusFilter(''); setAssigneeFilter(''); }}
              className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Main Task DataTable or Calendar */}
      {viewMode === 'calendar' ? (
        <CalendarView tasks={filteredTasks} onTaskClick={t => setSelectedTask(t)} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredTasks}
          isLoading={isLoading}
          searchPlaceholder="Search tasks by title, assignee, related record..."
          onRowClick={t => setSelectedTask(t)}
          renderMobileCard={(t: Task) => {
            const overdue = checkIsOverdue(t);
            return (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm truncate ${t.status === 'Done' ? 'line-through text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {t.title}
                    </div>
                    {t.relatedName && (
                      <div className="text-xs text-blue-500 dark:text-blue-400 truncate mt-0.5">
                        {t.relatedName}
                      </div>
                    )}
                  </div>
                  <TaskStatusBadge status={t.status} />
                </div>
                <div className="flex flex-col gap-1.5 text-[11px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-white/5">
                  <div className="flex items-center gap-2 truncate">
                    <User className="w-3.5 h-3.5 shrink-0" /> {t.assignedUserName || 'Unassigned'}
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    {overdue ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" /> : <Calendar className="w-3.5 h-3.5 shrink-0" />} 
                    <span className={overdue ? 'text-red-400 font-bold' : ''}>Due: {t.dueDate || '—'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <PriorityBadge priority={t.priority} />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 capitalize">{t.tags?.[0] || 'Task'}</span>
                </div>
              </div>
            );
          }}
        />
      )}

      {/* Centered Glassmorphic Modal for Create Task */}
      {hasPermission(user, 'task:create') && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Action Task"
          description="Assign tasks linked to Customers, Deals, or Leads in FastAPI MongoDB"
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-task-form" isLoading={isSubmitting} className="px-6">
                Save Task Record
              </Button>
            </div>
          }
        >
          <form id="create-task-form" onSubmit={handleCreateTask} className="space-y-4 pb-2">
            <Input
              label="Task Title *"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Schedule SOC2 Compliance Audit Call"
            />

            <Input
              label="Description / Notes"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Action item details..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Task Type"
                value={taskType}
                onChange={e => setTaskType(e.target.value)}
                options={TYPE_OPTIONS.filter(o => o.value !== '')}
              />
              <Input
                label="Due Date *"
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Priority"
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value as Priority)}
                options={PRIORITY_OPTIONS}
              />
              <Select
                label="Initial Status"
                value={taskStatus}
                onChange={e => setTaskStatus(e.target.value as TaskStatus)}
                options={STATUS_OPTIONS.filter(o => o.value !== '')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Assignee"
                value={assignedUserId}
                onChange={e => setAssignedUserId(e.target.value)}
                options={userOptions}
              />
              <div className="grid grid-cols-2 gap-2">
                <Select
                  label="Relates To"
                  value={relatedType}
                  onChange={e => {
                    setRelatedType(e.target.value as any);
                    setRelatedId('');
                  }}
                  options={[
                    { label: 'Customer', value: 'customer' },
                    { label: 'Deal', value: 'deal' },
                    { label: 'Lead', value: 'lead' }
                  ]}
                />
                <Select
                  label="Select Record"
                  value={relatedId}
                  onChange={e => setRelatedId(e.target.value)}
                  options={relatedOptions}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Task Details Drawer */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
          description={`Due: ${selectedTask.dueDate || 'No Date'}`}
          size="md"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={selectedTask.priority} />
              <TaskStatusBadge status={selectedTask.status} />
            </div>

            {selectedTask.description && (
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300">
                {selectedTask.description}
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Subtask Checklist</h4>
              {selectedTask.subtasks && selectedTask.subtasks.length > 0 ? (
                <div className="space-y-2">
                  {selectedTask.subtasks.map(sub => (
                    <label key={sub.id} className="flex items-center gap-2.5 text-xs text-zinc-300 p-2 rounded bg-zinc-900 border border-zinc-800">
                      <input type="checkbox" defaultChecked={sub.completed} className="rounded border-zinc-700 text-blue-600 focus:ring-blue-500" />
                      <span className={sub.completed ? 'line-through text-zinc-500' : ''}>{sub.title}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">No subtasks created for this item.</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};


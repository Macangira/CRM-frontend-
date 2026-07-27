import React, { useEffect, useState } from 'react';
import { userService, dealService, taskService, contactService } from '../../services/crmServices';
import { User, Deal, Task } from '../../types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar } from '../../components/ui/avatar';
import { ActivityStream } from '../../components/common/ActivityStream';
import { PriorityBadge, TaskStatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, Mail, Phone, UserCheck, DollarSign, Briefcase, CheckSquare, Activity as ActivityIcon, ArrowLeft, Tag, Calendar as CalendarIcon, Clock
} from 'lucide-react';

export interface UserDetailPageProps {
  userId: string;
  initialUser?: User | null;
  onBack: () => void;
  onNavigate?: (path: string) => void;
}

export type TabType = 'overview' | 'deals' | 'tasks' | 'activity';

export const UserDetailPage: React.FC<UserDetailPageProps> = ({
  userId,
  initialUser,
  onBack,
  onNavigate
}) => {
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(!initialUser);

  useEffect(() => {
    async function loadUserDetail() {
      setIsLoading(true);
      try {
        const [uList, dList, tList] = await Promise.all([
          userService.getUsers(true),
          dealService.getDeals().catch(() => []),
          taskService.getTasks().catch(() => [])
        ]);

        let targetUser = uList.find(u => u.id === userId);
        
        if (targetUser) {
          const formattedUser = {
            ...targetUser,
            name: targetUser.name || `${targetUser.fname || ''} ${targetUser.lname || ''}`.trim() || targetUser.email || 'Unknown',
            role: targetUser.role || 'user'
          };
          setUser(formattedUser);

          // Filter associated deals & tasks assigned to this user
          const matchingDeals = dList.filter(d => d.assignedUserId === userId);
          setDeals(matchingDeals);

          const matchingTasks = tList.filter(t => t.assignedUserId === userId);
          setTasks(matchingTasks);
        }
      } catch (err) {
        console.error("Failed to load user details:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserDetail();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="p-8 text-center space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-zinc-800 rounded mx-auto" />
        <div className="h-64 w-full bg-zinc-900 rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-12 text-center space-y-4">
        <h3 className="text-lg font-bold text-zinc-200">User Account Not Found</h3>
        <Button onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to User Directory
        </Button>
      </div>
    );
  }

  const totalPipelineValue = deals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);

  const tabs = [
    { id: 'overview', label: 'Overview (360°)', icon: <Building2 className="w-4 h-4" /> },
    { id: 'deals', label: `Deals (${deals.length})`, icon: <Briefcase className="w-4 h-4" /> },
    { id: 'tasks', label: `Tasks (${tasks.length})`, icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity Timeline', icon: <ActivityIcon className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Button & Action Controls */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to User Directory
        </Button>
      </div>

      {/* 360 Header Profile Hero Banner */}
      <div className="relative overflow-hidden p-6 bg-zinc-900/90 border border-zinc-800 text-white rounded-2xl shadow-xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 min-w-0">
            <Avatar name={user.name} src={user.avatarUrl} size="xl" className="border-0 ring-0 shadow-none shrink-0" />
            <div className="min-w-0 w-full">
              <div className="flex items-center gap-3 min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-100 truncate">{user.name}</h1>
                <Badge variant={user.status === 'active' ? 'success' : 'primary'} className="shrink-0">
                  {(user.status || 'NEW').toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-zinc-400 flex items-center gap-2 mt-1 truncate">
                <Briefcase className="w-4 h-4 text-blue-400 shrink-0" /> <span className="truncate">{user.department || 'No Department'}</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-3">
                <span className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" /> <span className="truncate">{user.email || '—'}</span></span>
                <span className="flex items-center gap-1.5 shrink-0"><Phone className="w-3.5 h-3.5 text-zinc-500" /> {user.phone || '—'}</span>
                <span className="flex items-center gap-1.5 shrink-0"><UserCheck className="w-3.5 h-3.5 text-blue-400" /> Role: {user.role.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:justify-end items-center gap-3 shrink-0">
            <div className="text-left sm:text-right px-4 py-2 bg-zinc-800/80 rounded-xl border border-zinc-700/60 min-w-[140px]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Managed Pipeline Value</span>
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
                  <span className="text-xs text-zinc-400 uppercase font-semibold">Managed Pipeline</span>
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
                  <span className="text-xs text-zinc-400 uppercase font-semibold">Assigned Tasks</span>
                  <div className="text-xl font-bold text-white mt-1">{tasks.length} Tasks</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 uppercase font-semibold">Status</span>
                  <div className="text-xl font-bold text-white mt-1 capitalize">{user.status}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real Account Specs Details */}
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-400" /> User Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 block">User Full Name</span>
                  <span className="font-bold text-zinc-100 mt-0.5 block">{user.name}</span>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 block">Email Address</span>
                  <span className="font-bold text-zinc-100 mt-0.5 block">{user.email || '—'}</span>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 block">Phone Contact</span>
                  <span className="font-bold text-zinc-100 mt-0.5 block">{user.phone || '—'}</span>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 block">Department</span>
                  <span className="font-bold text-zinc-100 mt-0.5 block">{user.department || '—'}</span>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 block">System Role</span>
                  <span className="font-bold text-zinc-100 mt-0.5 block">{user.role.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 block">Creation Date</span>
                  <span className="font-bold text-zinc-100 mt-0.5 block">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </span>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 block">Last Active</span>
                  <span className="font-bold text-zinc-100 mt-0.5 block">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
            </Card>

            {/* FastAPI Real Activity Audit Stream */}
            <Card className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <ActivityIcon className="w-4 h-4 text-emerald-400" /> User Audit Activity Stream
              </h3>
              <ActivityStream relatedTo={user.id} />
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. DEALS */}
      {activeTab === 'deals' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-100">Managed Pipeline Deals</h3>
          </div>
          <div className="space-y-3">
            {deals.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No active pipeline deals assigned to this user.</p>
            ) : (
              deals.map(dl => (
                <div key={dl.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 cursor-pointer hover:bg-zinc-800/50 transition-colors" onClick={() => onNavigate && onNavigate(`/deals?id=${dl.id}`)}>
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
            <h3 className="text-sm font-bold text-zinc-100">Assigned Action Items & Tasks</h3>
          </div>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No pending tasks assigned to this user.</p>
            ) : (
              tasks.map(tsk => (
                <div key={tsk.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 cursor-pointer hover:bg-zinc-800/50 transition-colors" onClick={() => onNavigate && onNavigate(`/tasks?id=${tsk.id}`)}>
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

      {/* TAB CONTENT: 6. ACTIVITY TIMELINE */}
      {activeTab === 'activity' && (
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
            <ActivityIcon className="w-4 h-4 text-emerald-400" /> Full Audit Activity Timeline
          </h3>
          <ActivityStream relatedTo={user.id} />
        </Card>
      )}
    </div>
  );
};

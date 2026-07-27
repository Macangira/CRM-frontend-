import React, { useEffect, useState, useMemo } from 'react';
import { apiClient } from '../../api/fastapiClient';
import { userService } from '../../services/crmServices';
import { Activity, User } from '../../types';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Avatar } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Activity as ActivityIcon, Search, Shield, RotateCcw, Mail, Phone, FileText, CheckSquare, Briefcase, Users, UserPlus, RefreshCw, Clock, Building2, Download, Filter, Zap, CheckCircle2
} from 'lucide-react';

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      try {
        const actRes = await apiClient.get('/api/activities');
        const raw = actRes.data;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        setActivities(list);
      } catch (err) {
        console.error("Activities fetch error:", err);
        setActivities([]);
      }

      try {
        const usersRes = await userService.getUsers();
        setUsersList(usersRes || []);
      } catch (err) {
        setUsersList([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const userMap = useMemo(() => {
    const map: Record<string, string> = {};
    usersList.forEach(u => {
      const name = u.name || (u.fname ? `${u.fname} ${u.lname || ''}`.trim() : u.email);
      const uid = String(u.id || (u as any)._id || '');
      if (uid) map[uid] = name;
      if (u.email) map[u.email] = name;
    });
    return map;
  }, [usersList]);

  const filteredActivities = useMemo(() => {
    if (!Array.isArray(activities)) return [];
    return activities.filter(act => {
      if (!act) return false;
      const type = (act.type || '').toLowerCase();
      const desc = (act.description || '').toLowerCase();
      const perfBy = (act.performed_by || act.performedByName || '').toLowerCase();

      if (searchTerm && !desc.includes(searchTerm.toLowerCase()) && !perfBy.includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedType && type !== selectedType.toLowerCase()) {
        return false;
      }
      if (selectedUser && act.performed_by !== selectedUser && act.performedByName !== selectedUser) {
        return false;
      }
      return true;
    });
  }, [activities, searchTerm, selectedType, selectedUser]);

  const typeOptions = [
    { label: 'All Activity Types', value: '' },
    { label: 'Customer Accounts 👥', value: 'customer' },
    { label: 'Company Accounts 🏢', value: 'company' },
    { label: 'Deal Stages 💼', value: 'deal' },
    { label: 'Tasks & Reminders 📝', value: 'task' },
    { label: 'Account Notes 📄', value: 'note' },
    { label: 'Sales Leads 🎯', value: 'lead' }
  ];

  const userOptions = useMemo(() => [
    { label: 'All Team Members', value: '' },
    ...((Array.isArray(usersList) ? usersList : []).map(u => ({
      label: u.name || (u.fname ? `${u.fname} ${u.lname || ''}`.trim() : u.email),
      value: String(u.id || (u as any)._id || u.email)
    })))
  ], [usersList]);

  const getActivityBadge = (type?: string) => {
    switch ((type || '').toLowerCase()) {
      case 'customer':
        return { icon: <Users className="w-3.5 h-3.5 text-sky-400" />, bg: 'bg-sky-500/10 text-sky-300 border-sky-500/30' };
      case 'company':
        return { icon: <Building2 className="w-3.5 h-3.5 text-indigo-400" />, bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' };
      case 'deal':
        return { icon: <Briefcase className="w-3.5 h-3.5 text-emerald-400" />, bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
      case 'task':
        return { icon: <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />, bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
      case 'note':
        return { icon: <FileText className="w-3.5 h-3.5 text-amber-400" />, bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'lead':
        return { icon: <UserPlus className="w-3.5 h-3.5 text-purple-400" />, bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
      default:
        return { icon: <ActivityIcon className="w-3.5 h-3.5 text-zinc-400" />, bg: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  const stats = useMemo(() => {
    const list = Array.isArray(activities) ? activities : [];
    return {
      total: list.length,
      customers: list.filter(a => a && a.type === 'customer').length,
      deals: list.filter(a => a && a.type === 'deal').length,
      notes: list.filter(a => a && a.type === 'note').length
    };
  }, [activities]);

  const handleExportAuditCSV = () => {
    const headers = ['Action Type', 'Description', 'Performed By', 'Timestamp'];
    const rows = filteredActivities.map(a => [
      `"${(a.type || 'system').toUpperCase()}"`,
      `"${(a.description || '').replace(/"/g, '""')}"`,
      `"${(userMap[a.performed_by] || a.performed_by || 'System Admin').replace(/"/g, '""')}"`,
      `"${new Date(a.createdAt || a.timestamp || Date.now()).toLocaleString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Activity_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" /> Audit & System Activity Logs
            </h2>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-extrabold uppercase border border-purple-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400 fill-purple-400" /> LIVE AUDIT STREAM
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time audit log of team actions, customer updates, deal stage updates, and system notes
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportAuditCSV}
          leftIcon={<Download className="w-4 h-4" />}
          className="border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-zinc-200"
        >
          Export Audit Logs CSV
        </Button>
      </div>

      {/* KPI Stats Ribbon */}
      <Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl">
            <span className="text-xs font-semibold text-zinc-400">Total Audit Logs</span>
            <div className="text-xl font-extrabold text-zinc-100 mt-1">{stats.total}</div>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl">
            <span className="text-xs font-semibold text-zinc-400">Customer Actions</span>
            <div className="text-xl font-extrabold text-sky-400 mt-1">{stats.customers}</div>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl">
            <span className="text-xs font-semibold text-zinc-400">Deal Stage Logged</span>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">{stats.deals}</div>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl">
            <span className="text-xs font-semibold text-zinc-400">Internal Notes</span>
            <div className="text-xl font-extrabold text-amber-400 mt-1">{stats.notes}</div>
          </div>
        </div>
      </Card>


      {/* Filter & Search Bar */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search audit actions..."
            leftIcon={<Search className="w-3.5 h-3.5 text-zinc-400" />}
          />
          <Select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            options={typeOptions}
          />
          <Select
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
            options={userOptions}
          />
        </div>

        {(searchTerm || selectedType || selectedUser) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
              setSelectedUser('');
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-zinc-400 hover:text-zinc-200"
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Audit Timeline Stream */}
      <div className="p-6 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl backdrop-blur-xl space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="p-4 bg-zinc-950/40 border border-zinc-800/60 rounded-xl flex items-center gap-4">
                <Skeleton circle width={36} height={36} />
                <div className="flex-1 space-y-2">
                  <Skeleton width="60%" height={14} />
                  <Skeleton width="35%" height={12} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center bg-zinc-950/40 border border-dashed border-zinc-800 rounded-2xl space-y-2">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">No activity audit logs found.</p>
            <p className="text-xs text-zinc-500">Try adjusting your search criteria or resetting filters.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-zinc-800/90 ml-4 pl-6 space-y-5">
            {filteredActivities.map((act, idx) => {
              const badge = getActivityBadge(act.type);
              const performerName = userMap[act.performed_by] || act.performedByName || act.performed_by || 'System Admin';
              let formattedTime = 'Recently';
              try {
                const dateVal = act.createdAt || act.timestamp;
                if (dateVal) {
                  formattedTime = new Date(dateVal).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  });
                }
              } catch (e) {
                formattedTime = 'Recently';
              }

              return (
                <div key={act._id || act.id || idx} className="relative group">
                  {/* Timeline Badge Node */}
                  <div className={`absolute -left-[37px] top-1 p-2 rounded-xl bg-zinc-950 border shadow-md group-hover:scale-110 transition-transform ${badge.bg}`}>
                    {badge.icon}
                  </div>

                  {/* Audit Card */}
                  <div className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl hover:border-zinc-700 transition-all duration-200 shadow-md">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Avatar name={performerName} size="sm" />
                        <div>
                          <span className="font-bold text-zinc-100">{performerName}</span>
                          <span className="text-[11px] text-zinc-500 block">Performed System Action</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {(act.type || 'system').toUpperCase()}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-600" />
                          {formattedTime}
                        </span>
                      </div>
                    </div>

                    {/* Action Description */}
                    <div className="mt-3 p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl text-xs text-zinc-200 leading-relaxed font-medium">
                      {act.description || 'System activity logged successfully.'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

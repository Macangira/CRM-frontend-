import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/fastapiClient';
import { Activity } from '../../types';
import { Skeleton } from '../ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import {
  Mail, Phone, FileText, CheckSquare, Briefcase, Users, UserPlus, RefreshCw, Clock, Building2, Activity as ActivityIcon
} from 'lucide-react';

export interface ActivityStreamProps {
  relatedTo?: string;
  limit?: number;
  title?: string;
  className?: string;
}

export const ActivityStream: React.FC<ActivityStreamProps> = ({
  relatedTo,
  limit = 10,
  title = 'Audit & Activity Timeline',
  className = ''
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackUserName = user?.fname ? `${user.fname} ${user.lname || ''}`.trim() : (user?.name || 'SpireCRM User');

  useEffect(() => {
    async function fetchActivities() {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/api/activities', {
          params: relatedTo ? { relatedTo } : undefined
        });
        const rawData = response.data;
        const list = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);
        setActivities(list.slice(0, limit));
      } catch (err) {
        console.warn("ActivityStream fetch warning:", err);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchActivities();
  }, [relatedTo, limit]);

  const getActivityIcon = (type?: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-blue-400" />;
      case 'call':
        return <Phone className="w-3.5 h-3.5 text-emerald-400" />;
      case 'note':
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      case 'task':
        return <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />;
      case 'deal':
        return <Briefcase className="w-3.5 h-3.5 text-indigo-400" />;
      case 'company':
        return <Building2 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'customer':
        return <Users className="w-3.5 h-3.5 text-sky-400" />;
      case 'lead':
        return <UserPlus className="w-3.5 h-3.5 text-purple-400" />;
      case 'status':
        return <RefreshCw className="w-3.5 h-3.5 text-pink-400" />;
      default:
        return <ActivityIcon className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <ActivityIcon className="w-4 h-4 text-blue-400" />
          {title}
        </h3>
        <span className="text-[11px] text-zinc-500 font-medium">Live Audit Log</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl flex items-center gap-3">
              <Skeleton circle width={28} height={28} />
              <div className="flex-1 space-y-1">
                <Skeleton width="70%" height={12} />
                <Skeleton width="40%" height={10} />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800/80 rounded-xl space-y-2">
          <Clock className="w-6 h-6 text-zinc-600 mx-auto" />
          <p className="text-xs text-zinc-400 font-medium">No activity history recorded yet.</p>
          <span className="text-[11px] text-zinc-500">Actions taken on this record will appear here in real-time.</span>
        </div>
      ) : (
        <div className="relative border-l-2 border-zinc-800/80 ml-3 pl-4 space-y-4">
          {activities.map((act, idx) => (
            <div key={act.id || idx} className="relative group">
              {/* Icon Marker on Timeline */}
              <div className="absolute -left-[25px] top-0.5 p-1.5 rounded-full bg-zinc-900 border border-zinc-800 shadow-sm group-hover:scale-110 transition-transform">
                {getActivityIcon(act.type)}
              </div>

              {/* Activity Details Box */}
              <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1 hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-100">
                    {act.performedByName || fallbackUserName}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {act.createdAt || act.timestamp ? new Date(act.createdAt || act.timestamp || '').toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Just now'}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {act.description || 'Activity logged.'}
                </p>
                {act.type && (
                  <span className="inline-block mt-1 text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                    {act.type}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

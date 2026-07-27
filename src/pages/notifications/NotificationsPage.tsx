import React, { useEffect, useState, useRef, useCallback } from 'react';
import { notificationService } from '../../services/crmServices';
import { NotificationItem } from '../../types';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { 
  CheckSquare, 
  UserPlus, 
  Briefcase, 
  FileText, 
  Users, 
  Bell, 
  CheckCircle2, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const limit = 20;
  
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const loadNotifications = async (currentPage: number, type: string, replace = false) => {
    setIsLoading(true);
    try {
      const skip = currentPage * limit;
      const data = await notificationService.getNotifications(limit, skip, type);
      
      if (replace) {
        setNotifications(data);
      } else {
        setNotifications(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === limit);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load or filter change
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    loadNotifications(0, filterType, true);
  }, [filterType]);

  // Load more on scroll
  useEffect(() => {
    if (page > 0) {
      loadNotifications(page, filterType, false);
    }
  }, [page]);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'task': return <CheckSquare className="w-5 h-5 text-indigo-500" />;
      case 'lead': return <UserPlus className="w-5 h-5 text-amber-500" />;
      case 'deal': return <Briefcase className="w-5 h-5 text-emerald-500" />;
      case 'note': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'customer': return <Users className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-zinc-500" />;
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Activity' },
    { id: 'deal', label: 'Deals' },
    { id: 'task', label: 'Tasks' },
    { id: 'lead', label: 'Leads' },
    { id: 'customer', label: 'Customers' },
    { id: 'note', label: 'Notes' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-500" />
            Notification Center
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Stay updated with everything happening in your workspace.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleMarkAllRead} 
          leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          disabled={notifications.every(n => n.isRead)}
        >
          Mark all as read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 space-x-2 pb-2">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === tab.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 mt-4">
        {notifications.length === 0 && !isLoading && (
          <div className="text-center py-20 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">All caught up!</h3>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto">
              You don't have any notifications right now. When something important happens, it will show up here.
            </p>
          </div>
        )}

        {notifications.map((notif, index) => {
          const isLast = index === notifications.length - 1;
          return (
            <Card 
              key={notif.id} 
              className={`p-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30' : ''}`}
            >
              <div 
                ref={isLast ? lastElementRef : null} 
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shrink-0">
                  {getIconForType(notif.type || 'system')}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-zinc-900 dark:text-zinc-100' : 'font-semibold text-zinc-700 dark:text-zinc-300'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-medium text-zinc-400 whitespace-nowrap">
                      {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                  <p className={`text-xs ${!notif.isRead ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-500'} mb-3`}>
                    {notif.message}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    {notif.actionUrl && (
                      <Button variant="outline" size="sm" className="h-7 text-[10px] px-2.5">
                        View Details
                      </Button>
                    )}
                    {!notif.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => handleMarkRead(notif.id, e)}
                        className="h-7 text-[10px] px-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <button 
                    onClick={(e) => handleDelete(notif.id, e)}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
        
        {isLoading && (
          <div className="py-6 text-center text-sm font-semibold text-zinc-500 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Loading history...
          </div>
        )}
        
        {!hasMore && notifications.length > 0 && (
          <div className="py-6 text-center text-xs font-semibold text-zinc-400">
            End of notification history
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Drawer } from '../components/ui/Drawer';
import { Bell, CheckCheck, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';

export interface NotificationDrawerProps {
  onNavigate: (path: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onNavigate }) => {
  const { notifications, isOpen, closeDrawer, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeDrawer}
      title="Notifications"
      description="Stay updated with client activities and tasks"
      size="md"
      footer={
        <div className="w-full flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={markAllAsRead} leftIcon={<CheckCheck className="w-4 h-4" />}>
            Mark All as Read
          </Button>
          <Button variant="outline" size="sm" onClick={closeDrawer}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">No notifications to display</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.link) {
                  onNavigate(n.link);
                  closeDrawer();
                }
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                n.isRead
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70'
                  : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                {getIcon(n.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Drawer>
  );
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { NotificationItem } from '../types';
import { notificationService } from '../services/crmServices';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    const data = await notificationService.getNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        openDrawer: () => setIsOpen(true),
        closeDrawer: () => setIsOpen(false),
        toggleDrawer: () => setIsOpen(prev => !prev),
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, Command, User as UserIcon, LogOut, Settings, Shield, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { useCommandPalette } from '../context/CommandPaletteContext';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { getUserRoleKey } from '../constants/permissions';
import { Avatar } from '../components/ui/avatar';

export interface TopNavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isSidebarCollapsed: boolean;
  onToggleMobileMenu?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentPath,
  onNavigate,
  isSidebarCollapsed,
  onToggleMobileMenu
}) => {
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, toggleDrawer } = useNotifications();
  const { openPalette } = useCommandPalette();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const roleKey = getUserRoleKey(user);

  const roleTitle = {
    admin: 'System Administrator',
    manager: 'Sales Manager',
    sales: 'Sales Representative'
  }[roleKey];

  const displayName = user?.fname ? `${user.fname} ${user.lname || ''}`.trim() : (user?.name || 'Logged User');

  const getBreadcrumbs = () => {
    const segments = currentPath.split('/').filter(Boolean);
    if (segments.length === 0) return [{ label: 'Dashboard', href: '/dashboard' }];

    return segments.map((seg, idx) => {
      const href = '/' + segments.slice(0, idx + 1).join('/');
      const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace('-', ' ');
      return { label, href };
    });
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-14 bg-white/65 dark:bg-zinc-950/65 backdrop-blur-2xl border-b border-white/80 dark:border-white/10 transition-all duration-300 left-0 ${
        isSidebarCollapsed ? 'md:left-16' : 'md:left-60'
      }`}
    >
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Left: Hamburger & Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Breadcrumb items={getBreadcrumbs()} onNavigate={onNavigate} />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Global Search Bar Trigger */}
          <button
            onClick={openPalette}
            className="flex items-center justify-center sm:justify-start gap-2.5 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white/65 dark:bg-white/[0.05] border border-zinc-200/80 dark:border-white/10 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all w-9 h-9 sm:h-auto sm:w-64 shrink-0"
          >
            <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate flex-1 text-left hidden sm:block">Search CRM records...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-500 dark:text-zinc-400">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/80 dark:hover:bg-white/[0.06] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => onNavigate('/notifications')}
            className="relative p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/80 dark:hover:bg-white/[0.06] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-zinc-950" />
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/80 dark:hover:bg-white/[0.06] transition-colors"
            >
              <Avatar name={displayName} src={user?.avatarUrl} size="sm" />
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white/90 dark:bg-zinc-950/85 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-xl shadow-slate-950/15 dark:shadow-black/50 py-1.5 z-50 text-xs text-zinc-700 dark:text-zinc-300 animate-scaleUp">
                  <div className="px-3.5 py-2 border-b border-zinc-200/80 dark:border-white/10 flex items-center gap-3">
                    <Avatar name={displayName} src={user?.avatarUrl} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-zinc-900 dark:text-white truncate">{displayName}</div>
                      <div className="text-[11px] text-blue-400 font-semibold truncate">{roleTitle}</div>
                      <div className="text-[10px] text-zinc-400 truncate mt-0.5">{user?.email}</div>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('/settings');
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-zinc-100 dark:hover:bg-white/[0.06] flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-zinc-400" /> Account Profile
                    </button>
                    {roleKey === 'admin' && (
                      <button
                        onClick={() => {
                          onNavigate('/roles');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-zinc-100 dark:hover:bg-white/[0.06] flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" /> Permissions & Roles
                      </button>
                    )}
                  </div>

                  <div className="border-t border-zinc-200/80 dark:border-white/10 pt-1 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-zinc-800/80 text-red-400 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

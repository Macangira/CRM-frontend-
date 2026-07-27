import React from 'react';
import {
  LayoutDashboard, Users, Building2, Briefcase, CheckSquare, UserPlus, Shield, FileText, Settings, ChevronLeft, ChevronRight, LogOut, Activity as ActivityIcon, Contact as ContactIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hasPermission, getUserRoleKey } from '../constants/permissions';
import { Logo } from '../components/ui/Logo';
import { Avatar } from '../components/ui/avatar';

export interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileMenuOpen,
  onCloseMobileMenu
}) => {
  const { user, logout } = useAuth();
  const roleKey = getUserRoleKey(user);

  // On mobile (when menu is open), we force the sidebar to show full content
  const isEffectiveCollapsed = isCollapsed && !isMobileMenuOpen;

  const allNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, perm: 'dashboard:read' },
    { label: 'Customers', path: '/customers', icon: <Users className="w-4 h-4" />, perm: 'customers:read' },
    { label: 'Contacts Directory', path: '/contacts', icon: <ContactIcon className="w-4 h-4 text-emerald-400" />, perm: 'contact:read' },
    { label: 'Companies', path: '/companies', icon: <Building2 className="w-4 h-4" />, perm: 'company:read' },
    { label: 'Deals & Pipeline', path: '/deals', icon: <Briefcase className="w-4 h-4" />, perm: 'deal:read' },
    { label: 'Tasks & Calendar', path: '/tasks', icon: <CheckSquare className="w-4 h-4" />, perm: 'task:read' },
    { label: 'Sales Leads', path: '/leads', icon: <UserPlus className="w-4 h-4" />, perm: 'lead:read' },
    { label: 'Audit Activity Log', path: '/activities', icon: <ActivityIcon className="w-4 h-4 text-purple-400" />, perm: 'rolepermission:read' },
    { label: 'Analytics Reports', path: '/reports', icon: <FileText className="w-4 h-4 text-teal-400" />, perm: 'pipeline:update' },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" />, perm: 'pipeline:update' }
  ];

  // Filter navigation links dynamically by exact roleId permission check
  const navItems = allNavItems.filter(item => hasPermission(user, item.perm));

  const roleLabel = {
    admin: 'System Administrator',
    manager: 'Sales Manager',
    sales: 'Sales Representative'
  }[roleKey];

  const displayName = user?.fname ? `${user.fname} ${user.lname || ''}`.trim() : (user?.fname || 'User');

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={onCloseMobileMenu}
        />
      )}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-white/75 dark:bg-zinc-950/30 glass-noise backdrop-blur-3xl border-r border-white/80 dark:border-white/10 text-zinc-700 dark:text-zinc-300 shadow-[10px_0_28px_-24px_rgba(15,23,42,0.35)] dark:shadow-none transition-all duration-300 flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isEffectiveCollapsed ? 'w-60 md:w-16' : 'w-60'}`}
      >
      {/* Brand Header */}
      <div className={`h-14 flex items-center justify-between border-b border-zinc-200/80 dark:border-white/10 shrink-0 ${isEffectiveCollapsed ? 'px-1' : 'px-3'}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          {isEffectiveCollapsed ? (
            <Logo size="sm" showSubtitle={false} showText={false} />
          ) : (
            <Logo size="sm" subtitleText={`${roleKey.toUpperCase()} UI`} />
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-white/10 transition-colors hidden md:block"
        >
          {isEffectiveCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(item => {
          const isActive = currentPath === item.path || (currentPath.startsWith(item.path) && item.path !== '/dashboard');

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className="w-full text-left"
            >
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all border border-transparent ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-cyan-950/30 dark:text-cyan-400 font-bold dark:shadow-[inset_4px_0_0_0_#22d3ee] dark:border-white/5'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-white/5'
                } ${isEffectiveCollapsed ? 'justify-center' : ''}`}
                title={isEffectiveCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isEffectiveCollapsed && (
                  <span className="text-sm truncate">{item.label}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer User Card */}
      <div className="p-2.5 border-t border-zinc-200/80 dark:border-white/10 shrink-0">
        <div className={`flex items-center gap-2.5 ${isEffectiveCollapsed ? 'justify-center' : ''}`}>
          <Avatar name={displayName} src={user?.avatarUrl} size="sm" />
          {!isEffectiveCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-zinc-900 dark:text-zinc-200 truncate font-bold">
                {displayName}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-semibold text-blue-400">{roleLabel}</div>
            </div>
          )}
          {!isEffectiveCollapsed && (
            <button
              onClick={logout}
              className="p-1 rounded-md text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
    </>
  );
};

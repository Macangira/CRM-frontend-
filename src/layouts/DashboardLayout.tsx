import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { NotificationDrawer } from './NotificationDrawer';
import { CommandPalette } from '../components/ui/CommandPalette';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentPath,
  onNavigate
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen crm-app-shell text-zinc-900 dark:text-zinc-100 flex font-sans antialiased overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(p) => { onNavigate(p); setIsMobileMenuOpen(false); }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* Top Navbar */}
      <TopNavbar
        currentPath={currentPath}
        onNavigate={onNavigate}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Workspace Region */}
      <main
        className={`flex-1 transition-all duration-300 pt-14 min-h-screen pl-0 ${
          isSidebarCollapsed ? 'md:pl-16' : 'md:pl-60'
        }`}
      >
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn w-full">
          {children}
        </div>
      </main>

      {/* Overlays */}
      <NotificationDrawer />
      <CommandPalette onNavigate={onNavigate} />
    </div>
  );
};

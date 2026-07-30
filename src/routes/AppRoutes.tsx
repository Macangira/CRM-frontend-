import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { OtpPage } from '../pages/auth/OtpPage';
import { useAuth } from "../context/AuthContext";
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { UsersPage } from '../pages/users/UsersPage';
import { RolesPage } from '../pages/roles/RolesPage';
import { ActivitiesPage } from '../pages/activities/ActivitiesPage';
import { CompanyListPage } from '../pages/companies/CompanyListPage';
import { CustomerListPage } from '../pages/customers/CustomerListPage';
import { ContactsPage } from '../pages/contacts/ContactsPage';
import { LeadsPage } from '../pages/leads/LeadsPage';
import { DealsPage } from '../pages/deals/DealsPage';
import { TasksPage } from '../pages/tasks/TasksPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { ChatPage } from '../pages/chat/ChatPage';
import { hasPermission, getUserRoleKey } from '../constants/permissions';
import { AbstractBrandLoader } from '../components/ui/Skeleton';

const LAST_ROUTE_KEY = 'ent_crm_last_route';

function getInitialRoute(hasDashboard: boolean): string {
  const browserPath = window.location.pathname;
  if (browserPath && browserPath !== '/' && browserPath !== '/login' && browserPath !== '/activities' && browserPath !== "/users" && browserPath !== "/settings") {
    return browserPath;
  }
  const stored = localStorage.getItem(LAST_ROUTE_KEY) || sessionStorage.getItem(LAST_ROUTE_KEY);
  if (stored && 
    stored !== '/activities' && 
    stored !== '/users' &&
    stored !== "/settings"
  ){ 
    return stored
  };
  return hasDashboard ? '/dashboard' : '/customers';
}

function saveLastRoute(path: string) {
  localStorage.setItem(LAST_ROUTE_KEY, path);
  sessionStorage.setItem(LAST_ROUTE_KEY, path);
  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path);
  }
}

export const AppRoutes: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  console.log(user);
  
  const hasDashboardAccess = hasPermission(user, "dashboard:read");
  console.log("Dashboard Permission:", hasDashboardAccess);

  const [currentPath, setCurrentPath] = useState<string>(() =>
    getInitialRoute(hasDashboardAccess)
  );

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/dashboard';
      setCurrentPath(path);
      localStorage.setItem(LAST_ROUTE_KEY, path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      let routeToSet = currentPath;
      if (
        routeToSet.startsWith('/login') ||
        routeToSet.startsWith('/register') ||
        routeToSet === '/'
      ) {
        routeToSet = getInitialRoute(hasDashboardAccess);
      }
      if (routeToSet === '/dashboard' && !hasDashboardAccess) {
        routeToSet = '/customers';
      }
      setCurrentPath(routeToSet);
      saveLastRoute(routeToSet);
    } else if (
      !isAuthenticated &&
      !currentPath.startsWith('/login') &&
      !currentPath.startsWith('/register') &&
      !currentPath.startsWith('/forgot-password') &&
      !currentPath.startsWith('/reset-password') &&
      !currentPath.startsWith('/otp')
    ) {
      setCurrentPath('/login');
    }
  }, [isAuthenticated, user, hasDashboardAccess]);

  const navigate = (path: string) => {
    // Route Permission Check
    console.log("Naigate to : " , path);
    if (path === '/dashboard' && !hasDashboardAccess) {
      console.log("Dashboard blocked");
      setCurrentPath('/customers');
      return;
    }
    if (path === '/users' && !hasPermission(user, 'users:read')) {
      setCurrentPath('/customers');
      return;
    }
    if (path === '/roles' && !hasPermission(user, 'rolepermission:read')) {
      setCurrentPath('/customers');
      return;
    }
    if ((path === '/reports' || path === '/settings') && !hasPermission(user, 'pipeline:update')) {
      setCurrentPath('/customers');
      return;
    }
    if (path === '/activities' && !hasPermission(user,'activity:read')) {
      setCurrentPath('/customers');
      return;
    }

    setCurrentPath(path);
    saveLastRoute(path);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return <AbstractBrandLoader message="Initializing Enterprise SpireCRM Workspace..." />;
  }

  // Auth Public Pages
  if (!isAuthenticated) {
    if (currentPath.startsWith('/register')) return <RegisterPage onNavigate={navigate} />;
    if (currentPath.startsWith('/forgot-password')) return <ForgotPasswordPage onNavigate={navigate} />;
    if (currentPath.startsWith('/reset-password')) return <ResetPasswordPage onNavigate={navigate} />;
    if (currentPath.startsWith('/otp')) return <OtpPage onNavigate={navigate} />;
    return <LoginPage onNavigate={navigate} />;
  }

  // Protected Dashboard Layout Router
  return (
    <DashboardLayout currentPath={currentPath} onNavigate={navigate}>
      {currentPath === '/dashboard' && 
      <>
      {console.log("Dashboard Rendered")}
      <DashboardPage onNavigate={navigate} />
      </>
      }
      {currentPath === '/users' && hasPermission(user, 'users:read') && <UsersPage />}
      {currentPath === '/roles' && hasPermission(user, 'rolepermission:read') && <RolesPage />}
      {currentPath === '/companies' && hasPermission(user, 'company:read') && <CompanyListPage />}
      {currentPath === '/customers' && hasPermission(user, 'customers:read') && <CustomerListPage />}
      {currentPath === '/contacts' && hasPermission(user, 'contact:read') && <ContactsPage onNavigate={navigate} />}
      {currentPath === '/leads' && hasPermission(user, 'lead:read') && <LeadsPage />}
      {currentPath === '/deals' && hasPermission(user, 'deal:read') && <DealsPage />}
      {currentPath === '/tasks' && hasPermission(user, 'task:read') && <TasksPage onNavigate={navigate} />}
      {currentPath === '/activities' && hasPermission(user, 'activity:read') && (<ActivitiesPage />)}
      {currentPath === '/reports' && hasPermission(user, 'pipeline:update') && <ReportsPage />}
      {currentPath === '/settings' && hasPermission(user, 'pipeline:update') && <SettingsPage />}
      {currentPath === '/notifications' && <NotificationsPage />}
      {currentPath === '/chat' && <ChatPage />}
      {![
          '/dashboard',
          '/users',
          '/roles',
          '/companies',
          '/customers',
          '/contacts',
          '/leads',
          '/deals',
          '/tasks',
          '/activities',
          '/reports',
          '/settings',
          '/notifications',
          '/chat',
        ].includes(currentPath) && (
          hasDashboardAccess
            ? <DashboardPage onNavigate={navigate} />
            : <CustomerListPage />
        )}
    </DashboardLayout>
  );
};

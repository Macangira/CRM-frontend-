import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Switch } from '../../components/ui/switch';
import { User, Lock, Moon, Sun, Save, CheckCircle2, Bell, Link2, Shield, Settings } from 'lucide-react';
import { UsersPage } from '../users/UsersPage';
import { hasPermission } from '../../constants/permissions';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const isAdmin = hasPermission(user, 'users:read'); // or simple check for admin

  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'integrations' | 'team'>('general');

  // General Tab State
  const [name, setName] = useState(user?.name || 'Alex Morgan');
  const [email, setEmail] = useState(user?.email || 'alex.morgan@enterprise.com');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 234-5678');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Notifications State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [marketingNotifs, setMarketingNotifs] = useState(false);

  // Integrations State
  const [googleCalendar, setGoogleCalendar] = useState(true);
  const [slack, setSlack] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const parts = name.trim().split(' ');
      const fname = parts[0] || '';
      const lname = parts.slice(1).join(' ') || '';
      
      await authService.profileUpdate({
        fname,
        lname,
        phone
      });
      setProfileMsg('Account preferences updated successfully.');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err: any) {
      setProfileMsg(`Error: ${err.message}`);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setPasswordSaving(true);
    setPasswordMsg('');
    try {
      await authService.changePassword({
        userId: user.id,
        old_password: oldPassword,
        new_password: newPassword
      });
      setPasswordMsg('Security credentials updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err: any) {
      setPasswordMsg(`Error: ${err.message}`);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Settings</h2>
        <p className="text-xs text-slate-500">Manage your profile, preferences, and workspace</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 space-x-6">
        <button 
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'general' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-b-2 border-transparent'
          }`}
        >
          <Settings className="w-4 h-4" /> General
        </button>
        
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'notifications' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-b-2 border-transparent'
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications
        </button>

        <button 
          onClick={() => setActiveTab('integrations')}
          className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'integrations' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-b-2 border-transparent'
          }`}
        >
          <Link2 className="w-4 h-4" /> Integrations
        </button>

        {isAdmin && (
          <button 
            onClick={() => setActiveTab('team')}
            className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'team' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-b-2 border-transparent'
            }`}
          >
            <Shield className="w-4 h-4" /> Team Management
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="max-w-4xl space-y-6">
            {profileMsg && (
              <div className={`p-4 ${profileMsg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'} dark:bg-slate-800/60 text-xs rounded-xl font-semibold flex items-center gap-2`}>
                {!profileMsg.startsWith('Error') && <CheckCircle2 className="w-4 h-4" />} {profileMsg}
              </div>
            )}

            <Card className="space-y-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
                Personal Details
              </h3>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar name={name} src={user?.avatarUrl} size="xl" />
                  {/* Without AWS backend for now, we just present the button */}
                  <Button variant="outline" size="sm" type="button" onClick={() => alert("Image upload functionality configured for next phase.")}>Change Avatar</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
                  <Input label="Work Email" type="email" value={email} onChange={e => setEmail(e.target.value)} readOnly className="bg-zinc-50 dark:bg-zinc-900" />
                  <Input label="Phone Contact" value={phone} onChange={e => setPhone(e.target.value)} />
                  <Input label="System Role" disabled value={user?.role?.toUpperCase() || 'ADMIN'} />
                </div>

                <Button type="submit" disabled={profileSaving} leftIcon={<Save className="w-4 h-4" />}>
                  {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </form>
            </Card>

            <Card className="space-y-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
                Security & Password
              </h3>

              {passwordMsg && (
                <div className={`p-3 mb-4 ${passwordMsg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'} dark:bg-slate-800/60 text-xs rounded-xl font-semibold`}>
                  {passwordMsg}
                </div>
              )}
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Current Password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="••••••••••••" />
                  <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••••••" />
                </div>
                <Button type="submit" variant="secondary" disabled={passwordSaving} leftIcon={<Lock className="w-4 h-4" />}>
                  {passwordSaving ? 'Updating...' : 'Update Security Credentials'}
                </Button>
              </form>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
                Appearance & Display Theme
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm">
                <button onClick={() => setTheme('light')} className={`p-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${theme === 'light' ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/50 text-blue-700' : 'border-slate-200 dark:border-slate-800 text-slate-600'}`}>
                  <Sun className="w-4 h-4 text-amber-500" /> Light Mode
                </button>
                <button onClick={() => setTheme('dark')} className={`p-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${theme === 'dark' ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-950/40 text-blue-300' : 'border-slate-200 dark:border-slate-800 text-slate-600'}`}>
                  <Moon className="w-4 h-4 text-blue-400" /> Dark Mode
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="max-w-4xl space-y-6">
            <Card className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notification Preferences</h3>
                <p className="text-xs text-slate-500 mt-1">Choose how and when you want to be notified about activity in the CRM.</p>
              </div>
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Email Notifications</h4>
                    <p className="text-xs text-zinc-500">Receive daily summaries and important alerts via email.</p>
                  </div>
                  <Switch checked={emailNotifs} onChange={(c) => setEmailNotifs(c)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Push Notifications</h4>
                    <p className="text-xs text-zinc-500">Receive real-time push alerts on your browser.</p>
                  </div>
                  <Switch checked={pushNotifs} onChange={(c) => setPushNotifs(c)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Marketing & News</h4>
                    <p className="text-xs text-zinc-500">Get product updates and promotional content.</p>
                  </div>
                  <Switch checked={marketingNotifs} onChange={(c) => setMarketingNotifs(c)} />
                </div>
              </div>
              <Button onClick={() => alert("Notification preferences saved!")}>Save Preferences</Button>
            </Card>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="max-w-4xl space-y-6">
            <Card className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Connected Apps</h3>
                <p className="text-xs text-slate-500 mt-1">Connect your CRM to external tools to streamline your workflow.</p>
              </div>
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center p-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="GCal" className="w-full h-full" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Google Calendar</h4>
                      <p className="text-xs text-zinc-500">Sync your tasks and meetings automatically.</p>
                    </div>
                  </div>
                  <Switch checked={googleCalendar} onChange={(c) => setGoogleCalendar(c)} />
                </div>
                
                <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center p-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" alt="Slack" className="w-full h-full" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Slack</h4>
                      <p className="text-xs text-zinc-500">Send deal and lead alerts directly to your Slack channels.</p>
                    </div>
                  </div>
                  <Switch checked={slack} onChange={(c) => setSlack(c)} />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Team Management Tab */}
        {activeTab === 'team' && isAdmin && (
          <div className="-mx-4 sm:mx-0">
             {/* We embed UsersPage directly here to act as the admin control panel */}
             <UsersPage />
          </div>
        )}

      </div>
    </div>
  );
};

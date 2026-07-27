import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';

export const ResetPasswordPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get('email') || localStorage.getItem('ent_crm_reset_email') || '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide your registered email address');
      return;
    }

    if (!otp) {
      setError('Please enter the 6-digit OTP code received on your email');
      return;
    }

    if (password !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, password);
      setIsDone(true);
      localStorage.removeItem('ent_crm_reset_email');
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Enter the 6-digit OTP code sent to your email and set your new password"
    >
      {isDone ? (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-zinc-200">
            Password updated successfully! All active sessions have been revoked. You can now log in with your new credentials.
          </p>
          <Button className="w-full" onClick={() => onNavigate('/login')}>
            Back to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {!emailParam && (
            <Input
              label="Registered Email Address"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          )}

          <Input
            label="6-Digit Reset OTP Code"
            required
            value={otp}
            onChange={e => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          />

          <Input
            label="New Password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            helperText="Min 8 chars: Uppercase, lowercase, number & special char (@$!%*?&)"
          />

          <Input
            label="Confirm New Password"
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button type="submit" className="w-full py-2.5 mt-2" isLoading={isLoading}>
            Update Password & Revoke Old Sessions
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { authService } from '../../services/authService';

export const ForgotPasswordPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      localStorage.setItem('ent_crm_reset_email', email);
      setSuccessMsg('Reset OTP sent to your registered email! Redirecting to password reset screen...');
      setTimeout(() => {
        onNavigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your account email to receive a 6-digit password reset OTP"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs rounded-xl font-medium">
            {successMsg}
          </div>
        )}

        <Input
          label="Work Email Address"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="name@company.com"
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Button
          type="submit"
          className="w-full py-2.5"
          isLoading={isLoading}
          rightIcon={<Send className="w-4 h-4" />}
        >
          Send Reset OTP Code
        </Button>

        <button
          type="button"
          onClick={() => onNavigate('/login')}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 pt-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </button>
      </form>
    </AuthLayout>
  );
};

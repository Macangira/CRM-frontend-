import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Button } from '../../components/ui/button';
import { ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';

export const OtpPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get('email') || localStorage.getItem('ent_crm_verify_email') || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (val: string, index: number) => {
    const updated = [...code];
    updated[index] = val.slice(-1);
    setCode(updated);

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = code.join('');
    if (otpString.length < 6) {
      setError('Please enter the complete 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await authService.verifyEmail(email, otpString);
      setSuccessMsg("Email verified successfully! Redirecting to login...");
      localStorage.removeItem('ent_crm_verify_email');
      setTimeout(() => {
        onNavigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email to resend OTP');
      return;
    }
    setError('');
    setSuccessMsg('');
    try {
      await authService.resendVerifyOtp(email);
      setSuccessMsg('Verification OTP has been resent to your email address!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email Address"
      subtitle={`Enter the 6-digit OTP verification code sent to ${email || 'your email'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs rounded-xl font-medium text-center">
            {successMsg}
          </div>
        )}

        {!emailParam && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Registered Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full text-xs rounded-xl bg-[#1a1c28] border border-zinc-700/80 p-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
        )}

        <div className="flex justify-between gap-2 pt-2">
          {code.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-input-${idx}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e.target.value, idx)}
              className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-zinc-700 bg-[#1a1c28] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full py-2.5"
          isLoading={isLoading}
          leftIcon={<ShieldCheck className="w-4 h-4" />}
        >
          Verify Email & Activate Account
        </Button>

        <div className="text-center text-xs text-zinc-400">
          Didn't receive code?{' '}
          <button
            type="button"
            onClick={handleResend}
            className="text-blue-400 font-bold hover:underline"
          >
            Resend OTP Code
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

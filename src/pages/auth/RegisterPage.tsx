import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, User as UserIcon, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export const RegisterPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Phone Validation: 10 digits starting with 6-9
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('Phone number must be a valid 10-digit mobile number starting with 6-9');
      return;
    }

    // Password Match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Register User in MongoDB via FastAPI POST /api/auth/register
      await register({
        fname,
        lname,
        email,
        phone,
        password
      });

      // 2. Automatically hit send-verify-email-otp endpoint (POST /api/auth/send-verify-email-otp?email=...)
      try {
        await authService.resendVerifyOtp(email);
      } catch (otpErr) {
        console.warn("OTP Send trigger warning:", otpErr);
      }

      localStorage.setItem('ent_crm_verify_email', email);
      // Navigate to OTP page passing email
      onNavigate(`/otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error("Register Error:", err);
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Enterprise Account"
      subtitle="Register your account to access your Enterprise CRM workspace"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            required
            value={fname}
            onChange={e => setFname(e.target.value)}
            placeholder="Mukul"
            leftIcon={<UserIcon className="w-4 h-4" />}
          />
          <Input
            label="Last Name"
            required
            value={lname}
            onChange={e => setLname(e.target.value)}
            placeholder="Kumar"
          />
        </div>

        <Input
          label="Work Email Address"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="mukul@company.com"
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Mobile Phone Number (10 digits)"
          type="tel"
          required
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="9876543210"
          leftIcon={<Phone className="w-4 h-4" />}
          helperText="Must be 10 digits starting with 6-9"
        />

        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          helperText="Min 8 chars: Uppercase, lowercase, number & special char (@$!%*?&)"
        />

        <Input
          label="Confirm Password"
          type="password"
          required
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="••••••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <Button
          type="submit"
          className="w-full py-2.5 mt-2"
          isLoading={isLoading}
          disabled={isLoading}
          rightIcon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
        >
          {isLoading ? 'Creating Account & Sending OTP...' : 'Create Account & Send Verification OTP'}
        </Button>

        <div className="text-center text-xs text-zinc-500 pt-2">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            Sign In
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

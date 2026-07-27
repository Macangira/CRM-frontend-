import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, ArrowRight, AlertTriangle, XCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface LoginPageProps {
  onNavigate: (path: string) => void;
}

// Comprehensive Yup Validation Schema for Email & Password
const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email('Sahi Email address enter karein (e.g. name@company.com)')
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email format sahi nahi hai (domain ex: .com, .in)')
    .required('Email address zaroori hai'),
  password: Yup.string()
    .required('Password zaroori hai')
    .min(8, 'Password kam se kam 8 characters ka hona chahiye')
});

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, rememberedEmail } = useAuth();
  const [rememberMe, setRememberMe] = useState(!!rememberedEmail);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Formik Hook Managing Form State, Real-time Validation & Submission
  const formik = useFormik({
    initialValues: {
      email: rememberedEmail || '',
      password: '',
    },
    validationSchema: loginValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      setErrorMessage(null);
      try {
        await login(values.email.trim(), values.password.trim(), rememberMe);
        onNavigate('/dashboard');
      } catch (err: any) {
        console.error("LoginPage caught login failure:", err);
        // Reset password field in Formik state upon authentication error
        formik.setFieldValue('password', '');
        formik.setFieldTouched('password', false);

        let msg = 'Galat Email ya Password! Kripya sahi credentials check karke daalein.';
        if (err?.message) {
          msg = err.message;
        }
        setErrorMessage(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your credentials to access your Enterprise CRM workspace"
    >
      <form noValidate onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Backend Authentication Error Alert Notification Banner */}
        {errorMessage && (
          <div className="p-4 bg-red-950/90 border-2 border-red-500 text-red-200 text-xs rounded-xl font-bold flex items-start gap-3 shadow-xl shadow-red-950/80 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-red-400 font-extrabold uppercase tracking-wider block text-[11px] mb-1">
                ⚠️ Login Failed
              </span>
              <p className="text-zinc-100 leading-relaxed font-semibold">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white p-1"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Email Input with Formik State & Realtime Yup Validation */}
        <Input
          id="email"
          name="email"
          label="Work Email Address"
          type="email"
          required
          value={formik.values.email}
          onChange={(e) => {
            formik.handleChange(e);
            if (errorMessage) setErrorMessage(null);
          }}
          onBlur={formik.handleBlur}
          placeholder="name@company.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={
            formik.touched.email && formik.errors.email
              ? `⚠️ ${formik.errors.email}`
              : undefined
          }
        />

        {/* Password Input with Formik State & Realtime Yup Validation */}
        <Input
          id="password"
          name="password"
          label="Password"
          type={isPasswordVisible ? 'text' : 'password'}
          required
          value={formik.values.password}
          onChange={(e) => {
            formik.handleChange(e);
            if (errorMessage) setErrorMessage(null);
          }}
          onBlur={formik.handleBlur}
          placeholder="••••••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setIsPasswordVisible(visible => !visible)}
              className="flex items-center text-zinc-400 hover:text-blue-400 focus:outline-none focus:text-blue-400"
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              title={isPasswordVisible ? 'Hide password' : 'Show password'}
            >
              {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={
            formik.touched.password && formik.errors.password
              ? `⚠️ ${formik.errors.password}`
              : undefined
          }
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-400">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => onNavigate('/forgot-password')}
            className="text-blue-400 font-semibold hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button with Loading Spinner & Double Submit Prevention */}
        <Button
          type="submit"
          className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          isLoading={formik.isSubmitting}
          disabled={formik.isSubmitting}
          rightIcon={!formik.isSubmitting ? <ArrowRight className="w-4 h-4" /> : undefined}
        >
          {formik.isSubmitting ? 'Authenticating Account...' : 'Sign In to Account'}
        </Button>

        <div className="text-center text-xs text-zinc-500 pt-4">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('/register')}
            className="text-blue-400 font-bold hover:underline"
          >
            Create an Enterprise Account
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

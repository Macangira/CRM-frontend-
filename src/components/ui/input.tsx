import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-zinc-400 pointer-events-none shrink-0">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={`w-full text-xs rounded-xl bg-white/70 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-300/80 dark:border-white/10 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 ${
            leftIcon ? 'pl-9' : 'pl-3.5'
          } ${rightIcon ? 'pr-9' : 'pr-3.5'} py-2.5 ${
            error ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 text-zinc-400 shrink-0">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[11px] text-red-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-zinc-500">{helperText}</p>
      ) : null}
    </div>
  );
};

import React from "react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  className = "",
  options,
  children,
  ...props
}) => {
  return (
    <div className="space-y-1 text-left">
      {label && (
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}

      <select
        className={`w-full rounded-xl border border-zinc-300/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/65 backdrop-blur-xl text-zinc-900 dark:text-zinc-100 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${className}`}
        {...props}
      >
        {options && options.length > 0
          ? options.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
                {opt.label}
              </option>
            ))
          : children}
      </select>

      {error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Select;

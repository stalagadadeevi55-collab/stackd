import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
}

export function Input({ label, error, hint, prefix, suffix, className = '', id, name, ...props }: InputProps) {
  const inputId = id ?? name ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3.5 text-gray-400 text-sm select-none font-mono">{prefix}</span>
        )}
        <input
          id={inputId}
          name={name}
          className={`
            w-full bg-white rounded-xl px-3.5 py-3 text-gray-900 text-sm
            border border-black/10
            placeholder-gray-300
            focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100
            transition-all duration-150
            ${error ? 'border-red-400 bg-red-50 focus:ring-red-100 focus:border-red-400' : 'hover:border-black/20'}
            ${prefix ? 'pl-8' : ''}
            ${suffix ? 'pr-14' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3.5 text-gray-400 text-xs select-none font-mono">{suffix}</span>
        )}
      </div>
      {hint && !error && <p className="text-xs text-gray-400 font-normal">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

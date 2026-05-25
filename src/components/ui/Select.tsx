import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
}

export function Select({ label, options, error, hint, className = '', id, name, ...props }: SelectProps) {
  const selectId = id ?? name ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        className={`
          w-full bg-white rounded-xl px-3.5 py-3 text-gray-900 text-sm
          border border-black/10
          focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100
          transition-all duration-150
          ${error ? 'border-red-400' : 'hover:border-black/20'}
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

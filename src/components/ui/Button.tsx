import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

const variantClasses = {
  primary: [
    'font-bold text-white gradient-brand',
    'shadow-[0_2px_12px_rgba(34,197,94,0.35)]',
    'hover:shadow-[0_2px_20px_rgba(34,197,94,0.5)]',
    'active:scale-[0.98] transition-all duration-200',
  ].join(' '),
  secondary: [
    'font-semibold text-gray-700 bg-white',
    'border border-black/10',
    'hover:bg-gray-50 hover:border-black/15',
    'active:scale-[0.98] transition-all duration-200',
  ].join(' '),
  ghost: 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 font-medium transition-all duration-150',
  danger: 'bg-red-500 text-white font-semibold hover:bg-red-600 active:scale-[0.98] transition-all duration-150',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

import type { ReactNode } from 'react';

type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'slate';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-green-50 text-green-700 border border-green-200',
  yellow: 'bg-amber-50 text-amber-700 border border-amber-200',
  red: 'bg-red-50 text-red-600 border border-red-200',
  blue: 'bg-sky-50 text-sky-700 border border-sky-200',
  slate: 'bg-gray-100 text-gray-500 border border-gray-200',
};

export function Badge({ children, variant = 'slate' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

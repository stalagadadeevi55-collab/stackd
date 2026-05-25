import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
}

export function Card({ children, className = '', onClick, glow = false }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl p-5
        ${glow
          ? 'gradient-brand text-white'
          : 'bg-white border border-black/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.06)]'}
        ${onClick ? 'cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div
      className={`bg-white border border-stone-200 rounded-xl shadow-xs p-5 ${className}`}
    >
      {children}
    </div>
  );
};
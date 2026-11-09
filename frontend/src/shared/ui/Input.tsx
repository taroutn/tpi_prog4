import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({
  label,
  error,
  className = '',
  id,
  ...props
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border px-3.5 py-2 text-sm text-stone-900 bg-white placeholder:text-stone-400 focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-400'
            : 'border-stone-300 focus:ring-amber-500 focus:border-amber-500'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
};
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface AuthSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function AuthSubmitButton({ children, className = '', ...props }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={`mt-2 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

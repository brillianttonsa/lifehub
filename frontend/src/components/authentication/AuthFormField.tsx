import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Mail, Lock, User } from 'lucide-react';

interface AuthFormFieldProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type'> {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password';
  icon?: 'mail' | 'lock' | 'user';
  error?: string;
  rightSlot?: ReactNode;
}

export function AuthFormField({
  label,
  name,
  type = 'text',
  icon,
  error,
  rightSlot,
  className = '',
  ...props
}: AuthFormFieldProps) {
  const iconMap = {
    mail: <Mail className="absolute left-4 w-4 h-4 text-slate-400" />,
    lock: <Lock className="absolute left-4 w-4 h-4 text-slate-400" />,
    user: <User className="absolute left-4 w-4 h-4 text-slate-400" />,
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon ? iconMap[icon] : null}
        <input
          id={name}
          name={name}
          type={type}
          className={`w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 focus:outline-none focus:border-indigo-500 text-sm transition-all ${icon ? 'pl-11' : 'pl-4'} ${rightSlot ? 'pr-11' : 'pr-4'} ${className}`}
          {...props}
        />
        {rightSlot ? <div className="absolute right-4 flex items-center">{rightSlot}</div> : null}
      </div>
      {error ? <span className="text-xs text-rose-500">{error}</span> : null}
    </div>
  );
}

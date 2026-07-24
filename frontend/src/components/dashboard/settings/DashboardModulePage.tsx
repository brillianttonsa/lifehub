import type { ReactNode } from 'react';

interface DashboardModulePageProps {
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
}

export function DashboardModulePage({ title, eyebrow, description, children }: DashboardModulePageProps) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-col gap-2">
          {eyebrow ? <p className="text-sm font-medium uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">{eyebrow}</p> : null}
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
          {description ? <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">{description}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import { AuthHeader } from './AuthHeader';

interface AuthPageLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
  promptText?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function AuthPageLayout({
  children,
  rightPanel,
  promptText,
  buttonText,
  buttonLink,
}: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-white transition-colors duration-300 font-sans flex flex-col justify-between">
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/15 to-purple-500/15 blur-[120px] rounded-full pointer-events-none" />

      <AuthHeader promptText={promptText} buttonText={buttonText} buttonLink={buttonLink} />

      <main className="max-w-7xl w-full mx-auto px-6 py-8 grid lg:grid-cols-12 gap-12 items-center relative z-10 my-auto">
        <div className="lg:col-span-6 max-w-md w-full mx-auto">{children}</div>

        {rightPanel ? (
          <div className="lg:col-span-6 hidden lg:flex items-center justify-center">{rightPanel}</div>
        ) : null}
      </main>

      <footer className="max-w-7xl w-full mx-auto px-6 py-6 text-center text-xs text-slate-500 dark:text-slate-400 relative z-10">
        © 2026 LifeHub. All rights reserved.
      </footer>
    </div>
  );
}

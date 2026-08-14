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
  promptText,
  buttonText,
  buttonLink,
}: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-white transition-colors duration-300 font-sans flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/15 to-purple-500/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <AuthHeader promptText={promptText} buttonText={buttonText} buttonLink={buttonLink} />

      {/* Main Content Area - Centered */}
      <main className="w-full max-w-7xl mx-auto px-4 py-8 relative z-10 my-auto flex items-center justify-center">
        {/* Bordered Card Container */}
        <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-5 border-t border-slate-200 dark:border-white/10 relative z-10">
        <p className="text-xs text-slate-500 text-center dark:text-slate-400">
          © 2026 LifeHub. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
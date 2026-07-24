import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface AuthHeaderProps {
  promptText?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function AuthHeader({
  promptText = "Already have an account?",
  buttonText = "Log in",
  buttonLink = "/login",
}: AuthHeaderProps) {
  return (
    <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between relative z-10">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 text-slate-900 dark:text-white">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-bold text-xl tracking-tight">LifeHub</span>
      </Link>

      {/* Action Links */}
      <div className="flex items-center gap-4 text-sm">
        {promptText && (
          <span className="text-slate-600 dark:text-slate-400 hidden sm:inline">
            {promptText}
          </span>
        )}
        <Link
          to={buttonLink}
          className="px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 font-medium transition-colors text-slate-900 dark:text-white"
        >
          {buttonText}
        </Link>
      </div>
    </header>
  );
}
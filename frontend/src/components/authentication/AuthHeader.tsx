import { Link } from 'react-router-dom';

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
      <a href="/" className="flex items-center gap-3 w-fit">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span className="text-white font-bold text-lg">
            LH
          </span>
        </div>

        <span className="font-bold text-xl tracking-tight">
          LifeHub
        </span>
      </a>

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
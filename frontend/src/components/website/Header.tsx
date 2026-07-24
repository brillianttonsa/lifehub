import { ArrowRight } from 'lucide-react';
import { ThemeToggle } from "../ui/ThemeToggle";
import { Link } from 'react-router-dom';


export default function Header() {
    
    return (
        <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-[#0B0F19]/70 border-b border-slate-200 dark:border-white/10">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-xl tracking-tight">LifeHub</span>
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#about" className="hover:text-indigo-600 dark:hover:text-white transition-colors">About</a>
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-indigo-600 dark:hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Pricing</a>
          </div>

          {/* Right Actions & Theme Toggle */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            <Link to="/signup" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>
      </header>
    );
}
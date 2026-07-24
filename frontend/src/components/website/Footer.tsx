import { Sparkles} from 'lucide-react';
import { FaGithub, FaLinkedin  } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#070A12] text-slate-900 dark:text-white transition-colors duration-300 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Left Column: Brand, Tagline, Socials & Copyright */}
          <div className="md:col-span-6 flex flex-col gap-6">
            
            {/* Logo */}
            <a href="#" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-xl tracking-tight">LifeHub</span>
            </a>

            {/* Subtext */}
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Your personal operating system. Plan, execute and improve — all from one intelligent workspace.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-500/40 transition-all"
                aria-label="GitHub"
              >
                <FaGithub className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-500/40 transition-all"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-6 h-6" />
              </a>
            </div>

            {/* Copyright */}
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-4">
              © 2026 LifeHub. All rights reserved.
            </p>
          </div>

          {/* Center-Right Columns: Links */}
          <div className="md:col-span-6 grid grid-cols-2 gap-8 md:justify-items-start">
            
            {/* Product Column */}
            <div className="flex flex-col gap-4">
              <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Product
              </span>
              <a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                Features
              </a>
              <a href="#roadmap" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                Roadmap
              </a>
              <a href="#pricing" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                Pricing
              </a>
            </div>

            {/* Company Column */}
            <div className="flex flex-col gap-4">
              <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Company
              </span>
              <a href="#about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                About
              </a>
              <a href="#contact" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                Contact
              </a>
            </div>

          </div>

        </div>
      </div>
    </footer>
  );
}
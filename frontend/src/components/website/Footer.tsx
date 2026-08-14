import { FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#070A12] text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Brand */}
          <div className="flex flex-col gap-5">
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

            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Your personal operating system. Plan, execute and improve — all from one intelligent workspace.
            </p>
          </div>

          {/* Connect */}
          <div className="md:flex md:flex-col">
            <h3 className="text-sm font-semibold mb-4">
              Connect
            </h3>

            <div className="flex items-center gap-3 mb-2">
              <a
                href="https://github.com/brillianttonsa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all"
              >
                <FaGithub className="w-5 h-5" />
              </a>

              <a
                href="https://www.linkedin.com/in/abdullatif-mnyamis-19a66a369/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>

            <a
              href="mailto:abdullatifmnyamis@gmail.com"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors"
            >
              abdullatifmnyamis@gmail.com
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-5 border-t border-slate-200 dark:border-white/10">
          <p className="text-xs text-slate-500 text-center dark:text-slate-400">
            © 2026 LifeHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VisionCTA() {
  return (
    <section className="py-20 bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Main Glass/Glow Call-to-Action Card */}
        <div className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-b from-white to-slate-100/80 dark:from-white/[0.04] dark:to-white/[0.01] backdrop-blur-2xl p-10 sm:p-16 md:p-20 text-center shadow-2xl overflow-hidden">
          
          {/* Background Radial Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-purple-500/15 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl mx-auto">
            
            {/* Top Eyebrow Tag */}
            <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              THE FUTURE OF LIFEHUB
            </span>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Your life, intelligently{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
                orchestrated.
              </span>
            </h2>

            {/* Subtitle Copy */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal pt-1">
              An AI companion that understands your goals, your habits and your ambitions — and helps you show up for the person you want to become.
            </p>

            {/* Glow CTA Button */}
            <div className="pt-4">
              <Link to="/signup" className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-medium text-sm shadow-xl shadow-indigo-500/30 transition-all hover:-translate-y-0.5 group">
                <span>Start Building Your Future</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
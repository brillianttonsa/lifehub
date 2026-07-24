import { User, CalendarCheck, Wallet, Zap, FolderDot, ArrowRight} from 'lucide-react';
import Header from './Header';

interface ModuleProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  position: string;
}

const modulesData: ModuleProps[] = [
  { id: 'plan', label: 'Plan', icon: <CalendarCheck className="w-5 h-5 text-indigo-400" />, position: 'top-12 left-4' },
  { id: 'Wallet', label: 'Wallet', icon: <Wallet className="w-5 h-5 text-emerald-400" />, position: 'top-10 right-4' },
  { id: 'habits', label: 'Habits', icon: <Zap className="w-5 h-5 text-sky-400" />, position: 'bottom-16 left-6' },
  { id: 'projects', label: 'Projects', icon: <FolderDot className="w-5 h-5 text-fuchsia-400" />, position: 'bottom-20 right-4' },
];

export default function Hero() {
  
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-white transition-colors duration-300 font-sans overflow-hidden">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      
      <Header />  

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-36 pb-20 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Text & CTA */}
        <div className="lg:col-span-6 flex flex-col items-start gap-6">
          
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 backdrop-blur-sm">
            <span>Your personal operating system</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Take control <br />
            of your life. <br />
            One <span className="bg-gradient-to-r from-indigo-500 to-violet-400 bg-clip-text text-transparent">system</span>. One <span className="bg-gradient-to-r from-indigo-500 to-violet-400 bg-clip-text text-transparent">vision</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            LifeHub helps you plan your goals, manage your finances, build habits, and execute your projects — all from one intelligent workspace.
          </p>

          
        </div>

        {/* Right Column: Interactive Dashboard Graphic */}
        <div className="lg:col-span-6 flex items-center justify-center relative">
          <div className="relative w-full aspect-square max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl shadow-2xl p-8 flex flex-col items-center justify-center overflow-hidden">
            
            {/* Concentric Circle Background Lines */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-slate-300 dark:border-white/10 pointer-events-none" />
            <div className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-indigo-500/20 pointer-events-none" />
            
            {/* Central User Avatar Icon */}
            <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-indigo-500/40 bg-white dark:bg-[#0B0F19] shadow-2xl shadow-indigo-500/30 flex items-center justify-center my-auto">
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 dark:text-indigo-400" />
            </div>

            {/* Dynamic Floating Module Cards */}
            {modulesData.map((module) => (
              <div
                key={module.id}
                className={`absolute ${module.position} flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#131826]/80 backdrop-blur-md shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all cursor-pointer`}
              >
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  {module.icon}
                </div>
                <span className="font-semibold text-sm tracking-tight">{module.label}</span>
              </div>
            ))}

          </div>
        </div>

      </main>
    </div>
  );
}
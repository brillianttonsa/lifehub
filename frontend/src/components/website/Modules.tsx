import { CalendarCheck, Wallet, Zap, FolderDot, ArrowUpRight } from 'lucide-react';

const modules = [
  {
    id: 'plan',
    title: 'Plan',
    badge: 'Calendar & Roadmap',
    description:
      'Organize your day, schedule life events, and align your daily actions with long-term vision.',
    icon: <CalendarCheck className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />,
    gradient: 'from-indigo-500/10 to-violet-500/10',
  },
  {
    id: 'Wallet',
    title: 'Wallet',
    badge: 'Finance & Budgeting',
    description:
      'Master your cash flow, track expenses, and watch your savings grow with zero friction.',
    icon: <Wallet className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
    gradient: 'from-emerald-500/10 to-teal-500/10',
  },
  {
    id: 'habits',
    title: 'Habits',
    badge: 'Consistency Engine',
    description:
      'Build unbreakable daily streaks, set intelligent check-ins, and track habit progress.',
    icon: <Zap className="w-6 h-6 text-sky-500 dark:text-sky-400" />,
    gradient: 'from-sky-500/10 to-blue-500/10',
  },
  {
    id: 'projects',
    title: 'Projects',
    badge: 'Execution & Milestones',
    description:
      'Break down ambitious goals into actionable tasks, milestones, and deliverable pipelines.',
    icon: <FolderDot className="w-6 h-6 text-fuchsia-500 dark:text-fuchsia-400" />,
    gradient: 'from-fuchsia-500/10 to-purple-500/10',
  },
];

export default function Modules() {
  return (
    <section id="features" className="py-24 bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-16 max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
            LIFE MODULES
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Four core pillars. <br />
            <span className="bg-gradient-to-r from-indigo-500 to-violet-400 bg-clip-text text-transparent">
              One unified workspace.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
            Everything you need to manage your personal life, finances, routines, and big ambitions.
          </p>
        </div>

        {/* 2x2 Glass Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {modules.map((module) => (
            <div
              key={module.id}
              className={`group relative p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] backdrop-blur-md shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-500/10 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between gap-8 overflow-hidden`}
            >
              {/* Subtle background gradient tint on card hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />

              <div className="relative z-10 flex flex-col gap-6">
                {/* Top Row: Icon + Badge */}
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:scale-105 transition-transform">
                    {module.icon}
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                    {module.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{module.title}</span>
                    <ArrowUpRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    {module.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
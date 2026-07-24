import { Compass, Target, TrendingUp } from 'lucide-react';

const reasonCards = [
  {
    icon: <Compass className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
    title: 'One Connected System',
    description:
      'Your goals, money, habits and projects work together instead of living in scattered tools.',
  },
  {
    icon: <Target className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
    title: 'Designed For Action',
    description:
      'Not just tracking. LifeHub helps you turn intention into daily execution.',
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
    title: 'Personal Growth Engine',
    description:
      'Understand yourself through your own data and compound progress over time.',
  },
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Split Section: Title & Mission Narrative */}
        <div className="grid lg:grid-cols-12 gap-12 items-start mb-20">
          
          {/* Left Column: Heading & Eyebrow */}
          <div className="lg:col-span-7 flex flex-col items-start gap-4">
            <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              ABOUT
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              Life is managed through scattered tools.{' '}
              <span className="text-slate-400 dark:text-slate-500">
                LifeHub brings it together.
              </span>
            </h2>
          </div>

          {/* Right Column: Mission Text */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
            <p>
              Notes for goals. Spreadsheets for money. Reminders for habits. Separate apps for projects. Every part of your life lives somewhere else.
            </p>
            <p className="text-slate-900 dark:text-slate-200 font-medium">
              Our mission is to help you transform intention into execution — a single place to plan, track and improve every area of your life.
            </p>
          </div>
        </div>

        {/* Bottom Section: 3 Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {reasonCards.map((card, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] backdrop-blur-md shadow-sm hover:shadow-xl dark:hover:shadow-indigo-500/10 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col gap-6"
            >
              {/* Icon Container */}
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                {card.icon}
              </div>

              {/* Title & Description */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
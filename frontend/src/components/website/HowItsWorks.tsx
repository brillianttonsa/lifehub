const steps = [
  {
    number: '01',
    title: 'Plan',
    description:
      'Define your goals, cycles and the direction of each area of your life.',
  },
  {
    number: '02',
    title: 'Execute',
    description:
      'Track your daily actions, habits, spending and project progress in one flow.',
  },
  {
    number: '03',
    title: 'Improve',
    description:
      'Reflect on your own data, learn what works, and evolve your system.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 mb-16 max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            A simple loop that compounds.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
            LifeHub is built on one philosophy: plan with clarity, execute with focus, improve with data.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] backdrop-blur-md shadow-sm hover:shadow-xl dark:hover:shadow-indigo-500/10 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col gap-6"
            >
              {/* Large Gradient Number */}
              <span className="font-extrabold text-5xl sm:text-6xl bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-400 bg-clip-text text-transparent tracking-tight">
                {step.number}
              </span>

              {/* Title & Description */}
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
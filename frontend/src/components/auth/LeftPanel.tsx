import { motion } from "framer-motion";
import { Link } from 'react-router-dom'
import { useTheme } from "../../context/useTheme";
import { modules } from "../../constants/modules";

export function LeftPanel() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="w-full max-w-xl relative mt-4 md:mt-0">
      
      <div className="absolute top-1/4 -left-10 w-72 h-72 bg-indigo-600/[0.06] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-10 w-64 h-64 bg-violet-600/[0.06] rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8 lg:mb-10"
      >
        <h1
          className="text-3xl xl:text-5xl font-bold leading-[1.15] tracking-tight mb-4 transition-colors duration-300"
          style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
        >
          One place for{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            money, projects,
          </span>{" "}
          habits, and plans.
        </h1>
        <p
          className="text-sm lg:text-base leading-relaxed transition-colors duration-300"
          style={{ color: isDark ? "#94a3b8" : "#64748b" }}
        >
          LifeHub unifies the four pillars of a well-run life into a single, calm workspace — no switching apps, no scattered notes.
        </p>
      </motion.div>

      {/* Pillars Feature Grid */}
      <div className="grid grid-cols-2 gap-3">
        {modules.map((mod, i) => {
          const card = (
            <motion.div
              key={mod.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
              className={`group relative rounded-xl border ${mod.border} bg-gradient-to-br ${mod.color} p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20`}
            >
              <div className={`${mod.accent} mb-2.5 opacity-90 group-hover:opacity-100 transition-opacity`}>
                <mod.icon size={24} />
              </div>
              <h3 
                className="text-lg font-semibold mb-1 transition-colors duration-300"
                style={{ color: isDark ? "#f1f5f9" : "#1e293b" }}
              >
                {mod.name}
              </h3>
              <p 
                className="text-sm leading-normal transition-colors duration-300"
                style={{ color: isDark ? "#94a3b8" : "#64748b" }}
              >
                {mod.desc}
              </p>
            </motion.div>
          )

          return mod.name === 'Plan' ? (
            <Link key={mod.name} to="/plans" className="block">
              {card}
            </Link>
          ) : (
            card
          )
        })}
      </div>
    </div>
  );
}

import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-14 h-7 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #1e2538 0%, #0d1222 100%)"
          : "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(99,102,241,0.3)",
      }}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-200"
        style={{ opacity: isDark ? 0.4 : 0 }}>
        <Moon size={11} className="text-indigo-300" />
      </span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-200"
        style={{ opacity: isDark ? 0 : 0.5 }}>
        <Sun size={11} className="text-indigo-500" />
      </span>

      {/* Thumb */}
      <motion.span
        animate={{ x: isDark ? 28 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="absolute top-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #818cf8, #6366f1)"
            : "linear-gradient(135deg, #fbbf24, #f59e0b)",
          boxShadow: isDark
            ? "0 1px 6px rgba(99,102,241,0.5)"
            : "0 1px 6px rgba(251,191,36,0.5)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.6 }}
            transition={{ duration: 0.18 }}
          >
            {isDark ? (
              <Moon size={10} className="text-white" />
            ) : (
              <Sun size={10} className="text-white" />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
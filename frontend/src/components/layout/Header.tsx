import { Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { ThemeToggle } from "../ui/ThemeToggle";

export function Header() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-10 h-14 transition-colors duration-300"
      style={{
        background: isDark
          ? "rgba(8, 12, 24, 0.85)"
          : "rgba(248, 250, 255, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(99,102,241,0.12)",
      }}
    >
      {/* Left — Logo + Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
          <Sparkles size={13} className="text-white" />
        </div>
        <span
          className="text-sm font-bold tracking-tight transition-colors duration-300"
          style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}
        >
          LifeHub
        </span>
        <span
          className="hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full border transition-colors duration-300"
          style={{
            color: "#818cf8",
            background: isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)",
            borderColor: isDark ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.2)",
          }}
        >
          Beta
        </span>
      </div>

      {/* Center — Page title (desktop) */}
      <div className="hidden md:flex items-center gap-1.5">
        <span
          className="text-xs font-medium transition-colors duration-300"
          style={{ color: isDark ? "#64748b" : "#94a3b8" }}
        >
          Personal Life Management
        </span>
      </div>

      {/* Right — Theme toggle */}
      <div className="flex items-center gap-3">
        <span
          className="hidden sm:inline text-xs transition-colors duration-300"
          style={{ color: isDark ? "#475569" : "#94a3b8" }}
        >
          {isDark ? "Dark" : "Light"}
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}

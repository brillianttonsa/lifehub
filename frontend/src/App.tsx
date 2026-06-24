import { Sparkles } from "lucide-react";
import { useTheme } from "./context/ThemeContext";
import { Header } from "./components/layout/Header";
import { LeftPanel } from "./features/auth/components/LeftPanel";
import { AuthCard } from "./features/auth/AuthCard";

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300 relative overflow-x-hidden"
      style={{ background: isDark ? "#080C18" : "#f8faff", color: isDark ? "#f1f5f9" : "#0f172a" }}
    >
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: isDark
            ? "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)"
            : "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: isDark ? 0.015 : 1,
        }}
      />

      {/* Global Header */}
      <Header />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 pt-14 max-w-[1600px] w-full mx-auto relative z-10">
        
        {/* Left — Descriptions Panel (Visible on all screens now) */}
        <div
          className="col-span-1 lg:col-span-7 xl:col-span-7 flex items-center justify-center px-2 py-2 sm:px-4 lg:py-4 xl:px-6 transition-colors duration-300"
          style={{
            borderRight: window.innerWidth >= 1024 
              ? (isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(99,102,241,0.1)") 
              : "none",
          }}
        >
          <LeftPanel />
        </div>

        {/* Right — Auth Panel */}
        <div className="col-span-1 lg:col-span-5 xl:col-span-5 flex items-center justify-center px-4 pb-16 pt-4 sm:px-6 lg:px-8 relative">
          {/* Right panel ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: isDark
                ? "radial-gradient(ellipse at 70% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)"
                : "radial-gradient(ellipse at 70% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)",
            }}
          />

          <AuthCard />
        </div>
      </main>
    </div>
  );
}
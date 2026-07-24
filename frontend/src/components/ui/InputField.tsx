import {useState} from 'react'
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from '../../context/themecontext/useTheme'

export function InputField({
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-medium tracking-wide uppercase transition-colors duration-300"
        style={{ color: isDark ? "#64748b" : "#94a3b8" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 ${
            error
              ? "border-red-500/60 focus:ring-red-500/30"
              : isDark
              ? "border-white/10 hover:border-white/20"
              : "border-slate-200 hover:border-indigo-300"
          } ${isPassword ? "pr-11" : ""}`}
          style={{
            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(248,250,255,0.8)",
            color: isDark ? "#e2e8f0" : "#1e293b",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1"
            style={{ color: isDark ? "#64748b" : "#94a3b8" }}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-400 flex items-center gap-1"
          >
            <AlertCircle size={11} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

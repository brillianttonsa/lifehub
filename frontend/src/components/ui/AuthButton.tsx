import { Loader2 } from 'lucide-react'

export function AuthButton({
  children,
  onClick,
  loading,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent group"
    >
      <span className={`flex items-center justify-center gap-2 transition-opacity ${loading ? "opacity-0" : "opacity-100"}`}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={18} className="animate-spin" />
        </span>
      )}
    </button>
  );
}
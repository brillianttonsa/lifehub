import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { AuthPageLayout } from '../../components/authentication/AuthPageLayout';
import { AuthFormField } from '../../components/authentication/AuthFormField';
import { AuthSubmitButton } from '../../components/authentication/AuthSubmitButton';
import { useAuthForm } from '../../hooks/authentication/useAuthForm';

export default function Login() {
  const {
    formData,
    fieldErrors,
    showPassword,
    loading,
    toast,
    togglePasswordVisibility,
    handleChange,
    handleLoginSubmit,
  } = useAuthForm();

  const rightPanel = (
    <div className="relative w-full aspect-square max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl p-10 flex flex-col justify-between overflow-hidden shadow-2xl">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold tracking-widest text-indigo-500 uppercase">WELCOME BACK</span>
        <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
          "Small habits daily, massive compounding yearly."
        </h2>
      </div>

      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>System Health</span>
          <span className="text-emerald-400 font-semibold">100% Operational</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full w-full" />
        </div>
      </div>
    </div>
  );

  return (
    <AuthPageLayout
      promptText="Don't have an account?"
      buttonText="Sign up"
      buttonLink="/signup"
      rightPanel={rightPanel}
    >
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Enter your credentials to access your LifeHub dashboard.
        </p>
      </div>

      {toast ? (
        <div className={`mb-6 p-4 rounded-xl text-xs font-medium border ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {toast.msg}
        </div>
      ) : null}

      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/5 text-sm font-medium transition-all duration-200 shadow-sm"
      >
        <FaGoogle className="w-5 h-5" />
        <span>Log in with Google</span>
      </button>

      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-white/10" />
        </div>
        <span className="relative px-4 text-xs font-semibold uppercase tracking-wider bg-slate-50 dark:bg-[#0B0F19] text-slate-400">
          or email
        </span>
      </div>

      <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
        <AuthFormField
          label="Email Address"
          name="email"
          type="email"
          icon="mail"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          error={fieldErrors.email}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <Link to="/forgot-password" className="text-xs text-indigo-500 hover:underline">Forgot?</Link>
          </div>
          <AuthFormField
            label=""
            name="password"
            type={showPassword ? 'text' : 'password'}
            icon="lock"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            error={fieldErrors.password}
            rightSlot={
              <button type="button" onClick={togglePasswordVisibility} className="text-slate-400 hover:text-slate-200">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        <AuthSubmitButton disabled={loading}>
          <span>{loading ? 'Signing in...' : 'Log In'}</span>
          <ArrowRight className="w-4 h-4" />
        </AuthSubmitButton>
      </form>
    </AuthPageLayout>
  );
}
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { AuthPageLayout } from '../../components/authentication/AuthPageLayout';
import { AuthFormField } from '../../components/authentication/AuthFormField';
import { AuthSubmitButton } from '../../components/authentication/AuthSubmitButton';
import { useAuthForm } from '../../hooks/authentication/useAuthForm';

export default function Signup() {
  const {
    formData,
    fieldErrors,
    showPassword,
    loading,
    toast,
    togglePasswordVisibility,
    handleChange,
    handleSignupSubmit,
  } = useAuthForm();

  const rightPanel = (
    <div className="relative w-full aspect-square max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl p-10 flex flex-col justify-between overflow-hidden shadow-2xl">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold tracking-widest text-indigo-500 uppercase">LIFEHUB OS</span>
        <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
          Turn scattered ideas into structured success.
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          One intelligent system for your daily plans, habits, pocket finances, and project milestones.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5">
          <span className="text-xl font-bold text-indigo-500">4-in-1</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">Unified Life Modules</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5">
          <span className="text-xl font-bold text-violet-500">AI Powered</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">Personal Companion</p>
        </div>
      </div>
    </div>
  );

  return (
    <AuthPageLayout
      promptText="Already have an account?"
      buttonText="Log in"
      buttonLink="/login"
      rightPanel={rightPanel}
    >
      

      {toast ? (
        <div className={`mb-6 p-4 rounded-xl text-xs font-medium border ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {toast.msg}
        </div>
      ) : null}

     

      <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
        <AuthFormField
          label="Username"
          name="username"
          type="text"
          icon="user"
          placeholder="johndoe"
          value={formData.username}
          onChange={handleChange}
          required
          error={fieldErrors.username}
        />

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

        <AuthFormField
          label="Password"
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

        <AuthFormField
          label="Confirm Password"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          icon="lock"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          error={fieldErrors.confirmPassword}
        />

        <AuthSubmitButton disabled={loading}>
          <span>{loading ? 'Creating account...' : 'Create Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </AuthSubmitButton>
      </form>
    </AuthPageLayout>
  );
}

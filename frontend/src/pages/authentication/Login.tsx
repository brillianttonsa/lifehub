import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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


  return (
    <AuthPageLayout
      promptText="Don't have an account?"
      buttonText="Sign up"
      buttonLink="/signup"
    >
      
      {toast ? (
        <div className={`mb-6 p-4 rounded-xl text-xs font-medium border ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {toast.msg}
        </div>
      ) : null}

      
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

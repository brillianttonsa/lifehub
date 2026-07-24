import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { AuthPageLayout } from '../../components/authentication/AuthPageLayout';
import { AuthFormField } from '../../components/authentication/AuthFormField';
import { AuthSubmitButton } from '../../components/authentication/AuthSubmitButton';
import { useAuthForm } from '../../hooks/authentication/useAuthForm';

export default function ForgotPassword() {
  const {
    formData,
    fieldErrors,
    showPassword,
    loading,
    toast,
    forgotStep,
    setForgotStep,
    togglePasswordVisibility,
    handleChange,
    handleRequestReset,
    handleVerifyCode,
    handleResetPassword,
  } = useAuthForm();

  const rightPanel = (
    <div className="relative w-full aspect-square max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl p-10 flex flex-col justify-between overflow-hidden shadow-2xl">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold tracking-widest text-indigo-500 uppercase">SECURITY & ACCOUNT RECOVERY</span>
        <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
          Protected and encrypted, every step of the way.
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          LifeHub uses token verification to ensure only authorized users access account recovery channels.
        </p>
      </div>

      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Account Protection</span>
          <span className="text-indigo-400 font-semibold">Active Shield</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full w-full" />
        </div>
      </div>
    </div>
  );

  return (
    <AuthPageLayout
      promptText="Remembered your password?"
      buttonText="Log in"
      buttonLink="/login"
      rightPanel={rightPanel}
    >
      {toast ? (
        <div className={`mb-6 p-4 rounded-xl text-xs font-medium border ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {toast.msg}
        </div>
      ) : null}

      {forgotStep === 'forgot' && (
        <>
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Reset password</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enter your account email and we'll send a 6-digit verification code.
            </p>
          </div>

          <form onSubmit={handleRequestReset} className="flex flex-col gap-4">
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

            <AuthSubmitButton disabled={loading}>
              <span>{loading ? 'Sending Code...' : 'Send Verification Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </AuthSubmitButton>
          </form>
        </>
      )}

      {forgotStep === 'verify' && (
        <>
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Check your email</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enter the code sent to <span className="text-indigo-400 font-medium">{formData.email}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
            <AuthFormField
              label="Verification Code"
              name="code"
              type="text"
              icon="mail"
              placeholder="123456"
              value={formData.code}
              onChange={handleChange}
              required
              maxLength={6}
              error={fieldErrors.code}
            />

            <AuthSubmitButton>
              <span>Verify Code</span>
              <ArrowRight className="w-4 h-4" />
            </AuthSubmitButton>

            <button
              type="button"
              onClick={() => setForgotStep('forgot')}
              className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Resend code or change email</span>
            </button>
          </form>
        </>
      )}

      {forgotStep === 'reset' && (
        <>
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Set new password</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Choose a strong new password for your account.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <AuthFormField
              label="New Password"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              icon="lock"
              placeholder="••••••••"
              value={formData.newPassword}
              onChange={handleChange}
              required
              error={fieldErrors.newPassword}
              rightSlot={
                <button type="button" onClick={togglePasswordVisibility} className="text-slate-400 hover:text-slate-200">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <AuthFormField
              label="Confirm New Password"
              name="newConfirmPassword"
              type={showPassword ? 'text' : 'password'}
              icon="lock"
              placeholder="••••••••"
              value={formData.newConfirmPassword}
              onChange={handleChange}
              required
              error={fieldErrors.newConfirmPassword}
            />

            <AuthSubmitButton disabled={loading}>
              <span>{loading ? 'Resetting Password...' : 'Reset Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </AuthSubmitButton>
          </form>
        </>
      )}
    </AuthPageLayout>
  );
}

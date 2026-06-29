import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "../../context/useTheme";

// Types & API & Utils
import { AuthView, FormState, FieldError } from "../../types/auth";
import { requestPasswordReset, resetPassword } from "./api/authApi";
import { getApiErrorMessage } from "../../lib/apiClient";
import { useAuth } from "./context/useAuth";
import { validateEmail, validatePassword } from "../../utils/validation";

// Shared Elements
import { InputField } from "../../components/ui/InputField";
import { AuthButton } from "../../components/ui/AuthButton";
import { TextLink } from "../../components/ui/TextLink";
import { Toast } from "../../components/ui/Toast";

// utils
import { viewVariants, transition } from "./constants/variants";


export function AuthCard() {
  const { signIn, signUp } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [view, setView] = useState<AuthView>("signin");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [errors, setErrors] = useState<FieldError>({});
  const [pendingEmail, setPendingEmail] = useState("");
  const [verifiedCode, setVerifiedCode] = useState("");

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    code: "",
    newPassword: "",
    newConfirmPassword: "",
  });

  const set = (field: keyof FormState) => (v: string) => {
    setForm((f) => ({ ...f, [field]: v }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const navigate = useCallback((next: AuthView) => {
    setErrors({});
    setToast(null);
    setView(next);
  }, []);

  const handleSignIn = async () => {
    const errs: FieldError = {};
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    if (!form.password) errs.password = "Password is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await signIn(form.email, form.password);
      showToast("Signed in!", "success");
    } catch (e: unknown) {
      showToast(getApiErrorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    const errs: FieldError = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const passErr = validatePassword(form.password);
    if (passErr) errs.password = passErr;
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await signUp(form.fullName, form.email, form.password);
      showToast("Account created!", "success");
    } catch (e: unknown) {
      showToast(getApiErrorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    const emailErr = validateEmail(form.email);
    if (emailErr) { setErrors({ email: emailErr }); return; }

    setLoading(true);
    try {
      await requestPasswordReset(form.email);
      setPendingEmail(form.email);
      showToast("Password reset token requested. Check the backend email flow.", "success");
      setTimeout(() => navigate("verify"), 800);
    } catch (e: unknown) {
      showToast(getApiErrorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (form.code.length < 6) { setErrors({ code: "Enter the 6-digit code" }); return; }

    setVerifiedCode(form.code);
    navigate("reset");
  };

  const handleReset = async () => {
    const errs: FieldError = {};
    const passErr = validatePassword(form.newPassword);
    if (passErr) errs.newPassword = passErr;
    if (form.newPassword !== form.newConfirmPassword) errs.newConfirmPassword = "Passwords don't match";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await resetPassword(verifiedCode, form.newPassword);
      showToast("Password reset! Please sign in.", "success");
      setTimeout(() => navigate("signin"), 1500);
    } catch (e: unknown) {
      showToast(getApiErrorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  };

  const viewConfig: Record<AuthView, { title: string; subtitle: string }> = {
    signin: { title: "Welcome back", subtitle: "Sign in to your LifeHub account" },
    signup: { title: "Create account", subtitle: "Start managing your life, smarter" },
    forgot: { title: "Forgot password?", subtitle: "We'll send a recovery code to your email" },
    verify: { title: "Check your email", subtitle: `Code sent to ${pendingEmail || "your email"}` },
    reset: { title: "Set new password", subtitle: "Choose a strong password" },
  };

  return (
    <div className="w-full max-w-md">
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(99,102,241,0.15)",
          background: isDark ? "rgba(13,18,34,0.9)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(24px)",
          boxShadow: isDark
            ? "0 25px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)"
            : "0 25px 50px rgba(99,102,241,0.1), 0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

        <div className="p-8">
          

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <div className="mb-7">
                <h2
                  className="text-xl font-bold mb-1 transition-colors duration-300"
                  style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
                >
                  {viewConfig[view].title}
                </h2>
                <p
                  className="text-sm transition-colors duration-300"
                  style={{ color: isDark ? "#64748b" : "#94a3b8" }}
                >
                  {viewConfig[view].subtitle}
                </p>
              </div>

              <AnimatePresence>
                {toast && <Toast message={toast.msg} type={toast.type} />}
              </AnimatePresence>

              {view === "signin" && (
                <div className="flex flex-col gap-4">
                  <InputField
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    error={errors.email}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  <div className="flex flex-col gap-1.5">
                    <InputField
                      label="Password"
                      type="password"
                      value={form.password}
                      onChange={set("password")}
                      error={errors.password}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <div className="flex justify-end mt-0.5">
                      <TextLink onClick={() => navigate("forgot")}>Forgot password?</TextLink>
                    </div>
                  </div>
                  <div className="mt-2">
                    <AuthButton onClick={handleSignIn} loading={loading}>
                      Sign In
                    </AuthButton>
                  </div>
                  <p
                    className="text-center text-sm transition-colors duration-300"
                    style={{ color: isDark ? "#64748b" : "#94a3b8" }}
                  >
                    No account?{" "}
                    <TextLink onClick={() => navigate("signup")}>Create one</TextLink>
                  </p>
                </div>
              )}

              {view === "signup" && (
                <div className="flex flex-col gap-4">
                  <InputField
                    label="Full Name"
                    value={form.fullName}
                    onChange={set("fullName")}
                    error={errors.fullName}
                    placeholder="Alex Johnson"
                    autoComplete="name"
                  />
                  <InputField
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    error={errors.email}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  <InputField
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    error={errors.password}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                  />
                  <InputField
                    label="Confirm Password"
                    type="password"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    error={errors.confirmPassword}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                  <div className="mt-2">
                    <AuthButton onClick={handleSignUp} loading={loading}>
                      Create Account
                    </AuthButton>
                  </div>
                  <p
                    className="text-center text-sm transition-colors duration-300"
                    style={{ color: isDark ? "#64748b" : "#94a3b8" }}
                  >
                    Already have an account?{" "}
                    <TextLink onClick={() => navigate("signin")}>Sign in</TextLink>
                  </p>
                </div>
              )}

              {view === "forgot" && (
                <div className="flex flex-col gap-4">
                  <InputField
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    error={errors.email}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  <div className="mt-2">
                    <AuthButton onClick={handleForgot} loading={loading}>
                      Send Verification Code
                    </AuthButton>
                  </div>
                  <button
                    onClick={() => navigate("signin")}
                    className="flex items-center justify-center gap-1.5 text-sm transition-colors mx-auto"
                    style={{ color: isDark ? "#64748b" : "#94a3b8" }}
                  >
                    <ArrowLeft size={13} />
                    Back to Sign In
                  </button>
                </div>
              )}

              {view === "verify" && (
                <div className="flex flex-col gap-4">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-indigo-400">
                    Enter the 6-digit code we sent to <span className="font-semibold">{pendingEmail}</span>
                  </div>
                  <InputField
                    label="Verification Code"
                    value={form.code}
                    onChange={set("code")}
                    error={errors.code}
                    placeholder="000000"
                    autoComplete="one-time-code"
                  />
                  <div className="mt-2">
                    <AuthButton onClick={handleVerify} loading={loading}>
                      Verify Code
                    </AuthButton>
                  </div>
                  <button
                    onClick={() => navigate("forgot")}
                    className="flex items-center justify-center gap-1.5 text-sm transition-colors mx-auto"
                    style={{ color: isDark ? "#64748b" : "#94a3b8" }}
                  >
                    <ArrowLeft size={13} />
                    Resend code
                  </button>
                </div>
              )}

              {view === "reset" && (
                <div className="flex flex-col gap-4">
                  <InputField
                    label="New Password"
                    type="password"
                    value={form.newPassword}
                    onChange={set("newPassword")}
                    error={errors.newPassword}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                  />
                  <InputField
                    label="Confirm New Password"
                    type="password"
                    value={form.newConfirmPassword}
                    onChange={set("newConfirmPassword")}
                    error={errors.newConfirmPassword}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                  />
                  <div className="mt-2">
                    <AuthButton onClick={handleReset} loading={loading}>
                      Reset Password
                    </AuthButton>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p
        className="text-center text-xs mt-5 transition-colors duration-300"
        style={{ color: isDark ? "#334155" : "#cbd5e1" }}
      >
        By continuing, you agree to LifeHub's{" "}
        <span
          className="cursor-pointer transition-colors"
          style={{ color: isDark ? "#475569" : "#94a3b8" }}
        >
          Terms
        </span>
        {" & "}
        <span
          className="cursor-pointer transition-colors"
          style={{ color: isDark ? "#475569" : "#94a3b8" }}
        >
          Privacy
        </span>
      </p>
    </div>
  );
}

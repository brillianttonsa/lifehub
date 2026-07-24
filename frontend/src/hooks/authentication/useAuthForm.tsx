import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "../../api/authApi";
import { getApiErrorMessage } from "../../lib/apiClient";
import { useAuth } from "../../context/authcontext/useAuth";
import { validateEmail, validatePassword } from "../../utils/validation";
import type { AuthFormData } from "../../types/auth";

export type AuthStep = "forgot" | "verify" | "reset";

export function useAuthForm() {
  const navigate = useNavigate();
  const { connectionError, signIn, signUp } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [forgotStep, setForgotStep] = useState<AuthStep>("forgot");
  const [resetToken, setResetToken] = useState("");

  const [formData, setFormData] = useState<AuthFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    code: "",
    newPassword: "",
    newConfirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 4000);
  };

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const emailErr = validateEmail(formData.email);
    if (emailErr) {
      setFieldErrors({ email: emailErr });
      return;
    }
    if (!formData.password) {
      setFieldErrors({ password: "Password is required" });
      return;
    }

    setLoading(true);
    try {
      await signIn(formData.email, formData.password);
      showToast("Signed in successfully!", "success");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const errs: Record<string, string> = {};
    if (!formData.username.trim()) errs.username = "Username is required";

    const emailErr = validateEmail(formData.email);
    if (emailErr) errs.email = emailErr;

    const passErr = validatePassword(formData.password);
    if (passErr) errs.password = passErr;

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await signUp(formData.username, formData.email, formData.password);
      showToast("Account created successfully!", "success");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const emailErr = validateEmail(formData.email);
    if (emailErr) {
      setFieldErrors({ email: emailErr });
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(formData.email);
      showToast("If the account exists, password reset instructions have been sent.", "success");
      setResetToken("");
      setForgotStep("verify");
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    if (!resetToken) {
      setFieldErrors({ code: "The reset code was not received. Please request a new one." });
      return;
    }

    if (formData.code.trim().length < 6) {
      setFieldErrors({ code: "Please enter the complete 6-digit code" });
      return;
    }

    if (formData.code.trim() !== resetToken) {
      setFieldErrors({ code: "The code you entered does not match the one we generated" });
      return;
    }

    setForgotStep("reset");
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const errs: Record<string, string> = {};
    const passErr = validatePassword(formData.newPassword);
    if (passErr) errs.newPassword = passErr;

    if (formData.newPassword !== formData.newConfirmPassword) {
      errs.newConfirmPassword = "Passwords do not match";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetToken, formData.newPassword);
      showToast("Password successfully reset! Redirecting to login...", "success");
      window.setTimeout(() => navigate("/login"), 1500);
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    fieldErrors,
    showPassword,
    loading,
    toast,
    connectionError,
    forgotStep,
    setForgotStep,
    togglePasswordVisibility,
    handleChange,
    handleLoginSubmit,
    handleSignupSubmit,
    handleRequestReset,
    handleVerifyCode,
    handleResetPassword,
  };
}

import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { authService } from "@/services/auth";
import { LoadingSpinner } from "../common/LoadingSpinner";

export function ResetPasswordForm({ token }: { token: string }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) return setErr("Password must be at least 8 characters");
    if (password !== confirm) return setErr("Passwords don't match");
    try {
      setBusy(true);
      await authService.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate({ to: "/login" }), 1500);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
      {done ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm">
          Password updated. Redirecting to login…
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          {err && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err}
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {busy && <LoadingSpinner />}
            Reset password
          </button>
        </form>
      )}
      <p className="text-center text-sm">
        <Link to="/login" className="text-muted-foreground hover:text-foreground">
          ← Back to login
        </Link>
      </p>
    </div>
  );
}

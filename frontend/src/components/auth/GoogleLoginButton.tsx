import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { config } from "@/lib/config";
import { LoadingSpinner } from "../common/LoadingSpinner";

export function GoogleLoginButton({ onSuccess }: { onSuccess?: () => void }) {
  const { loginWithGoogleCode } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isMockClient = config.googleClientId === "mock-google-client-id";

  // Real Google OAuth (auth-code flow)
  // Backend exchanges the code for ID token and verifies it
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        setBusy(true);
        // Send authorization code to backend for token exchange and verification
        await loginWithGoogleCode(codeResponse.code);
        onSuccess?.();
      } catch (e: any) {
        setErr(e.message || "Google authentication failed");
      } finally {
        setBusy(false);
      }
    },
    onError: () => setErr("Google authentication failed"),
  });

  const handleClick = async () => {
    setErr(null);
    if (isMockClient) {
      // No real Google client id — use a fake token against the mock backend.
      try {
        setBusy(true);
        await loginWithGoogle(`mock-token-${Math.random().toString(36).slice(2, 10)}`);
        onSuccess?.();
      } catch (e: any) {
        setErr(e.message || "Google authentication failed");
      } finally {
        setBusy(false);
      }
      return;
    }
    googleLogin();
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition hover:bg-accent disabled:opacity-60"
      >
        {busy ? (
          <LoadingSpinner />
        ) : (
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29 35.4 26.6 36 24 36c-5.3 0-9.7-3.4-11.3-8L6 32.7C9.3 39.4 16.1 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C40.9 36 44 30.5 44 24c0-1.2-.1-2.3-.4-3.5z"
            />
          </svg>
        )}
        Continue with Google
      </button>
      {err && <p className="text-sm text-destructive">{err}</p>}
    </div>
  );
}

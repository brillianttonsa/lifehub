// Tiny in-memory mock of the Node.js auth backend. Mirrors the documented
// endpoints so the UI can be exercised end-to-end without a server.
import type { AxiosRequestConfig } from "axios";

type MockUser = {
  id: string;
  email: string;
  fullName?: string;
  passwordHash?: string; // plain text here — it's a mock
  googleId?: string;
  provider: "local" | "google";
};

const STORAGE_KEY = "mock_auth_state_v1";

type State = {
  users: MockUser[];
  // sessionToken -> userId
  sessions: Record<string, string>;
  currentSession: string | null;
};

function load(): State {
  if (typeof window === "undefined") {
    return { users: [], sessions: {}, currentSession: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { users: [], sessions: {}, currentSession: null };
}

function save(state: State) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function ok(data: any, status = 200) {
  return { data, status, statusText: "OK", headers: {}, config: {} as any };
}

function fail(status: number, message: string) {
  const err: any = new Error(message);
  err.isAxiosError = true;
  err.response = { status, data: { message }, headers: {}, config: {} as any };
  return err;
}

function publicUser(u: MockUser) {
  return { id: u.id, email: u.email, fullName: u.fullName, provider: u.provider };
}

function startSession(state: State, userId: string) {
  const token = uuid();
  state.sessions[token] = userId;
  state.currentSession = token;
  save(state);
}

export async function handleMock(cfg: AxiosRequestConfig) {
  // Small artificial delay so loading states are visible.
  await new Promise((r) => setTimeout(r, 250));
  const state = load();
  const url = (cfg.url || "").replace(/^.*\/api/, "");
  const method = (cfg.method || "get").toLowerCase();
  const body =
    typeof cfg.data === "string" ? JSON.parse(cfg.data || "{}") : cfg.data || {};

  // --- Local auth ---
  if (url === "/auth/signup" && method === "post") {
    const { email, password, fullName } = body;
    if (!email || !password) throw fail(400, "Email and password are required");
    if (state.users.find((u) => u.email === email))
      throw fail(409, "Email already exists");
    const user: MockUser = {
      id: uuid(),
      email,
      fullName,
      passwordHash: password,
      provider: "local",
    };
    state.users.push(user);
    startSession(state, user.id);
    return ok({ user: publicUser(user) });
  }

  if (url === "/auth/login" && method === "post") {
    const { email, password } = body;
    const user = state.users.find((u) => u.email === email);
    if (!user || user.passwordHash !== password)
      throw fail(401, "Invalid email or password");
    startSession(state, user.id);
    return ok({ user: publicUser(user) });
  }

  if (url === "/auth/logout" && method === "post") {
    state.currentSession = null;
    save(state);
    return ok({ message: "Logged out" });
  }

  if (url === "/auth/refresh" && method === "post") {
    if (!state.currentSession) throw fail(401, "No session");
    return ok({ success: true });
  }

  if (url === "/auth/me" && method === "get") {
    if (!state.currentSession) throw fail(401, "Unauthorized");
    const userId = state.sessions[state.currentSession];
    const user = state.users.find((u) => u.id === userId);
    if (!user) throw fail(401, "Unauthorized");
    return ok({ user: publicUser(user) });
  }

  if (url === "/auth/forgot-password" && method === "post") {
    return ok({ message: "If account exists, reset link sent" });
  }

  if (url === "/auth/reset-password" && method === "post") {
    return ok({ message: "Password updated successfully" });
  }

  // --- Google OAuth ---
  if (url === "/auth/google/login" && method === "post") {
    const { token } = body;
    if (!token) throw fail(400, "Missing token");
    // Mock: derive a deterministic email from the token string.
    const email = `google_${token.slice(0, 6)}@example.com`;
    let user = state.users.find((u) => u.email === email);
    if (!user) {
      user = {
        id: uuid(),
        email,
        fullName: "Google User",
        googleId: `google-${token.slice(0, 10)}`,
        provider: "google",
      };
      state.users.push(user);
    }
    startSession(state, user.id);
    return ok({ user: publicUser(user) });
  }

  if (url === "/auth/google/auth-url" && method === "get") {
    return ok({ authUrl: "https://accounts.google.com/o/oauth2/v2/auth?mock=1" });
  }

  throw fail(404, `Mock endpoint not implemented: ${method.toUpperCase()} ${url}`);
}

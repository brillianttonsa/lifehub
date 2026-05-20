import { api } from "./api";

export type AuthUser = {
  id: string;
  email: string;
  fullName?: string;
  provider?: "local" | "google";
};

export const authService = {
  async signup(email: string, password: string, fullName?: string) {
    const { data } = await api.post<{ user: AuthUser }>("/auth/signup", {
      email,
      password,
      fullName,
    });
    return data.user;
  },
  async login(email: string, password: string) {
    const { data } = await api.post<{ user: AuthUser }>("/auth/login", {
      email,
      password,
    });
    return data.user;
  },
  async loginWithGoogle(token: string) {
    const { data } = await api.post<{ user: AuthUser }>("/auth/google/login", {
      token,
    });
    return data.user;
  },
  async loginWithGoogleCode(code: string) {
    const { data } = await api.post<{ user: AuthUser }>("/auth/google/callback", {
      code,
    });
    return data.user;
  },
  async logout() {
    await api.post("/auth/logout");
  },
  async refresh() {
    await api.post("/auth/refresh");
  },
  async me() {
    const { data } = await api.get<{ user: AuthUser }>("/auth/me");
    return data.user;
  },
  async forgotPassword(email: string) {
    const { data } = await api.post<{ message: string }>("/auth/forgot-password", {
      email,
    });
    return data;
  },
  async resetPassword(token: string, newPassword: string) {
    const { data } = await api.post<{ message: string }>("/auth/reset-password", {
      token,
      newPassword,
    });
    return data;
  },
};

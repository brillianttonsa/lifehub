import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { config } from "@/lib/config";
import { handleMock } from "./mockBackend";

export const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// --- Mock adapter ----------------------------------------------------------
if (config.useMock) {
  // Override axios's default adapter so every request is served by the
  // in-memory mock backend. Swap VITE_USE_MOCK=false to hit the real API.
  api.defaults.adapter = async (cfg) => handleMock(cfg);
}

// --- Auto refresh on 401 ---------------------------------------------------
let refreshing: Promise<void> | null = null;

async function doRefresh() {
  if (!refreshing) {
    refreshing = api
      .post("/auth/refresh")
      .then(() => undefined)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const url = original?.url || "";

    // Don't try to refresh while refreshing or on auth endpoints themselves.
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/signup") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    if (status === 401 && !original?._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        await doRefresh();
        return api(original);
      } catch {
        // fall through — caller decides what to do (typically redirect to /login)
      }
    }

    return Promise.reject(error);
  },
);

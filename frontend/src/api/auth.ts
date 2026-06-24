import axios, { AxiosError } from "axios";
import { ApiResponse } from "../types/auth";

// 1. Create the Axios instance pointing to your real backend route
const api = axios.create({
  baseURL: "/api", 
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 2. Automatically attach your login token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to extract error messages from your backend server
function handleApiError(error: unknown): never {
  if (error instanceof AxiosError && error.response?.data) {
    const backendMessage = error.response.data.message || error.response.data.error;
    if (backendMessage) {
      throw new Error(backendMessage);
    }
  }
  throw new Error(error instanceof Error ? error.message : "An unexpected network error occurred.");
}

// 3. Real HTTP Request Functions
export async function signIn(email: string, password: string): Promise<ApiResponse> {
  try {
    const response = await api.post<ApiResponse>("/auth/signin", { email, password });
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
    }
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function signUp(
  fullName: string,
  email: string,
  password: string
): Promise<ApiResponse> {
  try {
    const response = await api.post<ApiResponse>("/auth/signup", { fullName, email, password });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function sendVerificationCode(email: string): Promise<ApiResponse> {
  try {
    const response = await api.post<ApiResponse>("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function verifyCode(email: string, code: string): Promise<ApiResponse> {
  try {
    const response = await api.post<ApiResponse>("/verify-code", { email, code });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function resetPassword(
  email: string,
  code: string,
  password: string
): Promise<ApiResponse> {
  try {
    const response = await api.post<ApiResponse>("/auth/reset-password", { email, code, password });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear out the invalid token
      localStorage.removeItem("auth_token");
      
      // Force a redirect back to the login screen
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);
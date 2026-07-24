export type AuthView = "signin" | "signup" | "forgot" | "verify" | "reset";

export interface AuthFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
  newPassword: string;
  newConfirmPassword: string;
}

export interface FieldError {
  [key: string]: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  token?: string;
}
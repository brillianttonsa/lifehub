
export function validateEmail(email: string): string {
  if (!email) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
  return "";
}

export function validatePassword(password: string): string {
  if (!password) return "Password is required";
  if (password.length < 8) return "At least 8 characters";
  return "";
}
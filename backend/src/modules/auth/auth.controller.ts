import { Request, Response } from "express";
import { z } from "zod";
import { authService } from "./auth.service";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function register(req: Request, res: Response) {
  console.log('Register called with body:', req.body);
  const payload = registerSchema.parse(req.body);
  console.log('Parsed payload:', payload);
  const user = await authService.register(payload);
  console.log('User created:', user);
  res.status(201).json({ success: true, data: user });
}

export async function login(req: Request, res: Response) {
  const payload = loginSchema.parse(req.body);
  const tokens = await authService.login(payload);
  res.json({ success: true, data: tokens });
}

export async function refreshToken(req: Request, res: Response) {
  const payload = refreshSchema.parse(req.body);
  const tokens = await authService.refresh(payload.refreshToken);
  res.json({ success: true, data: tokens });
}

export async function logout(req: Request, res: Response) {
  const payload = logoutSchema.parse(req.body);
  const output = await authService.logout(payload.refreshToken);
  res.json({ success: true, data: output });
}

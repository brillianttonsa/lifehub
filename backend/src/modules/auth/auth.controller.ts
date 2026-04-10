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

export async function register(req: Request, res: Response) {
  const payload = registerSchema.parse(req.body);
  const user = await authService.register(payload);
  res.status(201).json({ success: true, data: user });
}

export async function login(req: Request, res: Response) {
  const payload = loginSchema.parse(req.body);
  const tokens = await authService.login(payload);
  res.json({ success: true, data: tokens });
}

import { Router } from "express";
import { asyncHandler } from "../../shared/http";
import { login, refreshToken, logout, register } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.post("/refresh", asyncHandler(refreshToken));
authRouter.post("/logout", asyncHandler(logout));

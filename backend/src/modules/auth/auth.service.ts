import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors";

type AuthPayload = {
  userId: string;
};

export class AuthService {
  async register(input: { email: string; password: string; fullName: string }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError("Email already registered", 409, "EMAIL_EXISTS");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        fullName: input.fullName,
        passwordHash,
      },
      select: { id: true, email: true, fullName: true },
    });

    await prisma.workspace.create({
      data: {
        type: "PERSONAL",
        name: `${input.fullName}'s Workspace`,
        ownerUserId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    return user;
  }

  async login(input: { email: string; password: string }) {
    console.log('Login attempt for:', input.email);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    console.log('User found:', !!user);
    if (!user || user.deletedAt) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    console.log('Password ok:', ok);
    if (!ok) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const accessToken = jwt.sign({ userId: user.id }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    await prisma.authSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: await bcrypt.hash(refreshToken, 10),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    let payload: AuthPayload;
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as AuthPayload;
    } catch {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    const session = await prisma.authSession.findFirst({
      where: {
        userId: payload.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!session) {
      throw new AppError("Refresh session not found or revoked", 401, "SESSION_NOT_FOUND");
    }

    const valid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!valid) {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    await prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const accessToken = jwt.sign({ userId: payload.userId }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
    const newRefreshToken = jwt.sign({ userId: payload.userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    await prisma.authSession.create({
      data: {
        userId: payload.userId,
        refreshTokenHash: await bcrypt.hash(newRefreshToken, 10),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    let payload: AuthPayload;
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as AuthPayload;
    } catch {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    const session = await prisma.authSession.findFirst({
      where: {
        userId: payload.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!session) {
      throw new AppError("Refresh session not found or already revoked", 401, "SESSION_NOT_FOUND");
    }

    await prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return { loggedOut: true };
  }
}

export const authService = new AuthService();

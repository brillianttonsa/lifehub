import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { db } from '../../db';
import { users } from '../../db/schema/auth/users';
import { refreshTokens } from '../../db/schema/auth/refreshToken';
import { passwordResetTokens } from '../../db/schema/auth/passwordResetTokens';
import { hashToken, hashPassword, comparePassword } from '../../common/utils/hash';
import { signAccessToken, signRefreshToken, verifyToken } from '../../common/utils/jwt';
import { setAuthCookies as applyAuthCookies, clearAuthCookies as clearAuthCookiesUtil } from '../../common/utils/cookies';
import { env } from '../../config/env';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  async signup(email: string, password: string, fullName: string) {
    const hashed = await hashPassword(password);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    const [user] = await db
      .insert(users)
      .values({
        email,
        passwordHash: hashed,
        fullName,
        provider: 'local',
      })
      .returning();

    return user;
  }

  async login(email: string, password: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!user.passwordHash) {
      throw new HttpException(
        'This account uses OAuth login. Please login with your OAuth provider.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    const hashedToken = hashToken(refreshToken);

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: hashedToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return { user, accessToken, refreshToken };
  }

  async refresh(oldToken?: string) {
    if (!oldToken) {
      throw new HttpException('No token', HttpStatus.UNAUTHORIZED);
    }

    const decoded = verifyToken(oldToken, env.JWT_REFRESH_SECRET);
    const hashed = hashToken(oldToken);

    const tokenRecord = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, hashed),
    });

    if (!tokenRecord || tokenRecord.revoked) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
    }

    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.id, tokenRecord.id));

    const newAccess = signAccessToken(decoded.userId);
    const newRefresh = signRefreshToken(decoded.userId);
    const newHashed = hashToken(newRefresh);

    await db.insert(refreshTokens).values({
      userId: decoded.userId,
      tokenHash: newHashed,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return { newAccess, newRefresh };
  }

  async forgotPassword(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return;
    }

    const rawToken = randomBytes(32).toString('hex');
    const hashed = hashToken(rawToken);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashed,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    });

    return rawToken;
  }

  async resetPassword(token: string, newPassword: string) {
    const hashed = hashToken(token);

    const record = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.tokenHash, hashed),
    });

    if (!record || record.used) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    if (new Date() > record.expiresAt) {
      throw new HttpException('Token expired', HttpStatus.BAD_REQUEST);
    }

    const newHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ passwordHash: newHash })
      .where(eq(users.id, record.userId));

    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, record.id));

    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.userId, record.userId));
  }

  async getUserById(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    applyAuthCookies(res, accessToken, refreshToken);
  }

  clearAuthCookies(res: Response) {
    clearAuthCookiesUtil(res);
  }
}

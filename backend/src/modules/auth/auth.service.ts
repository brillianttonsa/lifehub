import { db } from '../../db';
import { users } from '../../db/schema/auth/users';
import { refreshTokens } from '../../db/schema/auth/refreshToken';
import { passwordResetTokens } from '../../db/schema/auth/passwordResetTokens';
import { hashToken, hashPassword, comparePassword } from '../../utils/hash';
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from '../../utils/jwt';
import { env } from '../../config/env';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { AppError } from '../../utils/AppError';

export class AuthService {
  // signup
  static async signup(email: string, password: string, fullName?: string) {
    const hashed = await hashPassword(password);

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

  //  login
  static async login(email: string, password: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) throw new AppError('User not found', 404);

    if (!user.passwordHash) {
      throw new AppError(
        'This account uses OAuth login. Please login with your OAuth provider.',
        400,
      );
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    const hashed = hashToken(refreshToken);

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: hashed,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return { user, accessToken, refreshToken };
  }

  // refresh
  static async refresh(oldToken: string) {
    const decoded = verifyToken(oldToken, env.JWT_REFRESH_SECRET);

    const hashed = hashToken(oldToken);

    const tokenRecord = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, hashed),
    });

    if (!tokenRecord || tokenRecord.revoked) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new AppError('Token expired', 401);
    }

    // ROTATE TOKEN
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

  // forgot password
  static async forgotPassword(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) return; // avoid leaking info

    const rawToken = randomBytes(32).toString('hex');
    const hashed = hashToken(rawToken);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashed,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 min
    });

    // TODO: send email
    return rawToken;
  }

  // reset password
  static async resetPassword(token: string, newPassword: string) {
    const hashed = hashToken(token);

    const record = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.tokenHash, hashed),
    });

    if (!record || record.used) {
      throw new AppError('Invalid token', 400);
    }

    if (new Date() > record.expiresAt) {
      throw new AppError('Token expired', 400);
    }

    const newHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ passwordHash: newHash })
      .where(eq(users.id, record.userId));

    // mark token used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, record.id));

    // revoke ALL sessions
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.userId, record.userId));
  }

  // get current user
  static async getUserById(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) throw new AppError('User not found', 404);

    return user;
  }
}

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import pool from "../../config/db";
import { AppError } from "../../shared/errors";
import { v4 as uuidv4 } from "uuid";

type AuthPayload = {
  userId: string;
};

export class AuthService {
  async register(input: { email: string; password: string; fullName: string }) {
    const client = await pool.connect();
    const userId = uuidv4();

    try {
      await client.query("BEGIN");

      // check existing user
      const existingRes = await client.query(
        `SELECT "id" FROM "User" WHERE "email" = $1 AND "deleted_at" IS NULL LIMIT 1`,
        [input.email]
      );

      if (existingRes.rows.length > 0) {
        throw new AppError("Email already registered", 409, "EMAIL_EXISTS");
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      // create user
      const userRes = await client.query(
        `INSERT INTO "User" ("id", "email", "full_name", "password_hash")
         VALUES ($1, $2, $3, $4)
         RETURNING "id" as "id", "email" as "email", "full_name" as "full_name"`,
        [userId, input.email, input.fullName, passwordHash]
      );

      const user = userRes.rows[0];

      
      await client.query("COMMIT");

      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async login(input: { email: string; password: string }) {
    const userRes = await pool.query(
      `SELECT "id" as "id", "email" as "email", "password_hash" as "password_hash", "deleted_at" as "deleted_at"
       FROM "User"
       WHERE "email" = $1
       LIMIT 1`,
      [input.email]
    );

    const user = userRes.rows[0];

    if (!user || user.deleted_at) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const ok = await bcrypt.compare(input.password, user.password_hash);

    if (!ok) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const accessToken = jwt.sign({ userId: user.id }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    const sessionId = uuidv4();

    await pool.query(
      `INSERT INTO "AuthSession" ( "id", "user_id", "refresh_token_hash", "expires_at")
       VALUES ($1, $2, $3, $4)`,
      [
        sessionId,
        user.id,
        await bcrypt.hash(refreshToken, 10),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ]
    );

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    let payload: AuthPayload;

    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as AuthPayload;
    } catch {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    const sessionRes = await pool.query(
      `SELECT * FROM "AuthSession"
       WHERE "user_id" = $1
       AND "revoked_at" IS NULL
       AND "expires_at" > NOW()
       ORDER BY "created_at" DESC
       LIMIT 1`,
      [payload.userId]
    );

    const session = sessionRes.rows[0];

    if (!session) {
      throw new AppError("Session not found", 401, "SESSION_NOT_FOUND");
    }

    const valid = await bcrypt.compare(refreshToken, session.refresh_token_hash);

    if (!valid) {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    // revoke old session
    await pool.query(
      `UPDATE "AuthSession" SET "revoked_at" = NOW() WHERE "id" = $1`,
      [session.id]
    );

    const accessToken = jwt.sign({ userId: payload.userId }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    const newRefreshToken = jwt.sign(
      { userId: payload.userId },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
      }
    );

    await pool.query(
      `INSERT INTO "AuthSession" ("user_id", "refresh_token_hash", "expires_at")
       VALUES ($1, $2, $3)`,
      [
        payload.userId,
        await bcrypt.hash(newRefreshToken, 10),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ]
    );

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

    const sessionRes = await pool.query(
      `SELECT "id" as "id" FROM "AuthSession"
       WHERE "user_id" = $1
       AND "revoked_at" IS NULL
       AND "expires_at" > NOW()
       ORDER BY "created_at" DESC
       LIMIT 1`,
      [payload.userId]
    );

    const session = sessionRes.rows[0];

    if (!session) {
      throw new AppError("Session not found", 401, "SESSION_NOT_FOUND");
    }

    await pool.query(
      `UPDATE "AuthSession" SET "revoked_at" = NOW() WHERE "id" = $1`,
      [session.id]
    );

    return { loggedOut: true };
  }
}

export const authService = new AuthService();